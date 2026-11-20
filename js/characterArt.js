// 14 unique resolution-independent SVG fighter designs. Generated once and cached.
// Visuals only: abilities, collisions and combat stay in the existing modules.
const styles={
 fire:['#ff803b','#fbd2b6','#a62d20','flame'],shock:['#65d8ff','#f4d0b7','#dceaff','bolt'],
 grav:['#b996ff','#dcbda7','#34244f','orb'],ice:['#b9f2ff','#f5d5c9','#f1f8ff','crystal'],
 shadow:['#929bbf','#d9b39f','#151727','dagger'],body:['#ffd65c','#d69b7c','#57352b','fist'],
 poison:['#a6ee64','#d2b49d','#497d3d','vial'],wind:['#6ff0d7','#eac7ac','#3c7987','scarf'],
 light:['#fff0a4','#f5d2ad','#edc57a','halo'],earth:['#c99b70','#d8ad8c','#654a32','shield'],
 haste:['#ff82c1','#f1c2a4','#bd386c','speed'],life:['#ff6e8d','#edc3ac','#693b4b','leaf'],
 bomb:['#ffa85d','#d7aa8c','#4d4035','goggles'],mirror:['#d2e6f5','#f0d4c6','#a3b7c9','mirror']
};
const gear={
 flame:'<path d="M92 74 Q82 60 95 49 Q93 64 103 60 Q112 75 98 87Z" fill="#ff9a30" stroke="#ffe0a1" stroke-width="2"/>',
 bolt:'<path d="M90 52 L104 54 L96 69 L108 67 L87 94 L92 73 L82 74Z" fill="#e3fcff" stroke="#47cfff" stroke-width="2"/>',
 orb:'<circle cx="97" cy="73" r="16" fill="#7146bf" stroke="#e0bbff" stroke-width="3"/><circle cx="92" cy="67" r="5" fill="#e8d6ff"/>',
 crystal:'<path d="M97 47 L110 67 L102 91 L87 76 L85 59Z" fill="#a6eaff" stroke="#fff" stroke-width="2"/><path d="M97 47 L97 83 L110 67" fill="none" stroke="#5eb6de" stroke-width="2"/>',
 dagger:'<path d="M88 83 L109 42 L104 76 L93 91Z" fill="#a7b0d4" stroke="#f0f1ff" stroke-width="2"/>',
 fist:'<rect x="85" y="58" width="27" height="29" rx="8" fill="#dba747" stroke="#fff0ad" stroke-width="3"/><path d="M90 64 H106 M91 71 H106" stroke="#705021" stroke-width="3"/>',
 vial:'<path d="M90 58 H104 V64 L110 82 Q110 90 98 90 Q86 90 86 82 L92 64Z" fill="#64c43b" stroke="#d5ff9d" stroke-width="3"/><path d="M91 77 H106" stroke="#e8ffa8" stroke-width="3"/>',
 scarf:'<path d="M45 55 Q13 51 8 77 Q25 62 45 72 L53 62Z" fill="#79e9d9" stroke="#d8fff8" stroke-width="2"/>',
 halo:'<ellipse cx="64" cy="15" rx="28" ry="8" fill="none" stroke="#fff5a4" stroke-width="5"/><path d="M91 72 L103 51 L109 76Z" fill="#fff9c5"/>',
 shield:'<path d="M87 55 L111 58 L110 85 L98 96 L86 84Z" fill="#755a42" stroke="#d4b58e" stroke-width="4"/><path d="M98 62 V89 M91 75 H105" stroke="#e6cba7" stroke-width="3"/>',
 speed:'<path d="M87 54 L113 46 L101 59 L119 58 L91 75Z" fill="#ffb1d6" stroke="#fff" stroke-width="2"/>',
 leaf:'<path d="M88 82 Q85 51 112 48 Q119 76 88 82Z" fill="#68d995" stroke="#e6ffce" stroke-width="2"/><path d="M89 80 L108 55" stroke="#f2fff0" stroke-width="2"/>',
 goggles:'<path d="M41 29 H87 V41 H41Z" fill="#312f3d" stroke="#ffc27d" stroke-width="3"/><rect x="46" y="32" width="16" height="7" fill="#8edaff"/><rect x="67" y="32" width="16" height="7" fill="#8edaff"/>',
 mirror:'<path d="M88 49 L111 58 L107 88 L88 94 L81 70Z" fill="#b9dbe9" stroke="#fff" stroke-width="3"/><path d="M91 56 L103 61 L96 85" stroke="#ecfbff" stroke-width="3"/>'
};
function spriteSvg(key){
 const [accent,skin,hair,type]=styles[key]||styles.shadow;
 const coat=key==='body'?'#4c3c35':key==='light'?'#d2c9a7':'#23354d';
 const hood=key==='shadow'?'<path d="M36 38 Q28 3 64 3 Q98 3 92 41 L84 46 Q83 15 64 16 Q45 15 44 46Z" fill="#111525" stroke="#8993b4" stroke-width="2"/>':'';
 const hairshape=key==='ice'||key==='shock'?'<path d="M36 39 L32 20 L45 22 L49 7 L60 17 L74 4 L79 19 L93 16 L87 43 L80 33 L71 37 L61 29 L49 39Z"/>':key==='fire'?'<path d="M36 39 L40 12 L51 21 L63 4 L75 19 L88 10 L91 41 L80 34 L71 36 L58 28 L48 40Z"/>':'<path d="M38 40 Q27 12 49 9 Q72 -1 87 16 L91 41 L81 34 L77 23 L67 35 L54 25 L47 43Z"/>';
 const bulky=key==='body'||key==='earth';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 144" width="512" height="576">
 <defs><linearGradient id="j" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="${accent}"/><stop offset=".23" stop-color="${coat}"/><stop offset="1" stop-color="#101a2b"/></linearGradient><radialGradient id="a"><stop stop-color="${accent}" stop-opacity=".6"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs>
 <ellipse cx="64" cy="131" rx="35" ry="9" fill="#03070e" opacity=".35"/>
 <ellipse cx="64" cy="123" rx="37" ry="14" fill="url(#a)"/>
 <path d="M45 99 L41 126 L57 131 L64 102Z M70 102 L73 131 L88 126 L83 98Z" fill="#142238" stroke="#83a0b7" stroke-width="2"/>
 <path d="M40 125 L57 125 L59 134 L39 135Z M72 125 L89 125 L91 135 L70 135Z" fill="#0b1625" stroke="${accent}" stroke-width="2"/>
 <path d="M42 60 Q26 67 ${bulky?'19':'27'} 99 L40 108 L53 81Z M84 60 Q101 69 ${bulky?'109':'102'} 99 L89 108 L76 81Z" fill="#1d3045" stroke="${accent}" stroke-width="3"/>
 <path d="M40 64 Q64 53 87 64 L93 106 Q64 119 35 106Z" fill="url(#j)" stroke="#90afc0" stroke-width="3"/>
 <path d="M48 70 L63 83 L79 70 L84 99 L64 111 L44 99Z" fill="#19293c" stroke="${accent}" stroke-width="2"/>
 <path d="M61 82 L67 82 L70 102 L64 109 L58 102Z" fill="${accent}" stroke="#e8fcff" stroke-width="1"/>
 <path d="M36 97 L47 101 L43 114 L30 108Z M86 101 L98 97 L103 108 L90 114Z" fill="#1c3446" stroke="${accent}" stroke-width="2"/>
 <path d="M55 51 V66 Q64 73 74 65 V51Z" fill="${skin}"/>
 <ellipse cx="64" cy="39" rx="25" ry="29" fill="${skin}" stroke="#b88678" stroke-width="1.5"/>
 <g fill="${hair}" stroke="#263042" stroke-width="1.5">${hairshape}</g>
 <path d="M48 45 Q54 41 60 45 M69 45 Q75 41 81 45" stroke="#192335" stroke-width="2.5" fill="none" stroke-linecap="round"/>
 <path d="M58 55 Q65 58 72 54" stroke="#b97e75" stroke-width="1.5" fill="none"/>
 ${hood}${gear[type]}
 <path d="M46 77 L53 81 M76 81 L82 77" stroke="${accent}" stroke-width="3"/>
 </svg>`;
}
export const fighterArt={};
for(const key of Object.keys(styles)){
 const img=new Image();
 img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(spriteSvg(key));
 fighterArt[key]=img;
}
