// 탭 전환, 시작 화면(인원 선택 · 능력 각성 · 다시 뽑기), 결과 화면 버튼
import { $ } from './utils.js';
import { AB, AB_KEYS, C } from './config.js';
import { view, resize } from './view.js';
import { newGame, menuState } from './state.js';

function setTab(play) {
  view.playTab = play;
  $('plan').style.display = play ? 'none' : 'block';
  $('play').style.display = play ? 'block' : 'none';
  $('tabPlan').className = play ? '' : 'on';
  $('tabPlay').className = play ? 'on' : '';
  if (play) resize();
}
$('tabPlan').onclick = () => setTab(false);
$('tabPlay').onclick = () => setTab(true);

let playerCount = 6, rolled = null, rerolls = 1;

function showRoll() {
  const a = AB[rolled], card = $('rollCard');
  card.classList.remove('hidden'); card.style.borderColor = C[rolled];
  $('rollName').textContent = a.name + ' · 스킬 ' + a.sk; $('rollName').style.color = C[rolled];
  $('rollDesc').textContent = a.desc;
  $('btnRoll').classList.add('hidden'); $('btnGo').classList.remove('hidden');
  const rr = $('btnReroll'); rr.classList.remove('hidden');
  rr.textContent = rerolls > 0 ? '다시 뽑기 (1회 남음)' : '다시 뽑기 사용함'; rr.style.opacity = rerolls > 0 ? 1 : .4;
  $('startMsg').textContent = '능력이 각성했습니다!';
}
function roll() {
  const pool = AB_KEYS.filter(k => k !== rolled);
  rolled = pool[Math.floor(Math.random() * pool.length)]; showRoll();
}
function resetRoll() {
  rolled = null; rerolls = 1;
  $('rollCard').classList.add('hidden'); $('btnGo').classList.add('hidden'); $('btnReroll').classList.add('hidden');
  $('btnRoll').classList.remove('hidden');
  $('startMsg').innerHTML = '각성하면 능력 14종 중 하나가 무작위로 정해집니다.<br>마음에 안 들면 딱 한 번 다시 뽑을 수 있어요.';
}

$('btnRoll').onclick = roll;
$('btnReroll').onclick = () => { if (rerolls > 0) { rerolls--; roll(); } };
document.querySelectorAll('#cnt button').forEach(b => {
  b.onclick = () => {
    playerCount = +b.dataset.n;
    document.querySelectorAll('#cnt button').forEach(x => x.classList.toggle('on', x === b));
  };
});
$('btnGo').onclick = () => { $('ovStart').classList.add('hidden'); newGame(rolled, playerCount); };
$('btnAgain').onclick = () => { $('ovEnd').classList.add('hidden'); $('ovStart').classList.remove('hidden'); resetRoll(); menuState(); };
