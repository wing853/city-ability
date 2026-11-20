// Raster-only character art. No generated SVG or data:image/svg+xml.
// Add transparent 256x288 or larger WebP/PNG sprites under assets/characters/.
// Canvas fallback in render.js remains active until each file is available.
export const fighterArt = {};
const abilities=['fire','shock','grav','ice','shadow','body','poison','wind','light','earth','haste','life','bomb','mirror'];
for(const ability of abilities){
  const img=new Image();
  img.decoding='async';
  img.src=new URL('../assets/characters/'+ability+'.webp',import.meta.url).href;
  fighterArt[ability]=img;
}
