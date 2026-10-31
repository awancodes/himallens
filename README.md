# HimalLens · हिमाल लेन्स

Point your phone at the Himalaya and see which peak is which. Made in Nepal, for Nepal.

## Run it

```bash
npm install
npm run dev        # open http://localhost:5173
npm test           # check the maths
npm run fetch-peaks  # re-download peak data from OpenStreetMap
```

Drag to look around, scroll (or `+` / `-`) to zoom, arrow keys also work.

## How it works

| File | What it does |
|---|---|
| `src/geo.ts` | The maths: distance (haversine), bearing, angle above the horizon with Earth curvature + refraction |
| `src/peaks.ts` | Loads peaks, works out where each one appears, guesses which are hidden behind nearer peaks |
| `src/render.ts` | Draws the sky, compass strip and labels on a `<canvas>` |
| `src/simulator.ts` | Desktop "pretend phone": drag / scroll / keys move the view |
| `src/viewpoints.ts` | Nagarkot, Chandragiri, Poon Hill, Kala Patthar … |
| `scripts/fetch-peaks.ts` | Downloads named peaks around Nepal from OpenStreetMap |

## Try it yourself

1. **Check a viewpoint.** Coordinates in `src/viewpoints.ts` are approximate. Find the Nagarkot
   view tower on openstreetmap.org, copy its real lat/lon, and see what moves.
2. **Add your own rooftop** as a viewpoint, then check the view on a clear morning.
3. **Change `FLANK_SLOPE`** in `src/peaks.ts` from 0.7 to 0.3 and to 1.5. What happens to
   Everest from Nagarkot? Why?
4. **Write a test** in `tests/geo.test.ts`: the bearing from Kathmandu to Pokhara should be
   roughly west-north-west (about 290°).
5. **Add Nepali names to OpenStreetMap.** Only ~75 peaks have a `name:ne` tag. Every one you add
   on openstreetmap.org shows up in HimalLens (and in every other map) after `npm run fetch-peaks`.

## Roadmap

- [x] M1 — peaks on a 360° strip, desktop simulator
- [ ] M2 — real phone GPS + compass, "drag to align" calibration
- [ ] M3 — terrain silhouette from elevation data, proper hidden-peak detection
- [ ] M4 — camera view + save labelled photo
- [ ] M5 — Nepali UI, trek packs, offline PWA
- [ ] M6 — Android app (Capacitor)

Peak data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL.
