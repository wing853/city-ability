// 키보드 · 마우스 · 터치 입력
// 모바일: 왼쪽 절반 드래그 = 이동 스틱, 오른쪽 절반 터치 = 터치한 위치로 공격(누르는 동안 연사)
import { $ } from './utils.js';
import { cv, view } from './view.js';

export const keys = {};
export const inp = {
  skill: false, dash: false,
  mdown: false, mx: 0, my: 0, mseen: false,   // 마우스(화면 좌표)
  touchAim: false, tx: 0, ty: 0,              // 공격 터치(화면 좌표)
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
let joyId = null, jox = 0, joy0 = 0, atkId = null;
function stickShow(x, y) { const j = $('joy'); j.style.display = 'block'; j.style.left = x + 'px'; j.style.top = y + 'px'; }
function knobSet(dx, dy) { const k = $('knob'); k.style.left = (35 + dx) + 'px'; k.style.top = (35 + dy) + 'px'; }

cv.addEventListener('touchstart', e => {
  e.preventDefault();
  const r = cv.getBoundingClientRect();
  for (const t of e.changedTouches) {
    const x = t.clientX - r.left, y = t.clientY - r.top;
    if (x < r.width * 0.5) {
      if (joyId === null) { joyId = t.identifier; jox = t.clientX; joy0 = t.clientY; stickShow(x, y); knobSet(0, 0); }
    } else if (atkId === null) {
      atkId = t.identifier; inp.touchAim = true; inp.tx = x; inp.ty = y;
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
    } else if (t.identifier === atkId) {
      inp.tx = t.clientX - r.left; inp.ty = t.clientY - r.top;
    }
  }
}, { passive: false });

function touchEnd(e) {
  for (const t of e.changedTouches) {
    if (t.identifier === joyId) { joyId = null; inp.jvx = inp.jvy = 0; $('joy').style.display = 'none'; }
    if (t.identifier === atkId) { atkId = null; inp.touchAim = false; }
  }
}
cv.addEventListener('touchend', touchEnd);
cv.addEventListener('touchcancel', touchEnd);

function bindBtn(el, fn) {
  el.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); fn(); }, { passive: false });
  el.addEventListener('mousedown', e => { e.preventDefault(); fn(); });
}
bindBtn($('bSkill'), () => { inp.skill = true; });
bindBtn($('bDash'), () => { inp.dash = true; });

export function resetActions() { inp.skill = inp.dash = false; }
