# 게임 이미지 에셋

| 파일 | 용도 | 크기 |
|---|---|---|
| `environment/building_cafe.webp` | 건물(카페), 투명 배경 | 444×335 |
| `environment/building_mart.webp` | 건물(편의점), 투명 배경 | 454×334 |
| `environment/cherry_blossom.webp` | 공원 벚꽃나무, 투명 배경 | 372×334 |
| `environment/street_lamp.webp` | 가로등, 투명 배경 | 127×334 |
| `environment/wet_neon_road.webp` | 도로 바닥 반복 타일 | 334×334 |
| `characters/shadow.webp` | 그림자 능력 캐릭터, 투명 배경 | 250×334 |

- 렌더러는 원본 비율을 유지해서 그립니다. 충돌 판정은 `js/world.js` 그대로입니다.
- 캐릭터 이미지는 `js/characterArt.js`의 `available` 목록에 있는 능력만 불러옵니다. 새 캐릭터(`<능력키>.webp`)를 넣으면 목록에 추가하세요. 없는 능력은 캔버스 그림으로 대체됩니다.
- 이미지가 없거나 로드에 실패하면 각 렌더러의 캔버스 대체 그림이 쓰입니다.
