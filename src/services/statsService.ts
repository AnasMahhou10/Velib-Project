import { sumMetrics, withRideMetrics } from '../lib/enrichRide';
import { prisma } from '../lib/prisma';

export async function getUserStats(userId: number) {
  const rideGroups = await prisma.rideGroup.findMany({
    where: {
      OR: [
        { participants: { some: { userId } } },
        { creatorId: userId },
      ],
    },
    orderBy: { departureTime: 'desc' },
    include: {
      creator: true,
      startStation: true,
      endStation: true,
      participants: { include: { user: true } },
    },
  });

  const rides = rideGroups.map(withRideMetrics);
  const totals = sumMetrics(rides);
  const now = Date.now();

  const upcoming = rides.filter(
    (r) => new Date(r.departureTime).getTime() >= now,
  );
  const past = rides.filter((r) => new Date(r.departureTime).getTime() < now);

  return {
    userId,
    totals: {
      ...totals,
      totalKm: Math.round(totals.totalKm * 10) / 10,
      rideCount: rides.length,
      avgKm:
        totals.countWithMetrics > 0
          ? Math.round((totals.totalKm / totals.countWithMetrics) * 10) / 10
          : 0,
    },
    upcomingCount: upcoming.length,
    pastCount: past.length,
    rides,
  };
}
