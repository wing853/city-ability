// Raster-only character art. No generated SVG or data:image/svg+xml.
// Add transparent 256x288 or larger WebP/PNG sprites under assets/characters/.
// Canvas fallback in render.js remains active until each file is available.
export const fighterArt = {};
// 실제 이미지가 있는 능력만 불러옴(없는 파일 요청으로 404가 나지 않게). 새 이미지를 넣으면 여기에 추가.
const available=['fire','shock','grav','ice','shadow','body','poison','wind','light','earth','haste','life','bomb','mirror'];
for(const ability of available){
  const img=new Image();
  img.decoding='async';
  img.src=new URL('../assets/characters/'+ability+'.webp',import.meta.url).href;
  fighterArt[ability]=img;
}
