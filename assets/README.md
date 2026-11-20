# 게임 이미지 에셋

| 파일 | 용도 | 크기 |
|---|---|---|
| `environment/building_cafe.webp` | 건물(카페), 투명 배경 | 444×335 |
| `environment/building_mart.webp` | 건물(편의점), 투명 배경 | 454×334 |
| `environment/cherry_blossom.webp` | 공원 벚꽃나무, 투명 배경 | 372×334 |
| `environment/street_lamp.webp` | 가로등, 투명 배경 | 127×334 |
| `environment/wet_neon_road.webp` | 도로 바닥 반복 타일 | 334×334 |
| `characters/<능력키>.webp` | 능력별 캐릭터 14종(fire, shock, grav, ice, shadow, body, poison, wind, light, earth, haste, life, bomb, mirror), 투명 배경 | 약 300×300 |

- 렌더러는 원본 비율을 유지해서 그립니다. 충돌 판정은 `js/world.js` 그대로입니다.
- 캐릭터 이미지는 `js/characterArt.js`의 `available` 목록에 있는 능력만 불러옵니다. 능력을 추가하면 이미지와 목록을 함께 추가하세요.
- 이미지가 없거나 로드에 실패하면 각 렌더러의 캔버스 대체 그림이 쓰입니다.

## 버튼 아이콘 (`ui/`)

- `ui/<능력키>_attack.webp`: 기본 공격 버튼 아이콘(14종)
- `ui/<능력키>_skill.webp`: 스킬 버튼 아이콘(14종)
- `ui/dash.webp`: 구르기 버튼 아이콘
- 모두 160×160 원형, 투명 배경. `js/hud.js`가 내 능력에 맞는 아이콘을 버튼에 넣습니다.
