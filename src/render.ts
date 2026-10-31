import { angleDiff, normalizeDeg } from './geo.ts';
import type { SeenPeak } from './peaks.ts';

export interface View {
  /** Direction the centre of the screen faces, degrees from north. */
  heading: number;
  /** Elevation angle at the centre of the screen, degrees. */
  pitch: number;
  /** Horizontal field of view, degrees. Smaller = zoomed in. */
  fov: number;
  lang: 'en' | 'ne';
}

const FONT = `system-ui, 'Nirmala UI', 'Noto Sans Devanagari', sans-serif`;
const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const LABEL_TOP = 56;
const ROW_HEIGHT = 38;
const MAX_ROWS = 7;

export function draw(ctx: CanvasRenderingContext2D, w: number, h: number, view: View, peaks: SeenPeak[]) {
  const pxPerDeg = w / view.fov;
  // Screen position of a direction + elevation angle.
  const toX = (bearing: number) => w / 2 + angleDiff(view.heading, bearing) * pxPerDeg;
  const toY = (angle: number) => h / 2 - (angle - view.pitch) * pxPerDeg;

  drawSky(ctx, w, h, toY(0));
  drawCompass(ctx, w, view, toX);

  const visible = peaks.filter((p) => Math.abs(angleDiff(view.heading, p.bearing)) < view.fov / 2 + 5);
  drawLabels(ctx, w, visible, view.lang, toX, toY);
}

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number, horizonY: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, '#0b1e3a');
  sky.addColorStop(1, '#4a78a8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#1d2b22';
  ctx.fillRect(0, horizonY, w, h - horizonY);

  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(w, horizonY);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawCompass(ctx: CanvasRenderingContext2D, w: number, view: View, toX: (b: number) => number) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, w, 34);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const first = Math.floor((view.heading - view.fov / 2) / 5) * 5;
  for (let deg = first; deg <= view.heading + view.fov / 2 + 5; deg += 5) {
    const b = normalizeDeg(deg);
    const x = toX(b);
    const isCardinal = b % 45 === 0;
    ctx.fillStyle = isCardinal ? '#ffd166' : 'rgba(255,255,255,0.7)';
    ctx.fillRect(x - 0.5, 26, 1, b % 10 === 0 ? 8 : 4);
    if (isCardinal) {
      ctx.font = `bold 14px ${FONT}`;
      ctx.fillText(CARDINALS[b / 45], x, 13);
    } else if (b % 10 === 0) {
      ctx.font = `11px ${FONT}`;
      ctx.fillText(`${b}°`, x, 13);
    }
  }

  // Little marker for the exact centre direction.
  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.moveTo(w / 2 - 6, 34);
  ctx.lineTo(w / 2 + 6, 34);
  ctx.lineTo(w / 2, 42);
  ctx.fill();
}

/**
 * Labels sit in rows at the top with a thin line down to the peak. Taller peaks get first
 * pick of a spot; if a label would overlap another in every row, it is skipped.
 */
function drawLabels(
  ctx: CanvasRenderingContext2D,
  w: number,
  peaks: SeenPeak[],
  lang: View['lang'],
  toX: (b: number) => number,
  toY: (a: number) => number,
) {
  const rows: { left: number; right: number }[][] = Array.from({ length: MAX_ROWS }, () => []);
  const placed: { p: SeenPeak; x: number; y: number; row: number; width: number; title: string }[] = [];

  for (const p of [...peaks].sort((a, b) => b.ele - a.ele)) {
    const x = toX(p.bearing);
    const y = toY(p.angle);
    if (x < -50 || x > w + 50) continue;
    const title = lang === 'ne' && p.ne ? p.ne : p.name;
    ctx.font = `bold 13px ${FONT}`;
    const width = Math.max(ctx.measureText(title).width, 92) + 12;
    const left = x - width / 2;
    const right = x + width / 2;
    const row = rows.findIndex(
      (r, i) => LABEL_TOP + i * ROW_HEIGHT + ROW_HEIGHT < y && r.every((s) => right < s.left || left > s.right),
    );
    if (row === -1) continue;
    rows[row].push({ left, right });
    placed.push({ p, x, y, row, width, title });
  }

  for (const { p, x, y, row, width, title } of placed) {
    const top = LABEL_TOP + row * ROW_HEIGHT;

    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.moveTo(x, top + 32);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x - 5, y + 4);
    ctx.lineTo(x + 5, y + 4);
    ctx.fill();

    ctx.fillStyle = 'rgba(8,20,38,0.78)';
    ctx.beginPath();
    ctx.roundRect(x - width / 2, top, width, 32, 6);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 13px ${FONT}`;
    ctx.fillText(title, x, top + 3);
    ctx.fillStyle = '#b8cbe0';
    ctx.font = `11px ${FONT}`;
    ctx.fillText(`${p.ele.toLocaleString('en-US')} m · ${Math.round(p.dist / 1000)} km`, x, top + 18);
  }
}
