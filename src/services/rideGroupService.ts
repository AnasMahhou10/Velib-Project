import { withRideMetrics } from '../lib/enrichRide';
import { prisma } from '../lib/prisma';
import type { CreateRideGroupInput } from '../lib/schemas/rideGroup';

const userPublicSelect = {
  id: true,
  username: true,
  email: true,
} as const;

const rideInclude = {
  creator: { select: userPublicSelect },
  startStation: true,
  endStation: true,
  participants: {
    include: {
      user: { select: userPublicSelect },
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

export async function createRideGroup(
  input: CreateRideGroupInput,
  creatorId: number,
) {
  const { title, departureTime, startStationId, endStationId } = input;

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
