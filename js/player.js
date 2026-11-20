// 입력 → 플레이어 조작값(ctl)
import { G } from './state.js';
import { keys, inp } from './input.js';

/** 화면 좌표 → 월드 좌표 */
function toWorld(sx, sy) {
  const c = G.cam;
  return { x: sx / c.zoom + c.x, y: sy / c.zoom + c.y };
}

export function playerCtrl(f) {
  let mx = ((keys.d || keys.arrowright) ? 1 : 0) - ((keys.a || keys.arrowleft) ? 1 : 0) + inp.jvx;
  let my = ((keys.s || keys.arrowdown) ? 1 : 0) - ((keys.w || keys.arrowup) ? 1 : 0) + inp.jvy;
  const m = Math.hypot(mx, my); if (m > 1) { mx /= m; my /= m; }
  const ctl = { mx, my, fire: false, skill: inp.skill, dash: inp.dash, aim: null, sd: 0 };
  inp.skill = false; inp.dash = false;

  if (inp.touchAim) {
    // 모바일: 터치한 위치를 향해 조준하고 누르는 동안 공격
    const w = toWorld(inp.tx, inp.ty), dx = w.x - f.x, dy = w.y - f.y;
    if (Math.hypot(dx, dy) > 4) ctl.aim = { x: dx, y: dy };
    ctl.fire = true;
  } else if (inp.mseen) {
    // PC: 마우스 커서 방향 조준, 클릭 중 공격
    const w = toWorld(inp.mx, inp.my);
    ctl.aim = { x: w.x - f.x, y: w.y - f.y };
    if (inp.mdown) ctl.fire = true;
  } else if (Math.hypot(mx, my) > 0.2) {
    ctl.aim = { x: mx, y: my };
  }
  return ctl;
}
