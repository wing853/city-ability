// 캔버스 그리기: 맵, 자기장, 장판, 참가자, 투사체, 효과, 미니맵, 화면 밖 화살표, 터치 조준점
import { GRID, WORLD, CEN, C, AB } from './config.js';
import { G } from './state.js';
import { rects, lots, trees } from './world.js';
import { ctx, view } from './view.js';
import { inp } from './input.js';

import { fighterArt } from './characterArt.js';
import { drawNeonCity } from './neonCity.js';

export function draw() {
  const g = G, P = g.fighters[0], { VW, VH, DPR } = view;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#070a12'; ctx.fillRect(0, 0, VW, VH);

  // 카메라
  const zoom = Math.max(0.95, Math.min(1.65, Math.min(VW, VH) / 390));
  const vw = VW / zoom, vh = VH / zoom;
  const cx = vw >= WORLD ? (WORLD - vw) / 2 : Math.max(0, Math.min(WORLD - vw, P.x - vw / 2));
  const cy = vh >= WORLD ? (WORLD - vh) / 2 : Math.max(0, Math.min(WORLD - vh, P.y - vh / 2));
  g.cam.x = cx; g.cam.y = cy; g.cam.zoom = zoom;
  const sx = (Math.random() - .5) * g.shake, sy = (Math.random() - .5) * g.shake;

  ctx.save(); ctx.scale(zoom, zoom); ctx.translate(-cx + sx, -cy + sy);
  drawMap(g);
  drawAreas(g);
  if (P.alive && g.state === 'play') drawAimLine(P);
  drawFighters(g);
  drawProjectiles(g);
  drawEffects(g);
  ctx.restore();

  drawTouchTarget(P, g);
  drawMinimap(g, VW);
  drawOffscreen(g, P, cx, cy, zoom, VW, VH);
  drawCountdown(g, VW, VH);
}

