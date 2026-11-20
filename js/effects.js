// 시각 효과(파티클, 링, 데미지 숫자)
import { G } from './state.js';

export function burst(x, y, col, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, s = 40 + Math.random() * 140;
    G.fx.push({ k: 'part', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0.4, max: 0.4, col });
  }
}
export function ring(x, y, r0, r1, col, max) { G.fx.push({ k: 'ring', x, y, r0, r1, t: max, max, col }); }
export function addTxt(x, y, s, col) { G.txt.push({ x, y, s, t: 0.7, col: col || '#fff' }); }
