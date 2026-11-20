// 캔버스와 화면 크기, 현재 탭 상태
import { $ } from './utils.js';

export const cv = $('c'), ctx = cv.getContext('2d');
export const view = { VW: 1, VH: 1, DPR: 1, playTab: true };

export function resize() {
  const r = $('stage').getBoundingClientRect();
  view.DPR = Math.min(window.devicePixelRatio || 1, 2);
  view.VW = Math.max(1, r.width); view.VH = Math.max(1, r.height);
  cv.width = Math.floor(view.VW * view.DPR); cv.height = Math.floor(view.VH * view.DPR);
  cv.style.width = view.VW + 'px'; cv.style.height = view.VH + 'px';
}
addEventListener('resize', resize);
