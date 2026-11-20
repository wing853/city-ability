// Neon city environment art layer. Procedural SVG textures are cached as images.
// All geometry comes from world.js; collision and gameplay remain unchanged.
let sceneCanvas=null, sceneKey='';
function image(svg){const im=new Image();im.onload=()=>{sceneKey='';};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);return im}
const wrap=(w,h,body)=>'<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'+body+'</svg>';
function buildingSVG(w,h,variant){
 const v=variant%5, neon=['#ff86ca','#71d9ff','#ffc07c','#b5a1ff','#7df0cf'][v];
 const sign=['CAFE','24 MART','ARCADE','STUDIO','LOUNGE'][v];
 const windows=Array.from({length:Math.max(2,Math.floor((w-30)/28))},(_,i)=>'<rect x="'+(14+i*28)+'" y="'+(h-15)+'" width="15" height="8" rx="1" fill="#f7c68c" opacity=".85"/>').join('');
 return wrap(w+36,h+49,`<defs>
 <linearGradient id="roof" x2="1" y2="1"><stop stop-color="#59677f"/><stop offset=".55" stop-color="#343d5a"/><stop offset="1" stop-color="#202c46"/></linearGradient>
 <linearGradient id="wall" x2="0" y2="1"><stop stop-color="#303955"/><stop offset="1" stop-color="#141a32"/></linearGradient>
 <filter id="glow"><feGaussianBlur stdDeviation="3"/></filter>
 <pattern id="tiles" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#b5b4d0" opacity=".10"/></pattern>
 </defs>
 <path d="M22 28H${w+25}V${h+40}H22Z" fill="#080b1d" opacity=".55"/>
 <rect x="9" y="23" width="${w}" height="${h+19}" fill="url(#wall)" stroke="#13152b" stroke-width="3"/>
 <rect x="2" y="3" width="${w}" height="${h}" rx="2" fill="url(#roof)" stroke="#99a0bd" stroke-width="4"/>
 <rect x="10" y="11" width="${w-16}" height="${h-17}" fill="url(#tiles)" stroke="#9b9bb5" stroke-width="2"/>
 <path d="M12 13H${w-8}" stroke="#c4c6dd" stroke-width="3" opacity=".55"/>
 <rect x="20" y="22" width="53" height="37" fill="#19253b" stroke="#7c809a" stroke-width="3"/>
 <rect x="26" y="28" width="41" height="24" fill="#8bd4de"/>
 <path d="M29 30H47" stroke="#e7ffff" stroke-width="3" opacity=".6"/>
 <rect x="${w-68}" y="22" width="47" height="39" rx="3" fill="#1b2539" stroke="#8a90a9" stroke-width="3"/>
 <circle cx="${w-45}" cy="41" r="15" fill="#42546c" stroke="#a3aec2" stroke-width="3"/>
 <circle cx="${w-45}" cy="41" r="8" fill="#26344b"/>
 <path d="M${w-45} 27V55M${w-59} 41H${w-31}" stroke="#647f9a" stroke-width="2"/>
 <rect x="23" y="${h-62}" width="${Math.max(50,w-46)}" height="29" rx="3" fill="#18243d" stroke="${neon}" stroke-width="2"/>
 <rect x="27" y="${h-58}" width="${Math.max(42,w-54)}" height="21" fill="${neon}" opacity=".22"/>
 <text x="${w/2}" y="${h-42}" font-size="15" font-family="sans-serif" text-anchor="middle" font-weight="bold" fill="#fff0f7">${sign}</text>
 <rect x="14" y="${h+5}" width="${w-24}" height="15" fill="#222a40"/>
 ${windows}
 <path d="M12 ${h+20}H${w-6}" stroke="${neon}" stroke-width="3" opacity=".8"/>
 <path d="M12 ${h+20}H${w-6}" stroke="${neon}" stroke-width="8" opacity=".22" filter="url(#glow)"/>
 `)}
