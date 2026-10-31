import './style.css';
import { normalizeDeg } from './geo.ts';
import { loadPeaks, peaksFrom, type Peak, type SeenPeak } from './peaks.ts';
import { draw, type View } from './render.ts';
import { attachSimulator } from './simulator.ts';
import { VIEWPOINTS } from './viewpoints.ts';

const canvas = document.querySelector<HTMLCanvasElement>('#sky')!;
const ctx = canvas.getContext('2d')!;
const viewpointSelect = document.querySelector<HTMLSelectElement>('#viewpoint')!;
const rangeSelect = document.querySelector<HTMLSelectElement>('#range')!;
const langButton = document.querySelector<HTMLButtonElement>('#lang')!;
const status = document.querySelector<HTMLElement>('#status')!;

// pitch 5 = look slightly up, so the mountains sit low and labels have room above them.
const view: View = { heading: 0, pitch: 5, fov: 60, lang: 'en' };
let allPeaks: Peak[] = [];
let seen: SeenPeak[] = [];

for (const vp of VIEWPOINTS) viewpointSelect.add(new Option(`${vp.name} · ${vp.ne}`, vp.id));

function currentViewpoint() {
  return VIEWPOINTS.find((vp) => vp.id === viewpointSelect.value) ?? VIEWPOINTS[0];
}

function recompute() {
  seen = peaksFrom(currentViewpoint(), allPeaks, Number(rangeSelect.value) * 1000);
  requestDraw();
}

let drawPending = false;
function requestDraw() {
  if (drawPending) return;
  drawPending = true;
  requestAnimationFrame(() => {
    drawPending = false;
    // Draw at the screen's real pixel density so text stays sharp on phones.
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, w, h, view, seen);
    const dir = Math.round(normalizeDeg(view.heading));
    status.textContent = `Facing ${dir}° · zoom ${Math.round(view.fov)}° · ${seen.length} peaks in range`;
  });
}

viewpointSelect.addEventListener('change', () => {
  view.heading = currentViewpoint().lookAt;
  recompute();
});
rangeSelect.addEventListener('change', recompute);
langButton.addEventListener('click', () => {
  view.lang = view.lang === 'en' ? 'ne' : 'en';
  langButton.textContent = view.lang === 'en' ? 'नेपाली' : 'English';
  requestDraw();
});
window.addEventListener('resize', requestDraw);
attachSimulator(canvas, view, requestDraw);

view.heading = currentViewpoint().lookAt;
status.textContent = 'Loading peaks…';
loadPeaks()
  .then((peaks) => {
    allPeaks = peaks;
    recompute();
  })
  .catch((err) => (status.textContent = String(err)));
