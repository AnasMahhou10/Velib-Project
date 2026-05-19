import { describe, expect, it } from 'vitest';
import { computeRideMetrics, haversineKm } from '../rideMetrics';

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    expect(haversineKm(48.86, 2.35, 48.86, 2.35)).toBe(0);
  });

  it('returns a positive distance for two Paris points', () => {
    const km = haversineKm(48.8566, 2.3522, 48.8738, 2.295);
    expect(km).toBeGreaterThan(3);
    expect(km).toBeLessThan(8);
  });
});

describe('computeRideMetrics', () => {
  it('returns null without start or end', () => {
    expect(computeRideMetrics(null, { lat: 48.86, lng: 2.35 })).toBeNull();
    expect(computeRideMetrics({ lat: 48.86, lng: 2.35 }, null)).toBeNull();
  });

  it('computes distance, duration and calories', () => {
    const metrics = computeRideMetrics(
      { lat: 48.8566, lng: 2.3522 },
      { lat: 48.8738, lng: 2.295 },
    );
    expect(metrics).not.toBeNull();
    expect(metrics!.distanceKm).toBeGreaterThan(0);
    expect(metrics!.estimatedMinutes).toBeGreaterThanOrEqual(1);
    expect(metrics!.calories).toBe(Math.round(metrics!.distanceKm * 30));
  });
});
