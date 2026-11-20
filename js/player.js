// 입력 → 플레이어 조작값(ctl)
import { G } from './state.js';
import { keys, inp } from './input.js';
import { blocked } from './world.js';

const AUTO_RANGE = 520;          // 자동 조준 최대 거리
const TARGET_SKILLS = ['shock', 'grav', 'poison']; // 자동 조준 시 대상 위치에 떨어지는 스킬

/** 화면 좌표 → 월드 좌표 */
function toWorld(sx, sy) {
  const c = G.cam;
  return { x: sx / c.zoom + c.x, y: sy / c.zoom + c.y };
}

/** 시야가 트인 가장 가까운 적 */
function autoTarget(f) {
  let best = null, bd = AUTO_RANGE;
  for (const o of G.fighters) {
    if (o === f || !o.alive) continue;
    const d = Math.hypot(o.x - f.x, o.y - f.y);
    if (d < bd && !blocked(f.x, f.y, o.x, o.y)) { bd = d; best = o; }
  }
  return best ? { t: best, d: bd } : null;
}

export function playerCtrl(f) {
  let mx = ((keys.d || keys.arrowright) ? 1 : 0) - ((keys.a || keys.arrowleft) ? 1 : 0) + inp.jvx;
  let my = ((keys.s || keys.arrowdown) ? 1 : 0) - ((keys.w || keys.arrowup) ? 1 : 0) + inp.jvy;
  const m = Math.hypot(mx, my); if (m > 1) { mx /= m; my /= m; }
  // 넉백·빙결 중에는 행동할 수 없으므로 스킬·구르기 입력을 버리지 않고 끝날 때까지 남겨둠
  const busy = f.frz > 0 || f.kb > 0;
  const ctl = { mx, my, fire: false, skill: !busy && inp.skill, dash: !busy && inp.dash, aim: null, sd: 0 };
  const skillBtn = !busy && inp.skillBtn, skillDir = inp.skillDir;
  if (!busy) { inp.skill = false; inp.dash = false; inp.skillBtn = false; inp.skillDir = null; }
  inp.target = null;

  const auto = () => {
    const a = autoTarget(f);
    if (a) { inp.target = a.t; ctl.aim = { x: a.t.x - f.x, y: a.t.y - f.y }; }
    else if (Math.hypot(mx, my) > 0.2) ctl.aim = { x: mx, y: my };
    return a;
  };

  if (skillBtn) {
    // 스킬 버튼: 끈 방향 또는 자동 조준
    if (skillDir) ctl.aim = skillDir;
    else { const a = auto(); if (a && TARGET_SKILLS.includes(f.ab)) ctl.sd = Math.max(60, Math.min(260, a.d)); }
  } else if (inp.skHeld && inp.skDir) {
    ctl.aim = inp.skDir;                      // 스킬 조준 중(조준선 미리보기)
  } else if (inp.attack) {
    ctl.fire = true;
    if (inp.atkDir) ctl.aim = inp.atkDir; else auto();
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
