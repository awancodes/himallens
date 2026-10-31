// Downloads named mountain peaks around Nepal from OpenStreetMap (via the Overpass API)
// and saves a small JSON file the app loads. Run it with:  npm run fetch-peaks
//
// Data © OpenStreetMap contributors, ODbL licence. The app must show this credit.

import { mkdir, writeFile } from 'node:fs/promises';

// Box around Nepal plus the Tibet / India border band, so Everest, Cho Oyu, Shishapangma,
// Kangchenjunga etc. are included.  south, west, north, east
const BBOX = [26.3, 79.9, 31.0, 88.6].join(',');

const QUERY = `
[out:json][timeout:180];
node["natural"="peak"]["name"]["ele"](${BBOX});
out body;
`;

const OUT_FILE = 'public/data/peaks-nepal.json';

interface OsmNode {
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

/** OSM "ele" is free text: "8848.86", "8,848 m", "29029 ft" ... turn it into metres. */
function parseEle(raw: string): number | null {
  const n = parseFloat(raw.replace(/,/g, ''));
  if (!Number.isFinite(n)) return null;
  return /ft|feet|'/i.test(raw) ? n * 0.3048 : n;
}

// Latin letters (with accents like ā, ṅ), digits and simple punctuation.
const LATIN = /^[\p{Script=Latin}\p{N}\s'’().,\-/]+$/u;
const DEVANAGARI = /\p{Script=Devanagari}/u;

/** Peaks in Tibet often only have a Chinese `name`, so look for a Latin-letter one. */
function englishName(tags: Record<string, string>): string | null {
  for (const key of ['name:en', 'int_name', 'name:zh_pinyin', 'name:zh-Latn-pinyin', 'name']) {
    const value = tags[key]?.trim();
    // "6510" is a height, not a name.
    if (value && LATIN.test(value) && !/^\d+$/.test(value)) return value;
  }
  return null;
}

function nepaliName(tags: Record<string, string>): string | undefined {
  if (tags['name:ne']) return tags['name:ne'];
  return DEVANAGARI.test(tags.name) ? tags.name : undefined;
}

const res = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'HimalLens/0.1 (student learning project)',
  },
  body: 'data=' + encodeURIComponent(QUERY),
});
if (!res.ok) throw new Error(`Overpass error ${res.status}: ${await res.text()}`);

const { elements } = (await res.json()) as { elements: OsmNode[] };

const peaks = elements
  .map((el) => {
    const ele = parseEle(el.tags.ele);
    if (ele === null || ele < 1000 || ele > 8900) return null; // skip junk values
    const name = englishName(el.tags);
    if (!name) return null;
    return {
      name,
      ne: nepaliName(el.tags), // Nepali name, when someone has added it to OSM
      lat: +el.lat.toFixed(5),
      lon: +el.lon.toFixed(5),
      ele: Math.round(ele),
    };
  })
  .filter((p) => p !== null)
  .sort((a, b) => b.ele - a.ele);

await mkdir('public/data', { recursive: true });
await writeFile(OUT_FILE, JSON.stringify(peaks));

const withNepali = peaks.filter((p) => p.ne).length;
console.log(`Saved ${peaks.length} peaks (${withNepali} with Nepali names) to ${OUT_FILE}`);
console.log('Highest five:', peaks.slice(0, 5).map((p) => `${p.name} ${p.ele} m`).join(', '));
