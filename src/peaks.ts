import { angleDiff, bearing, distance, elevationAngle } from './geo.ts';
import { EYE_HEIGHT, type Viewpoint } from './viewpoints.ts';

export interface Peak {
  name: string;
  /** Nepali name, if OpenStreetMap has one. */
  ne?: string;
  lat: number;
  lon: number;
  ele: number;
}

/** A peak as seen from one viewpoint. */
export interface SeenPeak extends Peak {
  /** Compass direction to the peak, degrees. */
  bearing: number;
  /** Metres away. */
  dist: number;
  /** Degrees above eye level. */
  angle: number;
}

export async function loadPeaks(): Promise<Peak[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/peaks-nepal.json`);
  if (!res.ok) throw new Error(`Could not load peaks (${res.status})`);
  return res.json();
}

/** Work out direction, distance and angle of every peak within `maxDist` metres. */
export function peaksFrom(view: Viewpoint, peaks: Peak[], maxDist: number): SeenPeak[] {
  const eye = view.ele + EYE_HEIGHT;
  const seen: SeenPeak[] = [];
  for (const p of peaks) {
    const dist = distance(view, p);
    if (dist < 300 || dist > maxDist) continue; // skip the hill you're standing on
    seen.push({ ...p, bearing: bearing(view, p), dist, angle: elevationAngle(eye, p.ele, dist) });
  }
  return hideBlockedPeaks(seen, eye);
}

/** Mountain sides drop roughly 0.7 m for every metre sideways (a slope of about 35°). */
const FLANK_SLOPE = 0.7;

/**
 * ROUGH GUESS until we have real terrain (milestone 3). Pretend every nearer peak is a cone.
 * Look at how high that cone's side is in the exact direction of peak `p`: if it rises
 * above `p` in your view, `p` is probably hidden behind it.
 */
function hideBlockedPeaks(peaks: SeenPeak[], eye: number): SeenPeak[] {
  const nearFirst = [...peaks].sort((a, b) => a.dist - b.dist);
  return nearFirst.filter((p, i) =>
    !nearFirst.slice(0, i).some((q) => {
      const offDeg = Math.abs(angleDiff(q.bearing, p.bearing));
      if (offDeg > 10) return false;
      const sideways = q.dist * offDeg * (Math.PI / 180); // metres to the side, at q's distance
      const flankHeight = q.ele - FLANK_SLOPE * sideways;
      return elevationAngle(eye, flankHeight, q.dist) > p.angle;
    }),
  );
}
