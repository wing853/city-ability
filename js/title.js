// 시작 화면(게임 시작 · 능력 도감 · 설정 · 게임 종료)
import { $ } from './utils.js';
import { AB, AB_KEYS, C } from './config.js';
import { settings, saveSettings } from './settings.js';

const IMG_W = 1672, IMG_H = 941;          // 시작 화면 원본 크기(버튼 좌표 기준)
const title = $('ovTitle');
const asset = p => new URL('../assets/' + p, import.meta.url).href;

// 도감 설명: 기본 공격 / 스킬
const MOVES = {
  fire:   ['화염구. 맞은 곳 주변에 약한 범위 피해.', '주변 폭발과 넉백, 날아오는 탄 제거'],
  shock:  ['매우 빠른 번개탄.', '앞쪽에 표식, 0.55초 뒤 낙뢰. 피할 수 있음'],
  grav:   ['짧은 부채꼴 충격파와 넉백.', '2.6초간 끌어당기는 장판'],
  ice:    ['얼음 화살. 맞으면 1.5초간 느려짐.', '주변 적을 1.2초간 얼림'],
  shadow: ['빠른 단검 베기(근접).', '조준 방향으로 순간이동, 짧은 무적'],
  body:   ['강한 주먹과 넉백. 체력 350.', '조준 방향으로 돌진, 부딪힌 적에게 피해와 넉백'],
  poison: ['독침. 맞으면 3초간 지속 피해.', '3.2초간 머무는 독 장판'],
  wind:   ['넓고 관통하는 돌풍. 강하게 밀어냄.', '주변을 크게 밀어내고 날아오는 탄 제거'],
  light:  ['관통 광선(즉시 명중, 건물에 막힘).', '전방 부채꼴 적을 0.8초 기절'],
  earth:  ['느리고 묵직한 바위 투척.', '앞에 4초간 유지되는 바위벽 생성'],
  haste:  ['매우 빠른 연사 탄.', '5초간 이동·공격 속도 증가'],
  life:   ['맞으면 체력을 조금 훔치는 탄.', '즉시 체력 55 회복'],
  bomb:   ['수류탄. 닿거나 끝나면 폭발.', '발밑에 지뢰 설치(최대 3개)'],
  mirror: ['은빛 파편탄.', '1.4초간 날아오는 투사체를 쏜 사람에게 되돌림']
};

function buildCodex() {
  const list = $('codexList');
  list.innerHTML = '';
  for (const k of AB_KEYS) {
    const a = AB[k], m = MOVES[k];
    const el = document.createElement('div');
    el.className = 'cx'; el.style.setProperty('--c', C[k]);
    el.innerHTML =
      '<img class="cx-art" alt="" src="' + asset('characters/' + k + '.webp') + '">' +
      '<div class="cx-body"><div class="cx-name"></div><div class="cx-desc"></div>' +
      '<div class="cx-move"><img alt="" src="' + asset('ui/' + k + '_attack.webp') + '"><div><b>기본 공격</b><span></span></div></div>' +
      '<div class="cx-move"><img alt="" src="' + asset('ui/' + k + '_skill.webp') + '"><div><b></b><span></span></div></div></div>';
    el.querySelector('.cx-name').textContent = a.name;
    el.querySelector('.cx-desc').textContent = a.desc;
    const moves = el.querySelectorAll('.cx-move');
    moves[0].querySelector('span').textContent = m[0];
    moves[1].querySelector('b').textContent = '스킬 · ' + a.sk + ' (쿨 ' + a.cd + '초)';
    moves[1].querySelector('span').textContent = m[1];
    list.appendChild(el);
  }
}

function syncSettings() {
  for (const box of document.querySelectorAll('[data-set]')) box.checked = !!settings[box.dataset.set];
}
for (const box of document.querySelectorAll('[data-set]')) {
  box.addEventListener('change', () => { settings[box.dataset.set] = box.checked; saveSettings(); });
}
for (const b of document.querySelectorAll('[data-close]')) b.onclick = () => $(b.dataset.close).classList.add('hidden');

let toastT = 0;
function toast(msg) {
  const t = $('titleToast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.add('hidden'), 2600);
}

const actions = {
  start() { title.classList.add('hidden'); $('ovStart').classList.remove('hidden'); },
  codex() { buildCodex(); $('ovCodex').classList.remove('hidden'); $('ovCodex').scrollTop = 0; },
  settings() { syncSettings(); $('ovSettings').classList.remove('hidden'); },
  quit() {
    window.close();  // 스크립트로 연 창이 아니면 브라우저가 막음
    setTimeout(() => toast('웹에서는 브라우저 탭을 닫아 종료해 주세요'), 150);
  }
};
for (const b of title.querySelectorAll('.t-btn')) b.onclick = () => actions[b.dataset.act]();

/** 가로 화면이면 원본 그림의 버튼 위치에 터치 영역을 맞추고, 세로면 재배치 레이아웃 사용 */
export function layoutTitle() {
  const W = title.clientWidth, H = title.clientHeight;
  if (!W || !H) return;
  // 그림 속 버튼이 화면 안에 다 들어오는 비율이면 가로 레이아웃
  const s = Math.max(W / IMG_W, H / IMG_H), ox = (W - IMG_W * s) / 2, oy = (H - IMG_H * s) / 2;
  const wide = ox + 858 * s >= 0 && ox + 1312 * s <= W && W / H >= 1.25;
  title.classList.toggle('wide', wide);
  for (const b of title.querySelectorAll('.t-btn')) {
    if (!wide) { b.style.left = b.style.top = b.style.width = b.style.height = ''; continue; }
    const [x0, y0, x1, y1] = b.dataset.box.split(',').map(Number);
    b.style.left = (ox + x0 * s) + 'px'; b.style.top = (oy + y0 * s) + 'px';
    b.style.width = ((x1 - x0) * s) + 'px'; b.style.height = ((y1 - y0) * s) + 'px';
  }
}
export function showTitle() { title.classList.remove('hidden'); layoutTitle(); }
addEventListener('resize', layoutTitle);
layoutTitle();
