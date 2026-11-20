// 참가자 1명의 한 프레임: 쿨다운, 상태이상, 이동/구르기/돌진, 공격·스킬 발동, 자기장 피해
import { CEN, C, ZONE_DPS } from './config.js';
import { G } from './state.js';
import { collide } from './world.js';
import { burst, ring } from './effects.js';
import { killF, dmgF, others, basic, skill } from './combat.js';

/** 벽을 뚫지 않도록 잘게 나눠 이동 */
export function mv(f, dx, dy) {
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 10));
  for (let i = 0; i < n; i++) { f.x += dx / n; f.y += dy / n; collide(f); }
}

// ctl: { mx, my, fire, skill, dash, aim, sd }
export function stepFighter(f, dt, ctl, live) {
  f.atkCd -= dt; f.skCd -= dt; f.dashCd -= dt; f.inv -= dt; f.hit -= dt; f.slow -= dt; f.haste -= dt; f.reflect -= dt;
  if (f.poison && f.poison.t > 0) {
    f.poison.t -= dt; f.hp -= f.poison.dps * dt; f.hit = Math.max(f.hit, 0.04);
    if (f.hp <= 0) { killF(f, f.poison.src); return; }
  }
  const ox = f.x, oy = f.y;
  if (ctl.aim) { const m = Math.hypot(ctl.aim.x, ctl.aim.y); if (m > 0.01) f.aim = { x: ctl.aim.x / m, y: ctl.aim.y / m }; }

  if (f.frz > 0) { f.frz -= dt; }
  else if (f.kb > 0) { f.kb -= dt; mv(f, f.kx * dt, f.ky * dt); }
  else if (live) {
    if (ctl.dash && f.dashCd <= 0 && f.dashT <= 0) {
      const m = Math.hypot(ctl.mx, ctl.my);
      f.dashCd = 2.5; f.dashT = 0.17; f.dashSpd = 640; f.chg = false; f.inv = Math.max(f.inv, 0.25);
      f.dashV = m > 0.2 ? { x: ctl.mx / m, y: ctl.my / m } : { x: f.aim.x, y: f.aim.y };
      burst(f.x, f.y, '#ffffff', 6);
    }
    if (f.dashT > 0) {
      f.dashT -= dt; mv(f, f.dashV.x * f.dashSpd * dt, f.dashV.y * f.dashSpd * dt);
      if (f.chg) { // 신체강화 돌진 충돌
        for (const o of others(f)) {
          if (f.hset.has(o)) continue;
          if (Math.hypot(o.x - f.x, o.y - f.y) < f.r + o.r + 8) {
            f.hset.add(o); dmgF(o, 25, f, f.dashV.x * 380, f.dashV.y * 380); ring(o.x, o.y, 5, 40, C.body, 0.25);
          }
        }
        if (f.dashT <= 0) f.chg = false;
      }
    } else {
      const sp = f.spd * (f.slow > 0 ? 0.55 : 1) * (f.haste > 0 ? 1.5 : 1), m = Math.hypot(ctl.mx, ctl.my);
      if (m > 0.05) mv(f, ctl.mx * sp * dt, ctl.my * sp * dt);
      if (m > 0.2) f.face = { x: ctl.mx / m, y: ctl.my / m };
    }
    if (ctl.fire && f.atkCd <= 0) basic(f);
    if (ctl.skill && f.skCd <= 0) skill(f, ctl.sd);
  }
  collide(f);
  f.mvd = Math.hypot(f.x - ox, f.y - oy); f.vx = (f.x - ox) / dt; f.vy = (f.y - oy) / dt;

  if (live && f.alive && Math.hypot(f.x - CEN, f.y - CEN) > G.zone.R) {
    f.hp -= ZONE_DPS * dt; f.hit = 0.05;
    if (f.hp <= 0) killF(f, null);
  }
}
