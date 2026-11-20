// HUD(체력, 정보, 킬피드, 버튼 쿨다운)와 결과 화면
import { $ } from './utils.js';
import { AB, ZONE_DELAY, ZONE_MIN } from './config.js';
import { G } from './state.js';

// 능력별 버튼 아이콘(assets/ui/<능력>_attack.webp, <능력>_skill.webp)
let iconAb = null;
const icon = (ab, kind) => new URL('../assets/ui/' + ab + '_' + kind + '.webp', import.meta.url).href;
function setIcons(ab) {
  if (ab === iconAb) return;
  iconAb = ab;
  const a = $('bAttack'), s = $('bSkill');
  a.style.background = 'center/cover no-repeat url(' + icon(ab, 'attack') + ')'; a.textContent = '';
  s.style.background = 'center/cover no-repeat url(' + icon(ab, 'skill') + ')';
  a.setAttribute('aria-label', '기본 공격'); s.setAttribute('aria-label', '스킬 ' + AB[ab].sk);
  const d = $('bDash');
  d.style.background = 'center/cover no-repeat url(' + new URL('../assets/ui/dash.webp', import.meta.url).href + ')';
  d.setAttribute('aria-label', '구르기');
  a.classList.add('icon'); s.classList.add('icon'); d.classList.add('icon');
}

export function hud() {
  const g = G, P = g.fighters[0];
  $('hpBar').style.width = (P.hp / P.mhp * 100) + '%';
  $('hpTxt').textContent = Math.ceil(P.hp) + ' / ' + P.mhp;
  $('info').textContent = AB[P.ab].name + ' · 생존 ' + g.alive + '/' + g.n + ' · 처치 ' + P.kills;
  $('zoneTxt').textContent = g.cd > 0 ? '' : (g.zt < ZONE_DELAY ? '자기장 ' + Math.ceil(ZONE_DELAY - g.zt) + '초 후 축소' : (g.zone.R > ZONE_MIN ? '자기장 축소 중!' : '자기장 최종 구역'));
  $('feed').innerHTML = g.feed.map(f => f.s).join('<br>');
  const s = $('bSkill'), d = $('bDash');
  setIcons(P.ab);
  if (P.skCd > 0) { s.classList.add('cd'); s.textContent = P.skCd.toFixed(1); } else { s.classList.remove('cd'); s.textContent = ''; }
  if (P.dashCd > 0) { d.classList.add('cd'); d.textContent = P.dashCd.toFixed(1); } else { d.classList.remove('cd'); d.textContent = ''; }
}

export function endGame(win) {
  const g = G; g.state = win ? 'win' : 'dead'; const P = g.fighters[0];
  $('endT').textContent = win ? '최후의 1인! 승리' : g.placement + '위로 탈락';
  $('endS').textContent = (win ? '1위' : g.placement + '위') + ' / ' + g.n + '명 · 처치 ' + P.kills + ' · 능력: ' + AB[P.ab].name;
  $('ovEnd').classList.remove('hidden');
}
