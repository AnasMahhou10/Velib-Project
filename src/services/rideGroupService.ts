import { withRideMetrics } from '../lib/enrichRide';
import { prisma } from '../lib/prisma';
import type { CreateRideGroupInput } from '../lib/schemas/rideGroup';

const rideInclude = {
  creator: true,
  startStation: true,
  endStation: true,
  participants: {
    include: {
      user: true,
    },
  },
} as const;

export async function listRideGroups() {
  const rideGroups = await prisma.rideGroup.findMany({
    orderBy: { departureTime: 'asc' },
    include: rideInclude,
  });
  return rideGroups.map(withRideMetrics);
}

export async function createRideGroup(input: CreateRideGroupInput) {
  const { title, departureTime, creatorId, startStationId, endStationId } = input;

  await prisma.user.upsert({
    where: { id: creatorId },
    update: {},
    create: {
      id: creatorId,
      username: `user${creatorId}`,
      email: `user${creatorId}@example.com`,
    },
  });

  return prisma.rideGroup.create({
    data: {
      title,
      departureTime: new Date(departureTime),
      creator: { connect: { id: creatorId } },
      startStation: { connect: { id: startStationId } },
      endStation: { connect: { id: endStationId } },
    },
    include: rideInclude,
  });
}

export async function joinRideGroup(rideGroupId: number, userId: number) {
  return prisma.participation.create({
    data: {
      rideGroup: { connect: { id: rideGroupId } },
      user: { connect: { id: userId } },
    },
  });
}
