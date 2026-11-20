// 게임 데이터: 맵 크기, 능력 정의, 봇 성향, 자기장 수치
export const GRID = 8, WORLD = GRID * 300, CEN = WORLD / 2, ZR0 = Math.hypot(CEN, CEN) + 60;

// 자기장
export const ZONE_DELAY = 20, ZONE_SPEED = 28, ZONE_MIN = 160, ZONE_DPS = 14;

export const C = {
  fire: '#ff7a1a', shock: '#4cc9ff', grav: '#b57bff', ice: '#d6f4ff', shadow: '#9aa0b5', body: '#ffd23f', poison: '#a3e635',
  wind: '#5eead4', light: '#fff3a0', earth: '#c08457', haste: '#f472b6', life: '#e11d48', bomb: '#d97706', mirror: '#e5e7eb'
};

export const AB = {
  fire:   { name: '화염', sk: '폭염', cd: 7, desc: '화염구와 범위 폭발. 중거리 화력형.' },
  shock:  { name: '전격', sk: '낙뢰', cd: 6, desc: '빠른 번개탄과 표식 낙뢰. 정확한 조준이 강점.' },
  grav:   { name: '중력', sk: '중력장', cd: 9, desc: '충격파와 끌어당기는 장판. 근접 제압형.' },
  ice:    { name: '빙결', sk: '서리폭풍', cd: 9, desc: '적을 느리게 하는 화살과 얼음 폭풍.' },
  shadow: { name: '그림자', sk: '그림자 이동', cd: 5, desc: '빠른 단검과 순간이동. 기동력 암살형.' },
  body:   { name: '신체강화', sk: '돌진', cd: 6, desc: '체력 350의 근접형. 돌진으로 파고듭니다.' },
  poison: { name: '독', sk: '독구름', cd: 9, desc: '독침으로 지속 피해를 쌓고, 독구름으로 지역을 장악합니다.' },
  wind:   { name: '바람', sk: '회오리', cd: 8, desc: '관통하는 돌풍으로 밀어내고, 회오리로 주변을 날려버립니다.' },
  light:  { name: '빛', sk: '섬광', cd: 9, desc: '관통 광선과 전방 기절 섬광. 직선 저격형.' },
  earth:  { name: '대지', sk: '바위벽', cd: 9, desc: '묵직한 바위 투척과 임시 벽 생성. 지형을 만드는 전략형.' },
  haste:  { name: '가속', sk: '질주', cd: 10, desc: '빠른 연사형. 스킬로 5초간 이동·공격 속도 폭증.' },
  life:   { name: '생명', sk: '회복', cd: 12, desc: '흡혈 탄으로 체력을 훔치고 스킬로 크게 회복하는 지구력형.' },
  bomb:   { name: '폭발물', sk: '지뢰', cd: 8, desc: '터지는 수류탄과 설치형 지뢰. 길목 장악형.' },
  mirror: { name: '반사', sk: '반사막', cd: 10, desc: '반사막으로 상대 투사체를 되돌려보내는 카운터형.' }
};
export const AB_KEYS = Object.keys(AB);

// 봇 성향: 선호 거리, 공격 사거리, 투사체 속도(예측 사격용), 원거리 여부
export const BP = {
  fire:   { ideal: 250, rng: 420, ps: 520, ranged: true },  shock:  { ideal: 230, rng: 400, ps: 950, ranged: true },
  grav:   { ideal: 80,  rng: 105, ps: 0,   ranged: false }, ice:    { ideal: 250, rng: 420, ps: 560, ranged: true },
  shadow: { ideal: 55,  rng: 80,  ps: 0,   ranged: false }, body:   { ideal: 50,  rng: 70,  ps: 0,   ranged: false },
  poison: { ideal: 240, rng: 420, ps: 560, ranged: true },  wind:   { ideal: 190, rng: 300, ps: 600, ranged: true },
  light:  { ideal: 240, rng: 360, ps: 0,   ranged: true },  earth:  { ideal: 270, rng: 440, ps: 380, ranged: true },
  haste:  { ideal: 220, rng: 380, ps: 700, ranged: true },  life:   { ideal: 200, rng: 320, ps: 650, ranged: true },
  bomb:   { ideal: 200, rng: 300, ps: 420, ranged: true },  mirror: { ideal: 220, rng: 400, ps: 600, ranged: true }
};
