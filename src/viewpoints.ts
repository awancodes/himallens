// Famous viewpoints to test from. Coordinates are approximate: check them on a map
// (e.g. openstreetmap.org, right click → "Show address") and fix them if they're off!

export interface Viewpoint {
  id: string;
  name: string;
  ne: string;
  lat: number;
  lon: number;
  /** Ground height in metres. We add eye height on top. */
  ele: number;
  /** Which way to face when you open this viewpoint (degrees from north). */
  lookAt: number;
}

export const VIEWPOINTS: Viewpoint[] = [
  { id: 'nagarkot', name: 'Nagarkot', ne: 'नगरकोट', lat: 27.715, lon: 85.52, ele: 2100, lookAt: 30 },
  { id: 'chandragiri', name: 'Chandragiri Hills', ne: 'चन्द्रागिरि', lat: 27.677, lon: 85.205, ele: 2520, lookAt: 20 },
  { id: 'shivapuri', name: 'Shivapuri Peak', ne: 'शिवपुरी', lat: 27.817, lon: 85.386, ele: 2730, lookAt: 10 },
  { id: 'phulchoki', name: 'Phulchoki', ne: 'फूलचोकी', lat: 27.571, lon: 85.403, ele: 2760, lookAt: 10 },
  { id: 'swayambhu', name: 'Swayambhunath', ne: 'स्वयम्भूनाथ', lat: 27.715, lon: 85.29, ele: 1400, lookAt: 0 },
  { id: 'sarangkot', name: 'Sarangkot', ne: 'सराङकोट', lat: 28.244, lon: 83.949, ele: 1600, lookAt: 10 },
  { id: 'poonhill', name: 'Poon Hill', ne: 'पुन हिल', lat: 28.4, lon: 83.689, ele: 3210, lookAt: 0 },
  { id: 'kalapatthar', name: 'Kala Patthar', ne: 'काला पत्थर', lat: 27.996, lon: 86.829, ele: 5644, lookAt: 70 },
];

/** How high your eyes are above the ground, in metres. */
export const EYE_HEIGHT = 2;
