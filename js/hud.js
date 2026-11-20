// HUD(체력, 정보, 킬피드, 버튼 쿨다운)와 결과 화면
import { $ } from './utils.js';
import { AB, ZONE_DELAY, ZONE_MIN } from './config.js';
import { G } from './state.js';

export function hud() {
  const g = G, P = g.fighters[0];
  $('hpBar').style.width = (P.hp / P.mhp * 100) + '%';
  $('hpTxt').textContent = Math.ceil(P.hp) + ' / ' + P.mhp;
  $('info').textContent = AB[P.ab].name + ' · 생존 ' + g.alive + '/' + g.n + ' · 처치 ' + P.kills;
  $('zoneTxt').textContent = g.cd > 0 ? '' : (g.zt < ZONE_DELAY ? '자기장 ' + Math.ceil(ZONE_DELAY - g.zt) + '초 후 축소' : (g.zone.R > ZONE_MIN ? '자기장 축소 중!' : '자기장 최종 구역'));
  $('feed').innerHTML = g.feed.map(f => f.s).join('<br>');
  const s = $('bSkill'), d = $('bDash');
  if (P.skCd > 0) { s.classList.add('cd'); s.textContent = P.skCd.toFixed(1); } else { s.classList.remove('cd'); s.textContent = AB[P.ab].sk; }
  if (P.dashCd > 0) { d.classList.add('cd'); d.textContent = P.dashCd.toFixed(1); } else { d.classList.remove('cd'); d.textContent = '구르기'; }
}

export function endGame(win) {
  const g = G; g.state = win ? 'win' : 'dead'; const P = g.fighters[0];
  $('endT').textContent = win ? '최후의 1인! 승리' : g.placement + '위로 탈락';
  $('endS').textContent = (win ? '1위' : g.placement + '위') + ' / ' + g.n + '명 · 처치 ' + P.kills + ' · 능력: ' + AB[P.ab].name;
  $('ovEnd').classList.remove('hidden');
}
