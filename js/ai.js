// AI 봇 조작: 가장 가까운 적을 노리고, 능력별 선호 거리 유지, 예측 사격, 회피, 자기장 복귀
import { CEN, BP } from './config.js';
import { G } from './state.js';
import { blocked } from './world.js';

export function botCtrl(f, dt, live) {
  const g = G, ctl = { mx: 0, my: 0, fire: false, skill: false, dash: false, aim: null, sd: 200 };
  if (!live) return ctl;

  let t = null, bd = 1e9;
  for (const o of g.fighters) if (o !== f && o.alive) { const d = Math.hypot(o.x - f.x, o.y - f.y); if (d < bd) { bd = d; t = o; } }
  if (!t) return ctl;

  const pr = BP[f.ab];
  f.sideT -= dt; if (f.sideT <= 0) { f.side = -f.side; f.sideT = 0.8 + Math.random() * 1.4; }
  f.errT -= dt; if (f.errT <= 0) { f.errT = 0.5; f.err = (Math.random() - .5) * 0.3; }

  // 조준(예측 + 오차)
  const d = bd || 1, ux = (t.x - f.x) / d, uy = (t.y - f.y) / d;
  const los = !blocked(f.x, f.y, t.x, t.y);
  const lead = pr.ps ? Math.min(0.6, d / pr.ps) * 0.8 : 0;
  const ang = Math.atan2(t.y + t.vy * lead - f.y, t.x + t.vx * lead - f.x) + f.err;
  ctl.aim = { x: Math.cos(ang), y: Math.sin(ang) };

  // 이동
  let mx = 0, my = 0;
  if (!los || d > pr.ideal + 40) { mx = ux; my = uy; }
  else if (pr.ranged && d < pr.ideal - 60) { mx = -ux; my = -uy; }
  else if (!pr.ranged) { mx = ux; my = uy; }
  if (los) { const k = pr.ranged ? 0.7 : 0.35; mx += -uy * f.side * k; my += ux * f.side * k; }
  const zd = Math.hypot(f.x - CEN, f.y - CEN);
  if (zd > g.zone.R - 70) { mx = (CEN - f.x) / zd * 1.5; my = (CEN - f.y) / zd * 1.5; }

  // 벽에 끼면 옆으로 비켜가기
  if (f.wall > 0) {
    f.wall -= dt; const m0 = Math.hypot(mx, my) || 1, nx = mx / m0, ny = my / m0;
    mx = nx * 0.35 - ny * f.wdir; my = ny * 0.35 + nx * f.wdir;
  } else if (f.wantMove && f.mvd < f.spd * dt * 0.25) {
    f.stuck += dt; if (f.stuck > 0.3) { f.wall = 0.9; f.wdir = Math.random() < .5 ? 1 : -1; f.stuck = 0; }
  } else f.stuck = Math.max(0, f.stuck - dt);
  f.wantMove = Math.hypot(mx, my) > 0.3 && d > 45;
  const m = Math.hypot(mx, my); if (m > 1) { mx /= m; my /= m; }
  ctl.mx = mx; ctl.my = my;

  // 공격 · 스킬
  if (los && d < pr.rng) ctl.fire = true;
  if (f.skCd <= 0 && los && Math.random() < 0.15) {
    const k = f.ab;
    if (k === 'fire' && d < 125) ctl.skill = true;
    else if (k === 'shock' && d > 80 && d < 260) { ctl.skill = true; ctl.sd = d; }
    else if (k === 'grav' && d < 250) { ctl.skill = true; ctl.sd = Math.max(60, d - 20); }
    else if (k === 'ice' && d < 135) ctl.skill = true;
    else if (k === 'shadow') {
      if (f.hp < f.mhp * 0.3 && d < 110) { ctl.skill = true; ctl.aim = { x: -ux, y: -uy }; }
      else if (d > 170) ctl.skill = true;
    } else if (k === 'body' && d > 100 && d < 260) ctl.skill = true;
    else if (k === 'poison' && d < 260) { ctl.skill = true; ctl.sd = Math.max(60, d - 10); }
    else if (k === 'wind' && d < 150) ctl.skill = true;
    else if (k === 'light' && d < 230) ctl.skill = true;
    else if (k === 'haste' && d < 320) ctl.skill = true;
    else if (k === 'bomb' && d < 260) ctl.skill = true;
  }
  if (f.ab === 'life' && f.skCd <= 0 && f.hp < f.mhp * 0.6) ctl.skill = true;

  // 날아오는 탄 대응(반사막, 바위벽, 구르기)
  for (const b of g.pr) {
    if (b.owner === f) continue;
    const bx = f.x - b.x, by = f.y - b.y, bdist = Math.hypot(bx, by), sp = Math.hypot(b.vx, b.vy);
    if (bdist < 140 && (b.vx * bx + b.vy * by) / (bdist * sp + 0.001) > 0.85) {
      if (f.ab === 'mirror' && f.skCd <= 0) { ctl.skill = true; break; }
      if (f.ab === 'earth' && f.skCd <= 0 && Math.random() < 0.3) { ctl.skill = true; ctl.sd = 70; ctl.aim = { x: -bx / bdist, y: -by / bdist }; break; }
      if (f.dashCd <= 0 && bdist < 120 && Math.random() < 0.25) {
        const s = Math.random() < .5 ? 1 : -1; ctl.dash = true; ctl.mx = -b.vy / sp * s; ctl.my = b.vx / sp * s; break;
      }
    }
  }
  return ctl;
}
