// 한 프레임 시뮬레이션: 자기장, 참가자, 밀어내기, 투사체, 장판, 지뢰, 효과 수명
import { WORLD, C, ZONE_DELAY, ZONE_SPEED, ZONE_MIN } from './config.js';
import { G } from './state.js';
import { rects, inRect, collide } from './world.js';
import { ring } from './effects.js';
import { dmgF, killProj, explode } from './combat.js';
import { mv, stepFighter } from './fighter.js';
import { botCtrl } from './ai.js';
import { playerCtrl } from './player.js';
import { endGame } from './hud.js';

export function update(dt) {
  const g = G, P = g.fighters[0]; g.t += dt; g.shake = Math.max(0, g.shake - dt * 30);
  if (g.cd > 0) g.cd -= dt;
  const live = g.cd <= 0;
  if (live) { g.zt += dt; if (g.zt > ZONE_DELAY) g.zone.R = Math.max(ZONE_MIN, g.zone.R - ZONE_SPEED * dt); }

  // 바위벽 수명
  for (let i = rects.length - 1; i >= 0; i--) { const r = rects[i]; if (r.temp) { r.t -= dt; if (r.t <= 0) rects.splice(i, 1); } }

  // 참가자
  for (const f of g.fighters) {
    if (!f.alive) continue;
    const ctl = (f.bot || g.auto) ? botCtrl(f, dt, live) : playerCtrl(f);
    stepFighter(f, dt, ctl, live);
    if (g.state !== 'play') return;
  }
  const fs = g.fighters;

  // 참가자끼리 겹침 해소
  for (let i = 0; i < fs.length; i++) {
    const a = fs[i]; if (!a.alive) continue;
    for (let j = i + 1; j < fs.length; j++) {
      const b = fs[j]; if (!b.alive) continue;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), mn = a.r + b.r;
      if (d < mn && d > 0.01) { const k = (mn - d) / 2 / d; a.x -= dx * k; a.y -= dy * k; b.x += dx * k; b.y += dy * k; collide(a); collide(b); }
    }
  }

  updateProjectiles(dt, fs);
  updateZones(dt, fs);
  updateFields(dt, fs);
  updateMines(dt, fs);

  for (const f of g.fx) { f.t -= dt; if (f.k === 'part') { f.x += f.vx * dt; f.y += f.vy * dt; } }
  g.fx = g.fx.filter(f => f.t > 0);
  for (const t of g.txt) { t.t -= dt; t.y -= 30 * dt; }
  g.txt = g.txt.filter(t => t.t > 0);
  for (const f of g.feed) f.t -= dt;
  g.feed = g.feed.filter(f => f.t > 0);

  if (g.state === 'play' && P.alive && g.alive === 1) endGame(true);
}

function updateProjectiles(dt, fs) {
  const g = G;
  for (const b of g.pr) {
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0 || b.x < 0 || b.y < 0 || b.x > WORLD || b.y > WORLD || inRect(b.x, b.y, 0)) { killProj(b); continue; }
    for (const o of fs) {
      if (!o.alive || o === b.owner) continue;
      if (Math.hypot(o.x - b.x, o.y - b.y) < o.r + b.r) {
        if (o.reflect > 0) { b.vx = -b.vx; b.vy = -b.vy; b.owner = o; b.life = Math.max(b.life, 0.7); ring(b.x, b.y, 3, 22, C.mirror, 0.2); break; }
        if (o.inv > 0) continue;
        if (b.pierce) { if (!b.hit) b.hit = new Set(); if (b.hit.has(o)) continue; b.hit.add(o); }
        if (b.bomb) { killProj(b); break; }
        dmgF(o, b.dmg, b.owner, b.vx * (b.kbm || 0.12), b.vy * (b.kbm || 0.12));
        if (b.heal && b.owner.alive) b.owner.hp = Math.min(b.owner.mhp, b.owner.hp + b.heal);
        if (b.poison && o.alive) o.poison = { t: 3, dps: 6, src: b.owner };
        if (b.slow && o.alive) o.slow = 1.5;
        if (b.splash) for (const q of fs) if (q.alive && q !== o && q !== b.owner && Math.hypot(q.x - b.x, q.y - b.y) < 50) dmgF(q, b.dmg * 0.4, b.owner);
        ring(b.x, b.y, 4, 36, b.col, 0.2); if (!b.pierce) b.dead = true; break;
      }
    }
  }
  g.pr = g.pr.filter(b => !b.dead);
}

// 낙뢰 표식
function updateZones(dt, fs) {
  const g = G;
  for (const z of g.zones) {
    z.t -= dt;
    if (z.t <= 0) {
      z.dead = true; g.fx.push({ k: 'bolt', x: z.x, y: z.y, t: 0.3, max: 0.3, col: C.shock }); ring(z.x, z.y, 5, z.r, C.shock, 0.3);
      for (const o of fs) if (o.alive && o !== z.owner && Math.hypot(o.x - z.x, o.y - z.y) < z.r + o.r * 0.5) dmgF(o, z.dmg, z.owner);
      g.shake = Math.max(g.shake, 4);
    }
  }
  g.zones = g.zones.filter(z => !z.dead);
}

// 중력장 · 독구름
function updateFields(dt, fs) {
  const g = G;
  for (const f of g.fields) {
    f.t -= dt; f.tick -= dt; const tick = f.tick <= 0; if (tick) f.tick = 0.4;
    for (const o of fs) {
      if (!o.alive || o === f.owner) continue;
      const dx = f.x - o.x, dy = f.y - o.y, d = Math.hypot(dx, dy);
      if (d >= f.r) continue;
      if (f.kind === 'poison') {
        if (tick) { dmgF(o, 6, f.owner); if (o.alive) o.poison = { t: 2, dps: 5, src: f.owner }; }
      } else {
        if (d > 8) mv(o, dx / d * 120 * dt, dy / d * 120 * dt);
        if (tick) dmgF(o, 6, f.owner);
      }
    }
  }
  g.fields = g.fields.filter(f => f.t > 0);
}

function updateMines(dt, fs) {
  const g = G;
  for (const m of g.mines) {
    m.t -= dt; m.arm -= dt;
    if (m.arm <= 0) for (const o of fs) {
      if (o.alive && o !== m.owner && Math.hypot(o.x - m.x, o.y - m.y) < m.r + o.r) { explode(m.x, m.y, m.owner, 70, 40, 300, C.bomb); m.dead = true; break; }
    }
  }
  g.mines = g.mines.filter(m => !m.dead && m.t > 0);
}
