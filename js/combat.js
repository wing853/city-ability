// 피해 · 사망 처리, 기본 공격 14종, 스킬 14종
import { WORLD, C, AB } from './config.js';
import { G } from './state.js';
import { rects, inRect, blocked } from './world.js';
import { angDiff } from './utils.js';
import { burst, ring, addTxt } from './effects.js';
import { endGame } from './hud.js';

export function nameOf(f) { return f.id === 0 ? '나' : AB[f.ab].name; }
export function others(f) { return G.fighters.filter(o => o !== f && o.alive); }

export function killF(o, src) {
  o.alive = false; o.hp = 0; G.alive--; burst(o.x, o.y, C[o.ab], 26); ring(o.x, o.y, 8, 60, C[o.ab], 0.4);
  if (src && src !== o) src.kills++;
  G.feed.push({ s: (src && src !== o ? nameOf(src) + ' → ' : '자기장 → ') + nameOf(o), t: 5 });
  if (G.feed.length > 4) G.feed.shift();
  if (o.id === 0) { G.placement = G.alive + 1; endGame(false); }
}

export function dmgF(o, d, src, kx, ky) {
  if (!o.alive || o.inv > 0) return;
  o.hp -= d; o.hit = 0.12; addTxt(o.x, o.y - o.r - 4, Math.round(d), o.id === 0 ? '#ff8a8a' : '#fff'); burst(o.x, o.y, C[o.ab], 3);
  if (kx || ky) { o.kx = kx; o.ky = ky; o.kb = 0.14; }
  if (o.id === 0) G.shake = Math.max(G.shake, 5);
  if (o.hp <= 0) killF(o, src);
}

export function explode(x, y, owner, r, dmg, kb, col) {
  for (const o of G.fighters) {
    if (!o.alive || o === owner) continue;
    const dx = o.x - x, dy = o.y - y, d = Math.hypot(dx, dy) || 1;
    if (d - o.r < r) dmgF(o, dmg, owner, dx / d * kb, dy / d * kb);
  }
  ring(x, y, 6, r, col, 0.3); burst(x, y, col, 14); G.shake = Math.max(G.shake, 4);
}

export function killProj(b) {
  if (b.bomb) explode(b.x, b.y, b.owner, 65, 18, 260, b.col); else burst(b.x, b.y, b.col, 4);
  b.dead = true;
}

/* ---------- 공격 형태 ---------- */
function beam(f, range, dmg, col) {
  const a = f.aim; let len = 0;
  while (len < range) {
    const nx = f.x + a.x * (len + 8), ny = f.y + a.y * (len + 8);
    if (inRect(nx, ny, 0) || nx < 0 || ny < 0 || nx > WORLD || ny > WORLD) break;
    len += 8;
  }
  for (const o of others(f)) {
    const px = o.x - f.x, py = o.y - f.y, t = Math.max(0, Math.min(len, px * a.x + py * a.y));
    if (Math.hypot(px - a.x * t, py - a.y * t) < o.r + 6) dmgF(o, dmg, f, a.x * 60, a.y * 60);
  }
  G.fx.push({ k: 'beam', x1: f.x, y1: f.y, x2: f.x + a.x * len, y2: f.y + a.y * len, t: 0.14, max: 0.14, col });
}

function cone(f, range, half, dmg, kb, col) {
  const a = Math.atan2(f.aim.y, f.aim.x);
  for (const o of others(f)) {
    const dx = o.x - f.x, dy = o.y - f.y, d = Math.hypot(dx, dy) || 1;
    if (d - o.r < range && Math.abs(angDiff(Math.atan2(dy, dx), a)) < half) dmgF(o, dmg, f, dx / d * kb, dy / d * kb);
  }
  G.fx.push({ k: 'arc', x: f.x, y: f.y, a, r: range * 0.85, half, t: 0.15, max: 0.15, col });
}

function shoot(f, spd, r, dmg, life, col, extra) {
  const a = f.aim;
  G.pr.push(Object.assign({ x: f.x + a.x * 14, y: f.y + a.y * 14, vx: a.x * spd, vy: a.y * spd, r, dmg, life, col, owner: f }, extra || {}));
}

/* ---------- 기본 공격 ---------- */
export function basic(f) {
  basicByAbility(f);
  if (f.haste > 0) f.atkCd *= 0.65;
}

function basicByAbility(f) {
  switch (f.ab) {
    case 'fire':   shoot(f, 520, 7, 10, 0.9, C.fire, { splash: true }); f.atkCd = 0.5; break;
    case 'shock':  shoot(f, 950, 4, 7, 0.45, C.shock); f.atkCd = 0.36; break;
    case 'grav':   cone(f, 125, 0.95, 20, 280, C.grav); f.atkCd = 0.55; break;
    case 'ice':    shoot(f, 560, 6, 9, 0.8, C.ice, { slow: true }); f.atkCd = 0.42; break;
    case 'shadow': cone(f, 95, 1.05, 22, 0, C.shadow); f.atkCd = 0.3; break;
    case 'poison': shoot(f, 560, 5, 5, 0.8, C.poison, { poison: true }); f.atkCd = 0.45; break;
    case 'wind':   shoot(f, 480, 14, 6, 0.55, C.wind, { pierce: true, kbm: 0.6 }); f.atkCd = 0.5; break;
    case 'light':  beam(f, 380, 10, C.light); f.atkCd = 0.5; break;
    case 'earth':  shoot(f, 380, 9, 16, 1.1, C.earth, { kbm: 0.25 }); f.atkCd = 0.75; break;
    case 'haste':  shoot(f, 700, 5, 6, 0.6, C.haste); f.atkCd = 0.3; break;
    case 'life':   shoot(f, 650, 5, 7, 0.65, C.life, { heal: 2 }); f.atkCd = 0.4; break;
    case 'bomb':   shoot(f, 420, 8, 0, 0.7, C.bomb, { bomb: true }); f.atkCd = 0.85; break;
    case 'mirror': shoot(f, 600, 5, 9, 0.7, C.mirror); f.atkCd = 0.4; break;
    default:       cone(f, 80, 0.9, 30, 320, C.body); f.atkCd = 0.55; // body
  }
}

