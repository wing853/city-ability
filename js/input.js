// 키보드 · 마우스 · 터치 입력
// 모바일: 왼쪽 절반 드래그 = 이동 스틱
//   공격 버튼: 누르는 동안 연사. 탭하면 가장 가까운 적 자동 조준, 버튼에서 손가락을 끌면 그 방향으로 조준
//   스킬 버튼: 손을 뗄 때 발동. 탭이면 자동 조준, 끌었다 떼면 끈 방향으로 발동
import { $ } from './utils.js';
import { cv, view } from './view.js';

export const keys = {};
export const inp = {
  skill: false, dash: false,
  attack: false, atkDir: null,                // 공격 버튼: 누르는 중, 끌어서 정한 조준 방향(없으면 자동 조준)
  skHeld: false, skDir: null,                 // 스킬 버튼: 누르는 중, 끌어서 정한 조준 방향
  skillBtn: false, skillDir: null,            // 이번 프레임 버튼으로 발동한 스킬과 그 방향
  target: null,                               // 자동 조준 대상(표시용)
  mdown: false, mx: 0, my: 0, mseen: false,   // 마우스(화면 좌표)
  jvx: 0, jvy: 0                              // 이동 스틱(-1..1)
};

addEventListener('keydown', e => {
  if (!view.playTab) return;
  const k = e.key.toLowerCase();
  if (k === ' ') { inp.skill = true; e.preventDefault(); return; }
  if (k === 'shift') { inp.dash = true; return; }
  keys[k] = true; if (k.indexOf('arrow') === 0) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

function mousePos(e) { const r = cv.getBoundingClientRect(); inp.mx = e.clientX - r.left; inp.my = e.clientY - r.top; inp.mseen = true; }
cv.addEventListener('mousemove', mousePos);
cv.addEventListener('mousedown', e => { if (e.button === 0) { inp.mdown = true; mousePos(e); } });
addEventListener('mouseup', () => { inp.mdown = false; });
cv.addEventListener('contextmenu', e => e.preventDefault());

// 이동 스틱
const STICK_R = 50;
let joyId = null, jox = 0, joy0 = 0;
function stickShow(x, y) { const j = $('joy'); j.style.display = 'block'; j.style.left = x + 'px'; j.style.top = y + 'px'; }
function knobSet(dx, dy) { const k = $('knob'); k.style.left = (35 + dx) + 'px'; k.style.top = (35 + dy) + 'px'; }

cv.addEventListener('touchstart', e => {
  e.preventDefault();
  const r = cv.getBoundingClientRect();
  for (const t of e.changedTouches) {
    const x = t.clientX - r.left, y = t.clientY - r.top;
    if (x < r.width * 0.5) {
      if (joyId === null) { joyId = t.identifier; jox = t.clientX; joy0 = t.clientY; stickShow(x, y); knobSet(0, 0); }
    }
  }
}, { passive: false });

cv.addEventListener('touchmove', e => {
  e.preventDefault();
  const r = cv.getBoundingClientRect();
  for (const t of e.changedTouches) {
    if (t.identifier === joyId) {
      let dx = t.clientX - jox, dy = t.clientY - joy0; const m = Math.hypot(dx, dy);
      if (m > STICK_R) { dx = dx / m * STICK_R; dy = dy / m * STICK_R; }
      inp.jvx = dx / STICK_R; inp.jvy = dy / STICK_R; knobSet(dx, dy);
    }
  }
}, { passive: false });

function touchEnd(e) {
  for (const t of e.changedTouches) {
    if (t.identifier === joyId) { joyId = null; inp.jvx = inp.jvy = 0; $('joy').style.display = 'none'; }
  }
}
cv.addEventListener('touchend', touchEnd);
cv.addEventListener('touchcancel', touchEnd);

// 버튼: 누른 위치에서 손가락을 DRAG_MIN 이상 끌면 그 방향이 조준 방향
const DRAG_MIN = 14;
function dragButton(el, { down, move, up }) {
  let id = null, ox = 0, oy = 0;
  el.addEventListener('pointerdown', e => {
    if (!view.playTab || id !== null) return;
    e.preventDefault(); e.stopPropagation();
    id = e.pointerId; ox = e.clientX; oy = e.clientY;
    el.setPointerCapture(e.pointerId);
    down();
  });
  el.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - ox, dy = e.clientY - oy;
    move(Math.hypot(dx, dy) >= DRAG_MIN ? { x: dx, y: dy } : null);
  });
  const end = e => { if (e.pointerId !== id) return; id = null; up(e.type === 'pointerup'); };
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(ev, end);
}

dragButton($('bAttack'), {
  down: () => { inp.attack = true; inp.atkDir = null; },
  move: dir => { inp.atkDir = dir; },
  up: () => { inp.attack = false; inp.atkDir = null; }
});
dragButton($('bSkill'), {
  down: () => { inp.skHeld = true; inp.skDir = null; },
  move: dir => { inp.skDir = dir; },
  up: released => {
    if (released && inp.skHeld) { inp.skill = true; inp.skillBtn = true; inp.skillDir = inp.skDir; }
    inp.skHeld = false; inp.skDir = null;
  }
});
$('bDash').addEventListener('pointerdown', e => {
  if (!view.playTab) return;
  e.preventDefault(); e.stopPropagation(); inp.dash = true;
});
addEventListener('blur', () => { inp.attack = false; inp.atkDir = null; inp.skHeld = false; inp.skDir = null; inp.mdown = false; });

export function resetActions() { inp.skill = inp.dash = inp.skillBtn = false; inp.skillDir = null; inp.target = null; }
