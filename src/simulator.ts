// Desktop "pretend phone": drag to look around, scroll to zoom, arrow keys also work.
// In milestone 2 the real compass and gyroscope will move the view instead.

import { normalizeDeg } from './geo.ts';
import type { View } from './render.ts';

const MIN_FOV = 8;
const MAX_FOV = 120;

export function attachSimulator(canvas: HTMLCanvasElement, view: View, onChange: () => void) {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const pxPerDeg = () => canvas.clientWidth / view.fov;

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    // Dragging the scene right means turning your head left, hence the minus sign.
    view.heading = normalizeDeg(view.heading - (e.clientX - lastX) / pxPerDeg());
    view.pitch = clamp(view.pitch + (e.clientY - lastY) / pxPerDeg(), -10, 30);
    lastX = e.clientX;
    lastY = e.clientY;
    onChange();
  });

  canvas.addEventListener('pointerup', () => (dragging = false));

  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      view.fov = clamp(view.fov * (e.deltaY > 0 ? 1.1 : 1 / 1.1), MIN_FOV, MAX_FOV);
      onChange();
    },
    { passive: false },
  );

  window.addEventListener('keydown', (e) => {
    const step = view.fov / 20;
    if (e.key === 'ArrowLeft') view.heading = normalizeDeg(view.heading - step);
    else if (e.key === 'ArrowRight') view.heading = normalizeDeg(view.heading + step);
    else if (e.key === 'ArrowUp') view.pitch = clamp(view.pitch + step, -10, 30);
    else if (e.key === 'ArrowDown') view.pitch = clamp(view.pitch - step, -10, 30);
    else if (e.key === '+' || e.key === '=') view.fov = clamp(view.fov / 1.1, MIN_FOV, MAX_FOV);
    else if (e.key === '-') view.fov = clamp(view.fov * 1.1, MIN_FOV, MAX_FOV);
    else return;
    onChange();
  });
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
