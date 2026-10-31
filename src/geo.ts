// All the maths that turns "a peak's position on Earth" into "where it appears in your view".
// Angles in the outside world are degrees; Math.sin/cos/atan2 need radians.

/** Mean radius of the Earth in metres. */
export const EARTH_RADIUS = 6_371_000;

/**
 * Light bends slightly downward through the air, so far mountains look a bit higher than
 * pure geometry says. Surveyors use about 0.13 for this "refraction coefficient".
 */
export const REFRACTION = 0.13;

export interface LatLon {
  lat: number;
  lon: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance in metres between two points (haversine formula). */
export function distance(a: LatLon, b: LatLon): number {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat);
  const Δλ = toRad(b.lon - a.lon);
  const h = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h));
}

/** Compass direction from a to b: 0 = north, 90 = east, 180 = south, 270 = west. */
export function bearing(a: LatLon, b: LatLon): number {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lon - a.lon);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return normalizeDeg(toDeg(Math.atan2(y, x)));
}

/**
 * How many metres a far object "sinks" below a flat line because the Earth is round,
 * minus the bit that refraction gives back. At 100 km this is about 683 m.
 */
export function curvatureDrop(dist: number, k = REFRACTION): number {
  return ((dist * dist) / (2 * EARTH_RADIUS)) * (1 - k);
}

/**
 * Angle (degrees) above your eye level at which you see a point that is `dist` metres away
 * and `targetHeight` metres high, when your eyes are at `observerHeight` metres.
 */
export function elevationAngle(observerHeight: number, targetHeight: number, dist: number): number {
  const rise = targetHeight - observerHeight - curvatureDrop(dist);
  return toDeg(Math.atan2(rise, dist));
}

/** Wrap any angle into 0 ≤ angle < 360. */
export function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Signed difference from `from` to `to`, in -180..180.
 * Example: from 350° to 10° is +20° (turn right), not -340°.
 */
export function angleDiff(from: number, to: number): number {
  return normalizeDeg(to - from + 180) - 180;
}
