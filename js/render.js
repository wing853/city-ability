// 캔버스 그리기: 맵, 자기장, 장판, 참가자, 투사체, 효과, 미니맵, 화면 밖 화살표, 터치 조준점
import { GRID, WORLD, CEN, C, AB } from './config.js';
import { G } from './state.js';
import { rects, lots, trees } from './world.js';
import { ctx, view } from './view.js';
import { inp } from './input.js';

export function draw() {
  const g = G, P = g.fighters[0], { VW, VH, DPR } = view;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#070a12'; ctx.fillRect(0, 0, VW, VH);

  // 카메라
  const zoom = Math.max(0.6, Math.min(1.6, Math.min(VW, VH) / 520));
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

function drawMap(g) {
  ctx.fillStyle = '#161c2b'; ctx.fillRect(0, 0, WORLD, WORLD);
  ctx.strokeStyle = '#38425f'; ctx.lineWidth = 2; ctx.setLineDash([22, 20]);
  for (let k = 0; k < GRID - 1; k++) { const v = 300 + k * 300; ctx.beginPath(); ctx.moveTo(v, 0); ctx.lineTo(v, WORLD); ctx.moveTo(0, v); ctx.lineTo(WORLD, v); ctx.stroke(); }
  ctx.setLineDash([]);
  for (const l of lots) { ctx.fillStyle = l.park ? '#1d3a2b' : '#232c47'; ctx.fillRect(l.x - 6, l.y - 6, 212, 212); }
  for (const t of trees) { ctx.fillStyle = '#2b5a3f'; ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, 6.283); ctx.fill(); }
  for (const b of rects) {
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(b.x + 6, b.y + 8, b.w, b.h);
    ctx.fillStyle = b.col; ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = b.col2; ctx.fillRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16);
    if (!b.temp) { ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(b.x + 16, b.y + 16, 28, 18); }
  }
  for (const m of g.mines) {
    ctx.fillStyle = '#2a2f3d'; ctx.beginPath(); ctx.arc(m.x, m.y, 9, 0, 6.283); ctx.fill();
    ctx.fillStyle = (m.arm <= 0 && Math.floor(g.t * 4) % 2) ? '#ff4d4d' : '#7a4a1a'; ctx.beginPath(); ctx.arc(m.x, m.y, 4, 0, 6.283); ctx.fill();
  }
}

function drawAreas(g) {
  // 자기장
  ctx.fillStyle = 'rgba(229,72,77,.26)';
  ctx.beginPath(); ctx.rect(-50, -50, WORLD + 100, WORLD + 100); ctx.arc(CEN, CEN, g.zone.R, 0, 6.283, true); ctx.fill('evenodd');
  ctx.strokeStyle = '#ff5a5f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(CEN, CEN, g.zone.R, 0, 6.283); ctx.stroke();
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
    const col = C[f.ab];
    ctx.globalAlpha = f.inv > 0 ? 0.55 : 1;
    ctx.fillStyle = col + '55'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r + 7, 0, 6.283); ctx.fill();
    ctx.fillStyle = f.hit > 0 ? '#fff' : (f.frz > 0 ? '#bfefff' : col); ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
    ctx.strokeStyle = f.id === 0 ? '#fff' : 'rgba(0,0,0,.6)'; ctx.lineWidth = f.id === 0 ? 3 : 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(f.x + f.aim.x * 8, f.y + f.aim.y * 8, 3.5, 0, 6.283); ctx.fill();
    if (f.slow > 0 && f.frz <= 0) { ctx.strokeStyle = '#d6f4ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x, f.y, f.r + 5, 0, 6.283); ctx.stroke(); }
    if (f.poison && f.poison.t > 0) { ctx.strokeStyle = C.poison; ctx.lineWidth = 2; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(f.x, f.y, f.r + 4, 0, 6.283); ctx.stroke(); ctx.setLineDash([]); }
    if (f.reflect > 0) { ctx.strokeStyle = C.mirror; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(f.x, f.y, f.r + 10, 0, 6.283); ctx.stroke(); }
    if (f.haste > 0) { ctx.strokeStyle = C.haste; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x, f.y, f.r + 6 + Math.sin(g.t * 20) * 2, 0, 6.283); ctx.stroke(); }
    ctx.globalAlpha = 1;
    const w = 34;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(f.x - w / 2, f.y - f.r - 14, w, 5);
    ctx.fillStyle = f.id === 0 ? '#6ee787' : '#ff7a7a'; ctx.fillRect(f.x - w / 2, f.y - f.r - 14, w * Math.max(0, f.hp / f.mhp), 5);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(f.id === 0 ? '나' : AB[f.ab].name, f.x, f.y - f.r - 18);
  }
}

function drawProjectiles(g) {
  for (const b of g.pr) {
    ctx.fillStyle = b.col + '66'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 4, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, Math.max(2, b.r - 1), 0, 6.283); ctx.fill();
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
  const ms = 84, mx0 = VW - ms - 8, my0 = 8, k = ms / WORLD;
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
