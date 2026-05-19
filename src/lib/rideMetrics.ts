/** Facteur pour approximer la distance réelle vélo vs ligne droite */
const ROAD_FACTOR = 1.25;
/** Vélo loisir en ville (kcal / km) */
const KCAL_PER_KM = 30;
/** Vitesse moyenne Vélib' en ville (km/h) */
const AVG_SPEED_KMH = 14;

export type StationCoords = {
  lat: number;
  lng: number;
};

export type RideMetrics = {
  distanceKm: number;
  estimatedMinutes: number;
  calories: number;
};

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function computeRideMetrics(
  start: StationCoords | null | undefined,
  end: StationCoords | null | undefined,
): RideMetrics | null {
  if (
    !start ||
    !end ||
    Number.isNaN(start.lat) ||
    Number.isNaN(start.lng) ||
    Number.isNaN(end.lat) ||
    Number.isNaN(end.lng)
  ) {
    return null;
  }

  const straightKm = haversineKm(start.lat, start.lng, end.lat, end.lng);
  const distanceKm = Math.round(straightKm * ROAD_FACTOR * 100) / 100;
  const estimatedMinutes = Math.max(
    1,
    Math.round((distanceKm / AVG_SPEED_KMH) * 60),
  );
  const calories = Math.round(distanceKm * KCAL_PER_KM);

  return { distanceKm, estimatedMinutes, calories };
}

export function formatDistance(km: number) {
  return `${km.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}

export function formatCalories(kcal: number) {
  return `${kcal.toLocaleString('fr-FR')} kcal`;
}

export function distanceLabel(km: number) {
  if (km < 2) return 'Courte';
  if (km <= 5) return 'Moyenne';
  return 'Longue';
}
