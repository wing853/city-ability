// 사용자 설정(이 기기 브라우저에 저장)
const KEY = 'cityAbility.settings';
const defaults = { shake: true, dmgText: true, autoAim: true };
export const settings = { ...defaults };
try { Object.assign(settings, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* 저장소 사용 불가: 기본값 사용 */ }
export function saveSettings() {
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* 무시 */ }
}
