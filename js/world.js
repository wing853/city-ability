// 도시 맵 생성(고정 시드)과 충돌 판정
import { GRID, WORLD } from './config.js';

let seed = 11;
const srnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

export const rects = [], lots = [], trees = [];
for (let i = 0; i < GRID; i++) for (let j = 0; j < GRID; j++) {
  const lx = 50 + i * 300, ly = 50 + j * 300;
  const mid = GRID / 2, park = (i >= mid - 1 && i <= mid && j >= mid - 1 && j <= mid) || srnd() < 0.1;
  lots.push({ x: lx, y: ly, park });
  if (park) { for (let k = 0; k < 7; k++) trees.push({ x: lx + 20 + srnd() * 160, y: ly + 20 + srnd() * 160, r: 10 + srnd() * 8 }); continue; }
  const a = srnd() * 22, b = srnd() * 22, c = srnd() * 22, d = srnd() * 22, h = 220 + srnd() * 50;
  rects.push({ x: lx + a, y: ly + b, w: 200 - a - c, h: 200 - b - d, col: `hsl(${h},24%,26%)`, col2: `hsl(${h},26%,33%)` });
}

/** 임시 벽(바위벽) 제거 */
export function clearTempRects() {
  for (let i = rects.length - 1; i >= 0; i--) if (rects[i].temp) rects.splice(i, 1);
}

export function inRect(x, y, m) {
  for (const b of rects) if (x > b.x - m && x < b.x + b.w + m && y > b.y - m && y < b.y + b.h + m) return true;
  return false;
}

export function collide(e) {
  for (const b of rects) {
    const cx = Math.max(b.x, Math.min(e.x, b.x + b.w)), cy = Math.max(b.y, Math.min(e.y, b.y + b.h));
    const dx = e.x - cx, dy = e.y - cy, d2 = dx * dx + dy * dy;
    if (d2 < e.r * e.r) {
      if (d2 > 0.0001) { const d = Math.sqrt(d2), p = e.r - d; e.x += dx / d * p; e.y += dy / d * p; }
      else {
        const l = e.x - b.x, r = b.x + b.w - e.x, t = e.y - b.y, bt = b.y + b.h - e.y, m = Math.min(l, r, t, bt);
        if (m === l) e.x = b.x - e.r; else if (m === r) e.x = b.x + b.w + e.r; else if (m === t) e.y = b.y - e.r; else e.y = b.y + b.h + e.r;
      }
    }
  }
  e.x = Math.max(e.r, Math.min(WORLD - e.r, e.x)); e.y = Math.max(e.r, Math.min(WORLD - e.r, e.y));
}

/** 두 점 사이 시야가 건물에 막히는지 */
export function blocked(x1, y1, x2, y2) {
  const d = Math.hypot(x2 - x1, y2 - y1), n = Math.ceil(d / Math.max(14, d / 45));
  for (let i = 1; i < n; i++) { const t = i / n; if (inRect(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, 2)) return true; }
  return false;
}