const buildings=new Map();
function getBuilding(w,h,v){const key=w+','+h+','+v;if(!buildings.has(key))buildings.set(key,image(buildingSVG(w,h,v)));return buildings.get(key)}
const blossom=image(wrap(128,128,`<defs><radialGradient id="p"><stop stop-color="#ffd9fa"/><stop offset="1" stop-color="#d46abb"/></radialGradient></defs>
<ellipse cx="65" cy="115" rx="30" ry="9" fill="#050b18" opacity=".4"/>
<path d="M65 110L64 59M64 78L38 48M64 72L92 42M64 59L65 26" stroke="#493146" stroke-width="8" stroke-linecap="round" fill="none"/>
<g fill="url(#p)" stroke="#fbd1ff" stroke-width="1">
<circle cx="39" cy="39" r="20"/><circle cx="61" cy="29" r="24"/><circle cx="88" cy="40" r="22"/><circle cx="99" cy="58" r="18"/><circle cx="32" cy="65" r="17"/><circle cx="59" cy="61" r="23"/><circle cx="79" cy="68" r="20"/>
</g><g fill="#fff1ff" opacity=".8"><circle cx="29" cy="40" r="3"/><circle cx="65" cy="19" r="4"/><circle cx="92" cy="51" r="3"/><circle cx="53" cy="67" r="4"/><circle cx="84" cy="77" r="3"/></g>`));
const lamp=image(wrap(80,95,`<defs><radialGradient id="l"><stop stop-color="#ffd88a" stop-opacity=".6"/><stop offset="1" stop-color="#ffd88a" stop-opacity="0"/></radialGradient></defs><circle cx="40" cy="30" r="38" fill="url(#l)"/><path d="M40 82V31" stroke="#182035" stroke-width="5"/><path d="M31 23H49L45 36H35Z" fill="#ffd49b" stroke="#4c3442" stroke-width="3"/><circle cx="40" cy="25" r="5" fill="#fff4bf"/>`));
function drawImage(ctx,im,x,y,w,h){if(im.complete&&im.naturalWidth)ctx.drawImage(im,x,y,w,h)}
function paintCity(ctx,grid,world,rects,lots,trees){
 ctx.fillStyle='#181d33';ctx.fillRect(0,0,world,world);
 // Wet asphalt with restrained reflections.
 for(let i=0;i<grid;i++)for(let j=0;j<grid;j++){
  const x=i*300,y=j*300;
  ctx.fillStyle='#292e4a';ctx.fillRect(x+36,y+36,228,228);
  ctx.strokeStyle='#62647e';ctx.lineWidth=3;ctx.strokeRect(x+36,y+36,228,228);
  ctx.fillStyle='rgba(255,193,232,.12)';ctx.fillRect(x+8,y+34,7,115);
  ctx.fillStyle='rgba(101,192,255,.12)';ctx.fillRect(x+286,y+154,5,104);
  // Wet road glints and subtle pavement seams.
  ctx.fillStyle='rgba(95,180,245,.08)';
  for(let n=0;n<9;n++){const px=x+((n*79+31)%280),py=y+((n*53+72)%280);ctx.fillRect(px,py,4+(n%4)*8,1+n%2)}
  ctx.fillStyle='rgba(255,100,205,.09)';ctx.fillRect(x+37,y+262,80,3);ctx.fillRect(x+260,y+41,4,78);
  ctx.strokeStyle='rgba(220,200,230,.08)';ctx.lineWidth=1;
  for(let p=48;p<255;p+=21){ctx.beginPath();ctx.moveTo(x+36,y+p);ctx.lineTo(x+264,y+p);ctx.stroke()}
  ctx.fillStyle='#c3bdd7a6';
  for(let k=0;k<5;k++){ctx.fillRect(x+91+k*25,y+15,14,18);ctx.fillRect(x+15,y+91+k*25,18,14)}
  ctx.strokeStyle='#cfae81a0';ctx.lineWidth=2;ctx.setLineDash([15,17]);
  ctx.beginPath();ctx.moveTo(x+150,y);ctx.lineTo(x+150,y+35);ctx.moveTo(x,y+150);ctx.lineTo(x+35,y+150);ctx.stroke();ctx.setLineDash([]);
  drawImage(ctx,lamp,x+5,y+5,65,78);
 }
 for(const l of lots)if(l.park){
  ctx.fillStyle='#274d48';ctx.fillRect(l.x-5,l.y-5,210,210);
  ctx.strokeStyle='#6d8d82';ctx.lineWidth=3;ctx.strokeRect(l.x-5,l.y-5,210,210);
  ctx.fillStyle='#a1a0a0';ctx.fillRect(l.x+88,l.y-5,21,210);ctx.fillRect(l.x-5,l.y+88,210,21);
 }
 for(const b of rects){
  if(b.temp){ctx.fillStyle='#65505c';ctx.fillRect(b.x,b.y,b.w,b.h);ctx.strokeStyle='#ffa9bb';ctx.strokeRect(b.x,b.y,b.w,b.h);continue}
  const w=Math.max(64,Math.round(b.w)),h=Math.max(64,Math.round(b.h)),variant=Math.abs(Math.floor(b.x/300)*7+Math.floor(b.y/300)*3)%5;
  drawImage(ctx,getBuilding(w,h,variant),b.x-2,b.y-3,w+36,h+49);
 }
 for(const t of trees)drawImage(ctx,blossom,t.x-t.r*2.8,t.y-t.r*3.7,t.r*5.6,t.r*5.6);
 // Roadside details and deterministic sakura petals.
 for(let i=0;i<grid;i++)for(let j=0;j<grid;j++){
  const x=i*300,y=j*300;
  ctx.fillStyle='#171b2b';ctx.fillRect(x+37,y+38,34,7);ctx.fillRect(x+229,y+251,34,7);
  ctx.strokeStyle='#8994a8';ctx.lineWidth=1;
  for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(x+40+k*8,y+38);ctx.lineTo(x+40+k*8,y+45);ctx.stroke()}
  const tint=(i+j)%2?'#ff78c9':'#6ecbff';
  ctx.fillStyle=tint;ctx.globalAlpha=.16;
  ctx.fillRect(x+45,y+267,60,3);ctx.fillRect(x+52,y+274,43,2);
  ctx.globalAlpha=1;ctx.fillStyle='#ffc5ed';
  for(let p=0;p<8;p++){
   const px=x+((p*37+i*11+j*17)%280)+10;
   const py=y+((p*73+i*13+j*7)%280)+10;
   ctx.globalAlpha=.35+(p%3)*.15;
   ctx.beginPath();ctx.ellipse(px,py,2.3,1.1,p*1.2,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
 }
}
export function drawNeonCity(ctx,grid,world,rects,lots,trees){
 // Cache static scene; temporary walls trigger a rebuild.
 const key=world+':'+rects.length+':'+rects.filter(b=>b.temp).map(b=>[b.x,b.y,b.w,b.h].join(',')).join(';');
 if(!sceneCanvas||sceneKey!==key){
  const surface=document.createElement('canvas');surface.width=world;surface.height=world;
  const c=surface.getContext('2d',{alpha:false});
  if(!c){paintCity(ctx,grid,world,rects,lots,trees);return}
  paintCity(c,grid,world,rects,lots,trees);
  sceneCanvas=surface;sceneKey=key;
 }
 ctx.drawImage(sceneCanvas,0,0);
}