// Layered, asset-free city art. Geometry is decorative only; collision remains in world.js.
function drawMap(g) {
  drawNeonCity(ctx, GRID, WORLD, rects, lots, trees);
  for (const m of g.mines) {
    ctx.fillStyle = '#17212b'; ctx.beginPath(); ctx.arc(m.x, m.y, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffbd68'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(m.x, m.y, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = m.arm <= 0 && Math.floor(g.t * 4) % 2 ? '#ff4d6a' : '#e0a455';
    ctx.beginPath(); ctx.arc(m.x, m.y, 4, 0, Math.PI * 2); ctx.fill();
  }
}

function drawAreas(g) {
  // 자기장
  ctx.fillStyle = 'rgba(127,38,75,.12)';
  ctx.beginPath(); ctx.rect(-50, -50, WORLD + 100, WORLD + 100); ctx.arc(CEN, CEN, g.zone.R, 0, 6.283, true); ctx.fill('evenodd');
  ctx.strokeStyle = '#ff688d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(CEN, CEN, g.zone.R, 0, 6.283); ctx.stroke();
  // 중력장 · 독구름
  for (const f of g.fields) {
    const a = 0.18 + 0.08 * Math.sin(g.t * 8);
    const fc = f.kind === 'poison' ? '163,230,53' : '181,123,255';
    ctx.fillStyle = 'rgba(' + fc + ',' + a + ')'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
    ctx.strokeStyle = 'rgba(' + fc + ',.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.5 + 0.5 * ((g.t * 1.5) % 1)), 0, 6.283); ctx.stroke();
  }
  // 낙뢰 표식
  for (const z of g.zones) {
    const k = 1 - z.t / z.max;
    ctx.fillStyle = 'rgba(76,201,255,' + (0.1 + 0.25 * k) + ')'; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#4cc9ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, 6.283); ctx.stroke();
    ctx.beginPath(); ctx.arc(z.x, z.y, z.r * k, 0, 6.283); ctx.stroke();
  }
}

function drawAimLine(P) {
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.moveTo(P.x + P.aim.x * 20, P.y + P.aim.y * 20); ctx.lineTo(P.x + P.aim.x * 150, P.y + P.aim.y * 150); ctx.stroke(); ctx.setLineDash([]);
}

function drawFighters(g) {
  for (const f of g.fighters) {
    if (!f.alive) continue;
    const col = C[f.ab], angle = Math.atan2(f.aim.y, f.aim.x);
    const walking = Math.hypot(f.vx, f.vy) > 35;
    const bob = walking ? Math.sin(g.t * 15 + f.id) * 1.5 : Math.sin(g.t * 3 + f.id) * .65;
    ctx.save(); ctx.translate(f.x, f.y); ctx.scale(1.22, 1.22);
    ctx.globalAlpha = f.inv > 0 ? .55 : 1;
    // Grounding shadow, ability aura, and facing-independent character silhouette.
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(3, 9, 16, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = col; ctx.globalAlpha *= .68; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 6, 18 + Math.sin(g.t * 5) * 1.2, 9, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = f.inv > 0 ? .55 : 1;
    ctx.rotate(angle + Math.PI / 2);
    const portrait = fighterArt[f.ab];
    if (portrait && portrait.complete && portrait.naturalWidth > 0) {
      // All fighters have distinct vector art. High-resolution at any device DPR.
      ctx.drawImage(portrait, -30, -52 + bob, 60, 68);
      ctx.restore();
      if (f.poison && f.poison.t > 0 || f.reflect > 0 || f.haste > 0 || f.frz > 0) {
        ctx.strokeStyle = f.reflect > 0 ? C.mirror : f.haste > 0 ? C.haste : f.frz > 0 ? C.ice : C.poison;
        ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(f.x,f.y,22+Math.sin(g.t*8)*2,0,Math.PI*2); ctx.stroke();
      }
      const w = 38;
      ctx.fillStyle = 'rgba(4,9,17,.85)'; ctx.fillRect(f.x-w/2-2,f.y-37,w+4,8);
      ctx.fillStyle = f.id === 0 ? '#59e2a1' : '#fb7586';
      ctx.fillRect(f.x-w/2,f.y-35,w*Math.max(0,f.hp/f.mhp),4);
      ctx.fillStyle = '#f5faff'; ctx.textAlign = 'center'; ctx.font = 'bold 10px sans-serif';
      ctx.fillText(f.id === 0 ? '나' : AB[f.ab].name, f.x, f.y-42);
      continue;
    }
    ctx.fillStyle = '#111c2d'; ctx.strokeStyle = f.id === 0 ? '#eaf8ff' : '#09101b'; ctx.lineWidth = 2.5;
    // Legs, torso, sleeves and face are layered for readable top-down animation.
    ctx.fillRect(-9, 5 + bob, 7, 12); ctx.fillRect(2, 5 - bob, 7, 12);
    ctx.fillStyle = f.hit > 0 ? '#fff' : '#263b52';
    ctx.beginPath(); ctx.moveTo(-11,-7+bob); ctx.lineTo(11,-7+bob); ctx.lineTo(9,10+bob); ctx.lineTo(-9,10+bob); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col; ctx.fillRect(-5,-5+bob,10,12);
    ctx.fillStyle = '#1a2c42'; ctx.fillRect(-16,-6+bob,6,14); ctx.fillRect(10,-6+bob,6,14);
    ctx.fillStyle = f.frz > 0 ? '#c4f4ff' : '#f0c6ad';
    ctx.beginPath(); ctx.arc(0,-11+bob,8.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#121a2a'; ctx.beginPath(); ctx.arc(0,-14+bob,8,Math.PI,Math.PI*2); ctx.fill();
    ctx.fillRect(-8,-16+bob,16,5);
    ctx.fillStyle = '#e8f7ff'; ctx.fillRect(-5,-9+bob,3,2); ctx.fillRect(2,-9+bob,3,2);
    ctx.restore();
    if (f.poison && f.poison.t > 0 || f.reflect > 0 || f.haste > 0 || f.frz > 0) {
      ctx.strokeStyle = f.reflect > 0 ? C.mirror : f.haste > 0 ? C.haste : f.frz > 0 ? C.ice : C.poison;
      ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(f.x,f.y,22+Math.sin(g.t*8)*2,0,Math.PI*2); ctx.stroke();
    }
    const w = 38;
    ctx.fillStyle = 'rgba(4,9,17,.85)'; ctx.fillRect(f.x-w/2-2,f.y-37,w+4,8);
    ctx.fillStyle = f.id === 0 ? '#59e2a1' : '#fb7586';
    ctx.fillRect(f.x-w/2,f.y-35,w*Math.max(0,f.hp/f.mhp),4);
    ctx.fillStyle = '#f5faff'; ctx.textAlign = 'center'; ctx.font = 'bold 10px sans-serif';
    ctx.fillText(f.id === 0 ? '나' : AB[f.ab].name, f.x, f.y-42);
  }
}

function drawProjectiles(g) {
  for (const b of g.pr) {
    const a = Math.atan2(b.vy, b.vx);
    ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(a);
    ctx.shadowColor = b.col; ctx.shadowBlur = 15;
    ctx.fillStyle = b.col + '66'; ctx.beginPath(); ctx.ellipse(-10,0,Math.max(12,b.r*2.8),Math.max(3,b.r*.8),0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = b.col; ctx.beginPath(); ctx.arc(0,0,b.r+2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(1,0,Math.max(2,b.r*.55),0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

function drawEffects(g) {
  for (const f of g.fx) {
    const k = f.t / f.max; ctx.globalAlpha = Math.max(0, k);
    if (f.k === 'ring') { ctx.strokeStyle = f.col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(f.x, f.y, f.r0 + (f.r1 - f.r0) * (1 - k), 0, 6.283); ctx.stroke(); }
    else if (f.k === 'part') { ctx.fillStyle = f.col; ctx.fillRect(f.x - 2, f.y - 2, 4, 4); }
    else if (f.k === 'arc') { ctx.strokeStyle = f.col; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, f.a - f.half, f.a + f.half); ctx.stroke(); }
    else if (f.k === 'beam') { ctx.strokeStyle = f.col; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); }
    else if (f.k === 'bolt') { ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(f.x + (Math.random() - .5) * 20, f.y - 320); ctx.lineTo(f.x + (Math.random() - .5) * 14, f.y - 160); ctx.lineTo(f.x, f.y); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
  for (const t of g.txt) {
    ctx.globalAlpha = Math.min(1, t.t * 2); ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.strokeText(t.s, t.x, t.y);
    ctx.fillStyle = t.col; ctx.fillText(t.s, t.x, t.y);
  }
  ctx.globalAlpha = 1;
}

// 공격 터치 중인 위치에 조준점 표시
function drawTouchTarget(P, g) {
  if (!inp.touchAim || !P.alive || g.state !== 'play') return;
  const x = inp.tx, y = inp.ty;
  ctx.strokeStyle = 'rgba(255,120,120,.85)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 16, 0, 6.283); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 24, y); ctx.lineTo(x - 8, y); ctx.moveTo(x + 8, y); ctx.lineTo(x + 24, y);
  ctx.moveTo(x, y - 24); ctx.lineTo(x, y - 8); ctx.moveTo(x, y + 8); ctx.lineTo(x, y + 24); ctx.stroke();
}

function drawMinimap(g, VW) {
  const ms = Math.min(100, Math.max(76, VW * .21)), mx0 = VW - ms - 10, my0 = 10, k = ms / WORLD;
  ctx.fillStyle = 'rgba(10,14,26,.75)'; ctx.fillRect(mx0, my0, ms, ms);
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; ctx.strokeRect(mx0, my0, ms, ms);
  ctx.save(); ctx.beginPath(); ctx.rect(mx0, my0, ms, ms); ctx.clip();
  ctx.strokeStyle = '#ff5a5f'; ctx.beginPath(); ctx.arc(mx0 + CEN * k, my0 + CEN * k, g.zone.R * k, 0, 6.283); ctx.stroke();
  ctx.restore();
  for (const f of g.fighters) {
    if (!f.alive) continue;
    ctx.fillStyle = f.id === 0 ? '#ffffff' : C[f.ab];
    ctx.beginPath(); ctx.arc(mx0 + f.x * k, my0 + f.y * k, f.id === 0 ? 3.2 : 2.2, 0, 6.283); ctx.fill();
  }
}

// 화면 밖 적 방향 화살표
function drawOffscreen(g, P, cx, cy, zoom, VW, VH) {
  for (const f of g.fighters) {
    if (f === P || !f.alive) continue;
    const sxp = (f.x - cx) * zoom, syp = (f.y - cy) * zoom, m = 22;
    if (sxp >= 0 && sxp <= VW && syp >= 0 && syp <= VH) continue;
    const px = Math.max(m, Math.min(VW - m, sxp)), py = Math.max(m + 70, Math.min(VH - m, syp));
    const a = Math.atan2(syp - VH / 2, sxp - VW / 2);
    ctx.save(); ctx.translate(px, py); ctx.rotate(a); ctx.fillStyle = C[f.ab]; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, 8); ctx.lineTo(-8, -8); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}

function drawCountdown(g, VW, VH) {
  if (g.cd > 0 && g.state === 'play') {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 64px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(String(Math.ceil(g.cd)), VW / 2, VH * 0.4);
  } else if (g.t < 4 && g.state === 'play') {
    ctx.globalAlpha = Math.max(0, 1 - (g.t - 3)); ctx.fillStyle = '#fff'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('FIGHT!', VW / 2, VH * 0.4); ctx.globalAlpha = 1;
  }
}