/* ---------- 스킬 ---------- */
// sd: 스킬 거리(봇이 지정). 0이면 기본 거리
export function skill(f, sd) {
  f.skCd = AB[f.ab].cd; const a = f.aim;
  switch (f.ab) {
    case 'fire': {
      for (const o of others(f)) { const dx = o.x - f.x, dy = o.y - f.y, d = Math.hypot(dx, dy) || 1; if (d - o.r < 135) dmgF(o, 30, f, dx / d * 360, dy / d * 360); }
      G.pr = G.pr.filter(b => b.owner === f || Math.hypot(b.x - f.x, b.y - f.y) > 135);
      ring(f.x, f.y, 10, 135, C.fire, 0.4); burst(f.x, f.y, C.fire, 22);
      break;
    }
    case 'shock': {
      const dist = sd || 220;
      G.zones.push({ x: f.x + a.x * dist, y: f.y + a.y * dist, r: 75, t: 0.55, max: 0.55, owner: f, dmg: 38 });
      break;
    }
    case 'grav': {
      const dist = sd || 170;
      G.fields.push({ x: f.x + a.x * dist, y: f.y + a.y * dist, r: 115, t: 2.6, tick: 0, owner: f });
      break;
    }
    case 'ice':
      for (const o of others(f)) { if (Math.hypot(o.x - f.x, o.y - f.y) - o.r < 140) { dmgF(o, 14, f); if (o.alive && o.inv <= 0) o.frz = 1.2; } }
      ring(f.x, f.y, 10, 140, C.ice, 0.45); burst(f.x, f.y, C.ice, 24);
      break;
    case 'shadow': {
      burst(f.x, f.y, C.shadow, 10);
      let d = 0;
      while (d < 240) {
        const nx = f.x + a.x * (d + 8), ny = f.y + a.y * (d + 8);
        if (inRect(nx, ny, f.r) || nx < f.r || ny < f.r || nx > WORLD - f.r || ny > WORLD - f.r) break;
        d += 8;
      }
      f.x += a.x * d; f.y += a.y * d; f.inv = Math.max(f.inv, 0.35); burst(f.x, f.y, C.shadow, 12);
      break;
    }
    case 'body':
      f.dashV = { x: a.x, y: a.y }; f.dashT = 0.22; f.dashSpd = 1150; f.chg = true; f.hset = new Set(); f.inv = Math.max(f.inv, 0.22);
      break;
    case 'poison': {
      const dist = sd || 170;
      G.fields.push({ x: f.x + a.x * dist, y: f.y + a.y * dist, r: 100, t: 3.2, tick: 0, owner: f, kind: 'poison' });
      break;
    }
    case 'wind':
      for (const o of others(f)) { const dx = o.x - f.x, dy = o.y - f.y, d = Math.hypot(dx, dy) || 1; if (d - o.r < 170) dmgF(o, 10, f, dx / d * 560, dy / d * 560); }
      G.pr = G.pr.filter(b => b.owner === f || Math.hypot(b.x - f.x, b.y - f.y) > 170);
      ring(f.x, f.y, 10, 170, C.wind, 0.45); burst(f.x, f.y, C.wind, 22);
      break;
    case 'light': {
      const ang = Math.atan2(a.y, a.x);
      for (const o of others(f)) {
        const dx = o.x - f.x, dy = o.y - f.y, d = Math.hypot(dx, dy) || 1;
        if (d - o.r < 260 && Math.abs(angDiff(Math.atan2(dy, dx), ang)) < 0.7 && !blocked(f.x, f.y, o.x, o.y)) { dmgF(o, 10, f); if (o.alive && o.inv <= 0) o.frz = 0.8; }
      }
      G.fx.push({ k: 'arc', x: f.x, y: f.y, a: ang, half: 0.7, r: 200, t: 0.3, max: 0.3, col: C.light });
      break;
    }
    case 'earth': {
      const dist = sd || 95, cx = Math.max(60, Math.min(WORLD - 60, f.x + a.x * dist)), cy = Math.max(60, Math.min(WORLD - 60, f.y + a.y * dist));
      const vert = Math.abs(a.x) > Math.abs(a.y), w = vert ? 26 : 120, h = vert ? 120 : 26;
      rects.push({ x: cx - w / 2, y: cy - h / 2, w, h, col: '#7a5a3a', col2: '#a07850', temp: true, t: 4, max: 4 });
      burst(cx, cy, C.earth, 12);
      break;
    }
    case 'haste':
      f.haste = 5; ring(f.x, f.y, 10, 60, C.haste, 0.4);
      break;
    case 'life':
      f.hp = Math.min(f.mhp, f.hp + 55); addTxt(f.x, f.y - 24, '+55', C.life); ring(f.x, f.y, 10, 50, C.life, 0.4); burst(f.x, f.y, C.life, 12);
      break;
    case 'bomb': {
      const mine = G.mines.filter(m => m.owner === f);
      if (mine.length >= 3) G.mines.splice(G.mines.indexOf(mine[0]), 1);
      G.mines.push({ x: f.x, y: f.y, owner: f, arm: 0.8, t: 25, r: 55 });
      break;
    }
    default: // mirror
      f.reflect = 1.4; ring(f.x, f.y, 10, 40, C.mirror, 0.3);
  }
}
