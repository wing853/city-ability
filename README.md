# 도시능력자

능력자들이 도시에서 최후의 1인을 가리는 탑다운 난투 게임 프로토타입 (나 + AI 봇, 4~10인).

## 실행

ES 모듈을 쓰기 때문에 `index.html`을 파일로 직접 열면 동작하지 않습니다. 로컬 서버로 여세요.

```bash
npm start            # node server.js, 의존성 없음 (PORT 환경변수 사용)
# http://localhost:8000
```

GitHub Pages에 올려도 그대로 동작합니다.

## 조작

- 모바일: 왼쪽 드래그 이동, **오른쪽 터치 = 터치한 위치로 공격**(누르고 있으면 연사, 손가락을 움직이면 조준이 따라감), 스킬·구르기 버튼
- PC: WASD 이동, 마우스 조준, 클릭 공격, Space 스킬, Shift 구르기

## 구조

```
index.html        마크업(기획서 탭, 플레이 화면, 시작/결과 오버레이)
css/style.css     스타일
js/
  main.js         진입점, 게임 루프
  config.js       맵 크기, 자기장 수치, 능력 14종 정의, 봇 성향 표
  world.js        도시 맵 생성, 충돌, 시야 판정
  view.js         캔버스, 화면 크기
  input.js        키보드 · 마우스 · 터치 입력
  player.js       입력 → 플레이어 조작값
  ai.js           봇 AI
  state.js        경기 상태(G), 새 경기 생성
  combat.js       피해 · 사망, 기본 공격, 스킬
  fighter.js      참가자 1명의 프레임 갱신
  update.js       전체 시뮬레이션(투사체, 장판, 지뢰, 자기장)
  effects.js      파티클 · 링 · 데미지 숫자
  render.js       캔버스 그리기, 미니맵
  hud.js          HUD, 결과 화면
  menu.js         탭, 능력 각성 · 다시 뽑기, 인원 선택
```

능력 수치를 바꾸려면 `js/combat.js`(공격·스킬)와 `js/config.js`(쿨타임·설명·봇 성향)를 보면 됩니다.
