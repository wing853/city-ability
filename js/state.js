// 경기 상태(G)와 참가자 생성
import { WORLD, ZR0, AB_KEYS } from './config.js';
import { clearTempRects } from './world.js';
import { shuffle } from './utils.js';
import { resetActions } from './input.js';

export let G = null;

function pickSpawns(n) {
  const pts = []; for (let a = 300; a < WORLD; a += 300) for (let b = 300; b < WORLD; b += 300) pts.push([a, b]);
  shuffle(pts); const out = [pts[0]];
  while (out.length < n) {
    let best = null, bd = -1;
    for (const p of pts) {
      if (out.includes(p)) continue;
      let m = 1e9; for (const q of out) m = Math.min(m, Math.hypot(p[0] - q[0], p[1] - q[1]));
      if (m > bd) { bd = m; best = p; }
    }
    out.push(best);
  }
  return shuffle(out);
}

function mkFighter(id, ab, x, y) {
  const body = ab === 'body';
  return {
    id, ab, bot: id !== 0, x, y, r: 13, hp: body ? 350 : 280, mhp: body ? 350 : 280, spd: body ? 196 : 185,
    face: { x: 1, y: 0 }, aim: { x: 1, y: 0 }, inv: 0, hit: 0, atkCd: 0.2, skCd: 2, dashCd: 0, dashT: 0, dashV: { x: 1, y: 0 }, dashSpd: 640, chg: false, hset: null,
    slow: 0, frz: 0, haste: 0, reflect: 0, poison: null, kb: 0, kx: 0, ky: 0, alive: true, kills: 0, vx: 0, vy: 0, mvd: 0,
    // 봇 AI 상태
    side: Math.random() < .5 ? 1 : -1, sideT: 1, errT: 0, err: 0, stuck: 0, wall: 0, wdir: 1, wantMove: false
  };
}

/** 내 능력 ab, 총 인원 n으로 새 경기 시작. 봇은 남은 능력을 겹치지 않게 나눠 가짐 */
export function newGame(ab, n = 6) {
  clearTempRects();
  const pool = shuffle(AB_KEYS.filter(k => k !== ab)), sp = pickSpawns(n);
  const fs = [mkFighter(0, ab, sp[0][0], sp[0][1])];
  for (let i = 1; i < n; i++) fs.push(mkFighter(i, pool[i - 1], sp[i][0], sp[i][1]));
  G = {
    t: 0, cd: 3, state: 'play', fighters: fs, pr: [], fx: [], txt: [], zones: [], fields: [], mines: [], feed: [], n,
    zone: { R: ZR0 }, zt: 0, alive: n, placement: 0, shake: 0, cam: { x: 0, y: 0, zoom: 1 }, auto: false
  };
  resetActions();
}

/** 메뉴 화면 배경용 정지 상태 */
export function menuState() { newGame('fire', 6); G.state = 'menu'; }
