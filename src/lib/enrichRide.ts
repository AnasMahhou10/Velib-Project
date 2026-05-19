import { computeRideMetrics, type RideMetrics } from './rideMetrics';

type StationLike = {
  lat: number;
  lng: number;
  name?: string;
  id?: number;
};

export type RideWithStations = {
  startStation?: StationLike | null;
  endStation?: StationLike | null;
};

export function withRideMetrics<T extends RideWithStations>(ride: T) {
  const metrics = computeRideMetrics(
    ride.startStation ?? null,
    ride.endStation ?? null,
  );
  return { ...ride, metrics };
}

export function sumMetrics(rides: { metrics: RideMetrics | null }[]) {
  return rides.reduce(
    (acc, ride) => {
      if (!ride.metrics) return acc;
      acc.totalKm += ride.metrics.distanceKm;
      acc.totalCalories += ride.metrics.calories;
      acc.totalMinutes += ride.metrics.estimatedMinutes;
      acc.countWithMetrics += 1;
      if (ride.metrics.distanceKm > acc.longestKm) {
        acc.longestKm = ride.metrics.distanceKm;
      }
      return acc;
    },
    {
      totalKm: 0,
      totalCalories: 0,
      totalMinutes: 0,
      countWithMetrics: 0,
      longestKm: 0,
    },
  );
}
