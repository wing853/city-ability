// Raster-first city renderer. No SVG generation.
// Gameplay collision remains exclusively in world.js.
const images={};
let revision=0;
function load(name,url){
 const img=new Image();img.decoding='async';
 img.onload=()=>{revision++};
 img.onerror=()=>{};
 img.src=new URL(url,import.meta.url).href;images[name]=img;
}
load('road','../assets/environment/wet_neon_road.webp');
load('cafe','../assets/environment/building_cafe.webp');
load('mart','../assets/environment/building_mart.webp');
load('tree','../assets/environment/cherry_blossom.webp');
load('lamp','../assets/environment/street_lamp.webp');
function ready(img){return img&&img.complete&&img.naturalWidth>0}
let cached=null,key='';
function paint(ctx,grid,world,rects,lots,trees){
 ctx.fillStyle='#191d31';ctx.fillRect(0,0,world,world);
 const road=images.road;
 if(ready(road)){
  const tile=ctx.createPattern(road,'repeat');
  if(tile){ctx.fillStyle=tile;ctx.fillRect(0,0,world,world)}
 }
 for(let i=0;i<grid;i++)for(let j=0;j<grid;j++){
  const x=i*300,y=j*300;
  ctx.strokeStyle='rgba(200,190,224,.42)';ctx.lineWidth=3;
  ctx.strokeRect(x+35,y+35,230,230);
  ctx.fillStyle='rgba(205,205,229,.48)';
  for(let k=0;k<5;k++){
   ctx.fillRect(x+95+k*23,y+14,12,18);
   ctx.fillRect(x+95+k*23,y+268,12,18);
   ctx.fillRect(x+14,y+95+k*23,18,12);
   ctx.fillRect(x+268,y+95+k*23,18,12);
  }
  if(ready(images.lamp)){
   ctx.drawImage(images.lamp,x+18,y+17,50,70);
  }else{
   ctx.fillStyle='#ffc883';ctx.beginPath();ctx.arc(x+36,y+36,4,0,Math.PI*2);ctx.fill();
  }
 }
 for(const l of lots)if(l.park){
  ctx.fillStyle='#2b4945';ctx.fillRect(l.x-5,l.y-5,210,210);
  ctx.fillStyle='#8b9d92';ctx.fillRect(l.x+90,l.y,20,200);
 }
 for(const b of rects){
  if(b.temp){ctx.fillStyle='#705062';ctx.fillRect(b.x,b.y,b.w,b.h);continue}
  const building=((Math.floor(b.x/300)+Math.floor(b.y/300))%2===0)?images.cafe:images.mart;
  if(ready(building)){
   ctx.drawImage(building,b.x,b.y,b.w,b.h);
  }else{
   // Non-SVG fallback until the real raster building asset is uploaded.
   ctx.fillStyle='#303b53';ctx.fillRect(b.x+8,b.y+12,b.w,b.h);
   ctx.fillStyle='#4a536e';ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.strokeStyle='#8796b5';ctx.lineWidth=3;ctx.strokeRect(b.x+5,b.y+5,b.w-10,b.h-10);
  }
 }
 for(const t of trees){
  if(ready(images.tree))ctx.drawImage(images.tree,t.x-t.r*2.5,t.y-t.r*3.2,t.r*5,t.r*5);
  else{
   ctx.fillStyle='#d88bbd';ctx.beginPath();ctx.arc(t.x,t.y,t.r*1.3,0,Math.PI*2);ctx.fill();
  }
 }
}
export function drawNeonCity(ctx,grid,world,rects,lots,trees){
 const current=revision+':'+world+':'+rects.length+':'+rects.filter(b=>b.temp).map(b=>b.x+','+b.y).join(';');
 if(!cached||key!==current){
  const canvas=document.createElement('canvas');canvas.width=world;canvas.height=world;
  const c=canvas.getContext('2d',{alpha:false});
  if(!c){paint(ctx,grid,world,rects,lots,trees);return}
  paint(c,grid,world,rects,lots,trees);
  cached=canvas;key=current;
 }
 ctx.drawImage(cached,0,0);
}
