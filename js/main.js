// 진입점: 초기화와 게임 루프
import { view, resize } from './view.js';
import { G, menuState } from './state.js';
import { update } from './update.js';
import { draw } from './render.js';
import { hud } from './hud.js';
import './menu.js';
import { layoutTitle } from './title.js';

let last = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
  if (!view.playTab || !G) return;
  if (G.state === 'play') update(dt);
  draw(); hud();
}

resize();
menuState();
requestAnimationFrame(loop);

// 플레이 탭으로 돌아왔을 때 시작 화면 버튼 위치 다시 계산
document.getElementById('tabPlay').addEventListener('click', () => requestAnimationFrame(layoutTitle));
