import * as THREE from './vendor/three/three.module.js';
import { OrbitControls } from './vendor/three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from './vendor/three/addons/environments/RoomEnvironment.js';
import { API_BASE } from './config.js';
import { FALLBACK_SUPPLIERS } from './fallback-data.js';

/* ============================== DATA ============================== */
// Fabric metadata needed by the 3D renderer/BOM math — must stay available
// synchronously and offline. Supplier/pricing data now lives server-side
// (see server/data/fabrics.seed.mjs) and is fetched on demand in the
// Sourcing panel via ensureSuppliers() below.
const FABRICS=[
 {id:'lace',name:'Chantilly Lace',comp:'52% nylon · 48% viscose',price:34,width:140,drape:0.82,sheer:true,thumb:'#575263',
  colors:[{n:'Noir',c:'#211F24'},{n:'Bone',c:'#EFE6D6'},{n:'Oxblood',c:'#5E2018'},{n:'Sage',c:'#6E7561'},{n:'Champagne',c:'#C9A96A'}]},
 {id:'satin',name:'Silk Charmeuse',comp:'100% mulberry silk · 19 mm',price:28.5,width:140,drape:0.9,thumb:'#9C2B23',
  colors:[{n:'Lacquer',c:'#9C2B23'},{n:'Ink',c:'#1C1B1E'},{n:'Bone',c:'#EFE6D6'},{n:'Bottle',c:'#2E4038'},{n:'Ochre',c:'#C0944A'},{n:'Plum',c:'#4A2C3F'}]},
 {id:'velvet',name:'Silk Velvet',comp:'Silk pile · rayon back',price:41,width:140,drape:0.62,thumb:'#1F4A38',
  colors:[{n:'Emerald',c:'#1F4A38'},{n:'Bordeaux',c:'#6B2432'},{n:'Midnight',c:'#23262E'},{n:'Rust',c:'#A65A2E'},{n:'Bone',c:'#E8DFCB'}]},
 {id:'crepe',name:'Wool Crepe',comp:'100% virgin wool · 210 g/m²',price:22,width:150,drape:0.5,thumb:'#33312E',
  colors:[{n:'Charcoal',c:'#33312E'},{n:'Camel',c:'#B08D57'},{n:'Ink',c:'#1C1B1E'},{n:'Olive',c:'#5B5A3A'},{n:'Chalk',c:'#E8E2D5'}]},
 {id:'poplin',name:'Cotton Poplin',comp:'100% organic cotton · 115 g/m²',price:8.2,width:148,drape:0.32,thumb:'#E5DDC9',
  colors:[{n:'Chalk',c:'#EDE7DA'},{n:'Poppy',c:'#C4441C'},{n:'Sage',c:'#77806B'},{n:'Ink',c:'#1C1B1E'},{n:'Maize',c:'#D9A93F'}]},
 {id:'denim',name:'Raw Denim 12 oz',comp:'100% cotton · right-hand twill',price:11,width:150,drape:0.12,thumb:'#2F3E5C',
  colors:[{n:'Raw Indigo',c:'#2F3E5C'},{n:'Stone',c:'#97A3B4'},{n:'Black',c:'#1E1F24'},{n:'Ecru',c:'#D8CFBE'}]},
 {id:'chiffon',name:'Silk Chiffon',comp:'100% silk · 8 mm',price:19.5,width:140,drape:0.95,sheer:true,thumb:'#C9B9A6',
  colors:[{n:'Blush',c:'#D8A79A'},{n:'Ivory',c:'#EFE6D6'},{n:'Smoke',c:'#6E6E75'},{n:'Sage',c:'#8A9082'},{n:'Powder',c:'#B7C0C4'}]},
 {id:'leather',name:'Lambskin Nappa',comp:'French lambskin · 0.7 mm',price:92,unit:'m²',width:0,drape:0.25,thumb:'#5E241C',
  colors:[{n:'Oxblood',c:'#5E241C'},{n:'Black',c:'#1A1813'},{n:'Cognac',c:'#8A4F2D'},{n:'Bone',c:'#E4DCC8'}]}
];
const PRESETS={
 hourglass:{label:'Hourglass',bust:92,waist:68,hip:98,shoulder:39},
 rectangle:{label:'Rectangle',bust:88,waist:76,hip:90,shoulder:38},
 pear:{label:'Pear',bust:84,waist:70,hip:102,shoulder:36},
 invtri:{label:'Inverted',bust:97,waist:79,hip:92,shoulder:44},
 athletic:{label:'Athletic',bust:93,waist:78,hip:94,shoulder:43}
};
const SILS={
 sheath:{label:'Sheath',lens:['mini','knee','midi'],dflt:'knee'},
 aline:{label:'A-Line',lens:['knee','midi'],dflt:'knee'},
 twopiece:{label:'Two-Piece',lens:['knee','midi'],dflt:'knee'},
 gown:{label:'Gown',lens:['floor'],dflt:'floor'}
};
const LENS={mini:{label:'Mini',y:0.385},knee:{label:'Knee',y:0.30},midi:{label:'Midi',y:0.205},floor:{label:'Floor',y:0.022}};
const NECKS={
 crew:{label:'Crew',y:0.8435,dip:2.6,back:2.2,shape:'round',neckBased:true},
 v:{label:'V-Neck',y:0.8435,dip:11.5,back:2.2,shape:'point',neckBased:true},
 sweetheart:{label:'Sweetheart',y:0.785,dip:4.6,back:1.5,shape:'heart',neckBased:false}
};
const SLEEVES={none:'Sleeveless',cap:'Cap',long:'Long'};
const BTNS={pearl:{label:'Pearl',dot:'#F3EEE3',price:0.9},gold:{label:'Gold',dot:'#C9A231',price:1.4},jet:{label:'Jet',dot:'#141210',price:0.5},wood:{label:'Wood',dot:'#8A5A2B',price:0.4}};
const SILG={
 sheath:'M8 4 H16 L17 9 L14.5 12 L15 36 H9 L9.5 12 L7 9 Z',
 aline:'M8 4 H16 L17 9 L13 12 L20.5 36 H3.5 L11 12 L7 9 Z',
 twopiece:'M8 4 H16 L17 8 L15 10.5 H9 L7 8 Z M9.5 14 H14.5 L19 36 H5 Z',
 gown:'M8 4 H16 L17 9 C17 12.5 14.5 14 14 17.5 L22 36 H2 L10 17.5 C9.5 14 7 12.5 7 9 Z'};
const NECKG={crew:'M5 13 C5 6 8 4 12 4 C16 4 19 6 19 13',v:'M5 13 L12 3.5 L19 13',sweetheart:'M5 13 C5 7 8 5 9.5 7.5 L12 10 L14.5 7.5 C16 5 19 7 19 13'};
const PRESETG={
 hourglass:'M7.2 9 H16.8 L16.2 15 C15.9 18 14 19 14 22 C14 25 15.9 26 16.2 29 L16.8 35 H7.2 L7.8 29 C8.1 26 10 25 10 22 C10 19 8.1 18 7.8 15 Z',
 rectangle:'M8 9 H16 C15.6 15 16.4 29 16 35 H8 C7.6 29 8.4 15 8 9 Z',
 pear:'M8.6 9 H15.4 C15.1 13 13.5 14 13.5 17 C13.5 20.5 18 22 18 26 L18.5 35 H5.5 L6 26 C6 22 10.5 20.5 10.5 17 C10.5 14 8.9 13 8.6 9 Z',
 invtri:'M6 9 H18 L17.4 15 C17.2 18.5 14 19.5 14 23 C14 26 15.6 27.5 15.9 31 L16 35 H8 L8.1 31 C8.4 27.5 10 26 10 23 C10 19.5 6.8 18.5 6.6 15 Z',
 athletic:'M5.5 9 H18.5 C18.2 13.5 15.4 15 15.2 19 C15 24 16 28 16.2 35 H7.8 C8 28 9 24 8.8 19 C8.6 15 5.8 13.5 5.5 9 Z'};
const ICONS={
 body:'<circle cx="12" cy="4.8" r="2.6"/><path d="M6.8 21.2v-2.6c0-3.2 2.3-5 5.2-5s5.2 1.8 5.2 5v2.6M12 13.6v7.6"/>',
 dress:'<path d="M8 3.5 H16 L17 8 L14 11 L18.5 20.5 H5.5 L10 11 L7 8 Z"/>',
 fabric:'<path d="M4 6c3-2 5-2 8 0s5 2 8 0M4 12c3-2 5-2 8 0s5 2 8 0M4 18c3-2 5-2 8 0s5 2 8 0"/>',
 button:'<circle cx="12" cy="12" r="7"/><circle cx="9.9" cy="10.9" r=".8"/><circle cx="14.1" cy="13.1" r=".8"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2"/>',
 spool:'<path d="M7 4h10M7 20h10M9 4v16M15 4v16M9 8.5c2 1.2 4 1.2 6 0M9 12c2 1.2 4 1.2 6 0M9 15.5c2 1.2 4 1.2 6 0"/>',
 rotate:'<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v4.5h-4.5"/>',
 ruler:'<rect x="3" y="9" width="18" height="7" rx="1"/><path d="M6.5 9v2.6M9.5 9v2.6M12.5 9v2.6M15.5 9v2.6M18.5 9v2.6"/>'};

/* ============================== STATE / HELPERS ============================== */
const state={
 panel:'body', preset:'hourglass',
 meas:{height:170,bust:90,waist:70,hip:97,shoulder:40},
 gar:{sil:'gown',neck:'sweetheart',sleeve:'none',len:'floor',ease:4,buttons:0,btnStyle:'pearl',belt:false,beltW:3.5,buckle:'gold'},
 fab:{id:'lace',color:'#211F24'},
 rings:true, spin:true, scanSource:null
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hexOK=s=>/^#[0-9a-fA-F]{6}$/.test(s);
const CONSENT_KEY='flo.consent.v1';   // consent record only — measurements are never persisted

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const M=THREE.MathUtils;
const FAB=()=>FABRICS.find(f=>f.id===state.fab.id);
const colorName=()=>FAB().colors.find(c=>c.c===state.fab.color)?.n||'CUSTOM';
const euSize=b=>M.clamp(32+2*Math.round((b-76)/4),30,54);
const fmt=v=>(v%1?v.toFixed(1):String(Math.round(v)));
let bomCache={outerA:0,slipA:0,buttons:0,zip:0}, bomCost=0, bomQtyTxt='—';

function toast(msg){
 const t=document.createElement('div'); t.className='toast'; t.textContent=msg;
 $('#toasts').append(t);
 setTimeout(()=>t.classList.add('out'),3000); setTimeout(()=>t.remove(),3500);
 while($('#toasts').children.length>3)$('#toasts').firstChild.remove();
}

/* ============================== SOURCING API ============================== */
// Suppliers/quotes live server-side (server/); fetched on demand with a short
// timeout and a bundled offline fallback, same degrade-gracefully idiom used
// for the pose engine/camera above — the 3D/measurement features must keep
// working with no network regardless of sourcing-API reachability.
async function fetchJSON(url,opts,timeoutMs=4000){
 const ctrl=new AbortController();
 const timer=setTimeout(()=>ctrl.abort(),timeoutMs);
 try{
   const r=await fetch(url,{...opts,signal:ctrl.signal});
   if(!r.ok)throw new Error(`HTTP ${r.status}`);
   return await r.json();
 }finally{clearTimeout(timer);}
}
const supplierCache={};   // fabricId -> {status:'loading'|'ready'|'offline', rows}
let quotesCache=null;     // null until first fetch attempt; then {status,rows}

function ensureSuppliers(fabricId){
 const c=supplierCache[fabricId];
 if(c&&c.status!=='error')return;
 supplierCache[fabricId]={status:'loading',rows:[]};
 fetchJSON(`${API_BASE}/fabrics/${fabricId}/suppliers`)
   .then(rows=>{
     supplierCache[fabricId]={status:'ready',rows};
     if(state.panel==='src'&&state.fab.id===fabricId)renderPanel();
   })
   .catch(()=>{
     supplierCache[fabricId]={status:'offline',rows:FALLBACK_SUPPLIERS[fabricId]||[]};
     if(state.panel==='src'&&state.fab.id===fabricId){renderPanel();toast('Offline — showing cached supplier data');}
   });
}
function ensureQuotes(){
 if(quotesCache!==null)return;
 quotesCache={status:'loading',rows:[]};
 fetchJSON(`${API_BASE}/quotes`)
  .then(rows=>{quotesCache={status:'ready',rows};if(state.panel==='src')renderPanel();})
  .catch(()=>{quotesCache={status:'offline',rows:[]};if(state.panel==='src')renderPanel();});
}
async function submitQuote(fabricId,supplierName,qty,qtyUnit){
 try{
   const quote=await fetchJSON(`${API_BASE}/quotes`,{
     method:'POST',headers:{'Content-Type':'application/json'},
     body:JSON.stringify({fabricId,supplierName,qty,qtyUnit})
   });
  quotesCache={status:'ready',rows:[quote,...(quotesCache?.rows||[])]};
   toast(`Quote requested — ${supplierName} · ${FAB().name} · ${qty}`);
   renderPanel();
 }catch(e){
   toast('Could not submit quote — check your connection and try again');
 }
}

/* ============================== GEOMETRY ============================== */
const SEG=40;
function circ(b,a){return Math.PI*(3*(a+b)-Math.sqrt((3*a+b)*(a+3*b)));}
function semiFromC(C,k){return C/(Math.PI*(3*(1+k)-Math.sqrt((3+k)*(1+3*k))));}
function crVal(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t;
 return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);}
function interpProfile(pts,y,key){
 if(y<=pts[0].y)return pts[0][key];
 const n=pts.length; if(y>=pts[n-1].y)return pts[n-1][key];
 let i=0; while(i<n-2&&pts[i+1].y<y)i++;
 const a=pts[i],b=pts[i+1],t=(y-a.y)/(b.y-a.y);
 return crVal(pts[Math.max(0,i-1)][key],a[key],b[key],pts[Math.min(n-1,i+2)][key],t);
}
function bodyProfile(m){
 const H=m.height,hs=H/170;
 const hipB=semiFromC(m.hip,0.74),hipA=hipB*0.74;
 const wB=semiFromC(m.waist,0.84),wA=wB*0.84;
 const bB=semiFromC(m.bust,0.78),bA=bB*0.78;
 const ubB=semiFromC(m.bust*0.78,0.8),ubA=ubB*0.8;
 const sh=m.shoulder/2, nb=semiFromC(33*hs,0.92);
 return [
  {y:0.462,w:hipB*0.92,d:hipA*0.90},{y:0.502,w:hipB*0.985,d:hipA*0.96},{y:0.532,w:hipB,d:hipA},
  {y:0.578,w:hipB*0.55+wB*0.45,d:hipA*0.55+wA*0.45},{y:0.635,w:wB,d:wA},{y:0.697,w:ubB,d:ubA},
  {y:0.737,w:bB,d:bA},{y:0.792,w:bB*0.93,d:bA*0.90},{y:0.812,w:sh*0.97,d:sh*0.60},
  {y:0.834,w:sh*0.34,d:sh*0.26},{y:0.852,w:nb,d:nb*0.92}];
}
let _prof=null,_profKey='';                                  // [M1] memoize the profile
function bodySemi(m,y){
 const k=m.height+'|'+m.bust+'|'+m.waist+'|'+m.hip+'|'+m.shoulder;
 if(k!==_profKey){_prof=bodyProfile(m);_profKey=k;}
 return {w:interpProfile(_prof,y,'w'),d:interpProfile(_prof,y,'d')};
}
function ellipsePts(y,b,a,seg=SEG){
 const pts=[];
 for(let j=0;j<=seg;j++){const th=j/seg*Math.PI*2;pts.push(V3(Math.sin(th)*b,y,Math.cos(th)*a));}
 return pts;
}
function loft(rings){
 const mR=rings.length,n=rings[0].length;
 const pos=new Float32Array(mR*n*3),uv=new Float32Array(mR*n*2);
 for(let i=0;i<mR;i++)for(let j=0;j<n;j++){
   const p=rings[i][j],k=i*n+j;
   pos[k*3]=p.x;pos[k*3+1]=p.y;pos[k*3+2]=p.z;
   uv[k*2]=j/(n-1);uv[k*2+1]=1-i/(mR-1);
 }
 const idx=[];
 for(let i=0;i<mR-1;i++)for(let j=0;j<n-1;j++){const a=i*n+j,b=a+1,c=a+n,d=c+1;idx.push(a,b,c,b,d,c);}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setIndex(idx);g.computeVertexNormals();
 const nrm=g.attributes.normal;                             // [L1] weld seam normals
 for(let i=0;i<mR;i++){
   const a=i*n,b=i*n+n-1;
   let nx=(nrm.getX(a)+nrm.getX(b))/2,ny=(nrm.getY(a)+nrm.getY(b))/2,nz=(nrm.getZ(a)+nrm.getZ(b))/2;
   const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
   nrm.setXYZ(a,nx,ny,nz);nrm.setXYZ(b,nx,ny,nz);
 }
 nrm.needsUpdate=true;
 return g;
}
function geoArea(geo){
 const idx=geo.index,p=geo.attributes.position;let A=0;
 for(let i=0;i<idx.count;i+=3){
   const a=idx.getX(i),b=idx.getX(i+1),c=idx.getX(i+2);
   const ax=p.getX(a),ay=p.getY(a),az=p.getZ(a);
   const e1x=p.getX(b)-ax,e1y=p.getY(b)-ay,e1z=p.getZ(b)-az;
   const e2x=p.getX(c)-ax,e2y=p.getY(c)-ay,e2z=p.getZ(c)-az;
   const cx=e1y*e2z-e1z*e2y,cy=e1z*e2x-e1x*e2z,cz=e1x*e2y-e1y*e2x;
   A+=Math.sqrt(cx*cx+cy*cy+cz*cz)/2;
 }
 return A;
}
function armFrame(m,side){
 const H=m.height,ang=0.15,joint=m.shoulder/2*0.96;
 return {S:V3(side*joint,0.812*H,0),D:V3(side*Math.sin(ang),-Math.cos(ang),0),
   u:V3(Math.cos(ang),side*Math.sin(ang),0),v:V3(0,0,1),L:(0.812-0.482)*H};
}
const armRadius=t=>t<0.55?M.lerp(4.6,3.75,t/0.55):M.lerp(3.75,2.9,(t-0.55)/0.45);
function skirtClampW(m,y){
 const hipB=semiFromC(m.hip,0.74);
 if(y>=0.472)return bodySemi(m,Math.min(y,0.852)).w;
 return M.lerp(hipB*0.95,hipB*0.62,M.clamp((0.472-y)/0.34,0,1));
}

/* ============================== TEXTURES & MATERIALS ============================== */
function mulberry(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const texCache=new Map();
function makeCanvas(size){const c=document.createElement('canvas');c.width=c.height=size;return c;}
function grayTex(canvas,rep){
 const t=new THREE.CanvasTexture(canvas);
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);return t;
}
function getFabricTextures(fid){
 if(texCache.has(fid))return texCache.get(fid);
 let out={bump:null};
 if(fid==='lace'){
   const c=makeCanvas(512),x=c.getContext('2d'),rnd=mulberry(7);
   x.fillStyle='#000';x.fillRect(0,0,512,512);
   x.fillStyle='rgba(255,255,255,.55)';
   for(let i=4;i<512;i+=7)for(let j=4;j<512;j+=7){x.beginPath();x.arc(i,j,.8,0,7);x.fill();}
   x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=1.6;
   for(let i=0;i<34;i++){x.beginPath();x.moveTo(rnd()*512,rnd()*512);
     x.quadraticCurveTo(rnd()*512,rnd()*512,rnd()*512,rnd()*512);x.stroke();}
   for(let i=0;i<22;i++){
     const cx0=rnd()*512,cy0=rnd()*512,pet=5+Math.floor(rnd()*3),rr=12+rnd()*16;
     x.strokeStyle='rgba(255,255,255,.92)';x.lineWidth=2.2;
     for(let p=0;p<pet;p++){const a=p/pet*Math.PI*2+rnd();
       x.beginPath();x.ellipse(cx0+Math.cos(a)*rr*.6,cy0+Math.sin(a)*rr*.6,rr*.55,rr*.26,a,0,7);x.stroke();}
     x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.arc(cx0,cy0,2.6,0,7);x.fill();
   }
   x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=2.6;
   for(const yy of [7,505]){for(let sx=0;sx<512;sx+=42){x.beginPath();x.arc(sx+21,yy,20,0,Math.PI);x.stroke();
     x.fillStyle='#fff';x.beginPath();x.arc(sx+21,yy-20,2,0,7);x.fill();}}
   out.alpha=grayTex(c,3);out.bump=out.alpha;
 }else{
   const c=makeCanvas(128),x=c.getContext('2d'),rnd=mulberry(11);
   x.fillStyle='#808080';x.fillRect(0,0,128,128);
   const finish=rep=>{out.bump=grayTex(c,rep)};
   if(fid==='poplin'){
     x.fillStyle='rgba(255,255,255,.16)';for(let y=0;y<128;y+=2)x.fillRect(0,y,128,1);
     x.fillStyle='rgba(0,0,0,.12)';for(let X=0;X<128;X+=2)x.fillRect(X,0,1,128);finish(6);
   }else if(fid==='denim'){
     x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=1.3;
     for(let i=-128;i<256;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i+128,128);x.stroke();}
     for(let i=0;i<300;i++){x.fillStyle=`rgba(${rnd()>.5?255:0},${rnd()>.5?255:0},0,.06)`;x.fillRect(rnd()*128,rnd()*128,1.5,1.5);}finish(6);
   }else if(fid==='leather'){
     for(let i=0;i<420;i++){const g=Math.floor(100+rnd()*70);
       x.fillStyle=`rgba(${g},${g},${g},.14)`;x.beginPath();
       x.arc(rnd()*128,rnd()*128,1.5+rnd()*4,0,7);x.fill();}finish(4);
   }else if(fid==='crepe'){
     for(let i=0;i<900;i++){const g=Math.floor(90+rnd()*90);
       x.fillStyle=`rgba(${g},${g},${g},.25)`;x.fillRect(rnd()*128,rnd()*128,1.6,1.6);}finish(6);
   }
 }
 texCache.set(fid,out);return out;
}
const matCache=new Map();
function fabricMaterial(fid,colorHex){
 const key=fid+'|'+colorHex;
 if(matCache.has(key))return matCache.get(key);
 const t=getFabricTextures(fid),c=new THREE.Color(colorHex),S=THREE.DoubleSide;
 let mat;
 if(fid==='satin')mat=new THREE.MeshPhysicalMaterial({color:c,roughness:.24,metalness:0,side:S,
   sheen:1,sheenRoughness:.28,sheenColor:c.clone().lerp(new THREE.Color('#fff'),.6),envMapIntensity:.9});
 else if(fid==='velvet')mat=new THREE.MeshPhysicalMaterial({color:c,roughness:1,metalness:0,side:S,
   sheen:1,sheenRoughness:.5,sheenColor:c.clone().lerp(new THREE.Color('#fff'),.72),envMapIntensity:.35});
 else if(fid==='lace')mat=new THREE.MeshPhysicalMaterial({color:c,roughness:.75,metalness:0,side:S,
   sheen:.35,alphaMap:t.alpha,transparent:true,alphaTest:.35,bumpMap:t.bump,bumpScale:.05});
 else if(fid==='chiffon')mat=new THREE.MeshPhysicalMaterial({color:c,roughness:.4,metalness:0,side:S,
   sheen:.8,sheenRoughness:.3,transparent:true,opacity:.55,sheenColor:c.clone().lerp(new THREE.Color('#fff'),.4)});
 else if(fid==='leather')mat=new THREE.MeshPhysicalMaterial({color:c,roughness:.5,metalness:0,side:S,
   clearcoat:.25,clearcoatRoughness:.4,bumpMap:t.bump,bumpScale:.07,envMapIntensity:.7});
 else{
   const sheen=fid==='poplin'?.12:fid==='crepe'?.25:.05;
   mat=new THREE.MeshPhysicalMaterial({color:c,roughness:fid==='poplin'?.8:.9,metalness:0,side:S,
     sheen,bumpMap:t.bump||null,bumpScale:fid==='denim'?.08:.045});
 }
 matCache.set(key,mat);return mat;
}
const slipMat=new THREE.MeshPhysicalMaterial({color:new THREE.Color('#E7D9C2'),roughness:.32,side:THREE.DoubleSide,sheen:.8,sheenRoughness:.4});
const mannequinMat=new THREE.MeshStandardMaterial({color:0xD5C8B2,roughness:.95,metalness:0});
const beltMat=new THREE.MeshPhysicalMaterial({color:0x241C15,roughness:.5,clearcoat:.15,side:THREE.DoubleSide}); // [H5]
const buttonMatCache={};
function buttonMaterial(style){
 if(buttonMatCache[style])return buttonMatCache[style];
 let m;
 if(style==='pearl')m=new THREE.MeshPhysicalMaterial({color:0xF3EEE3,roughness:.32,clearcoat:1,clearcoatRoughness:.12,iridescence:.4,iridescenceIOR:1.3});
 else if(style==='gold')m=new THREE.MeshPhysicalMaterial({color:0xC9A231,metalness:1,roughness:.26});
 else if(style==='jet')m=new THREE.MeshPhysicalMaterial({color:0x121110,roughness:.15,clearcoat:1});
 else m=new THREE.MeshStandardMaterial({color:0x8A5A2B,roughness:.7});
 return buttonMatCache[style]=m;
}
const tapeMat=new THREE.LineDashedMaterial({color:0xBF4520,dashSize:3.4,gapSize:2.4});

/* ============================== MANNEQUIN ============================== */
function buildMannequin(m){
 const H=m.height,hs=H/170,g=new THREE.Group();
 const add=(geo,mat)=>{const me=new THREE.Mesh(geo,mat);g.add(me);return me;};
 const NR=21,rings=[];
 for(let i=0;i<NR;i++){const y=0.462+(0.852-0.462)*i/(NR-1),s=bodySemi(m,y);
   rings.push(ellipsePts(y*H,s.w,s.d));}
 add(loft(rings),mannequinMat);
 const nb=semiFromC(33*hs,0.92);
 add(loft([ellipsePts(0.852*H,nb*1.05,nb*0.97),ellipsePts(0.875*H,nb,nb*0.94),ellipsePts(0.905*H,nb*0.94,nb*0.90)]),mannequinMat);
 const head=add(new THREE.SphereGeometry(1,32,24),mannequinMat);
 head.scale.set(7.4*hs,9.6*hs,8.4*hs);head.position.set(0,0.9525*H,0);
 for(const s of [1,-1]){
   const fr=armFrame(m,s),ar=[];
   for(let i=0;i<8;i++){const t=i/7,c=fr.S.clone().addScaledVector(fr.D,t*fr.L),r=armRadius(t)*hs,pts=[];
     for(let j=0;j<=16;j++){const ph=j/16*Math.PI*2;
       pts.push(c.clone().addScaledVector(fr.u,r*Math.cos(ph)).addScaledVector(fr.v,r*Math.sin(ph)));}
     ar.push(pts);}
   add(loft(ar),mannequinMat);
   const hand=add(new THREE.SphereGeometry(1,20,16),mannequinMat);
   hand.scale.set(2.6*hs,5.0*hs,1.6*hs);
   hand.position.copy(fr.S).addScaledVector(fr.D,fr.L+4.3*hs);
   hand.quaternion.setFromUnitVectors(V3(0,1,0),fr.D);
 }
 const hipB=semiFromC(m.hip,0.74),legX=hipB*0.42;
 const lp=[{y:0.47,r:hipB*0.55},{y:0.40,r:hipB*0.50},{y:0.315,r:6.2*hs},{y:0.26,r:6.9*hs},{y:0.185,r:5.5*hs},{y:0.115,r:4.5*hs},{y:0.038,r:3.5*hs}];
 for(const s of [1,-1]){
   const lr=lp.map(p=>ellipsePts(p.y*H,p.r,p.r*0.98).map(v=>{v.x+=s*legX;return v;}));
   add(loft(lr),mannequinMat);
   const foot=add(new THREE.SphereGeometry(1,20,16),mannequinMat);
   foot.scale.set(4.2*hs,4.1*hs,11.8*hs);
   foot.position.set(s*legX,0.031*H,5.2*hs);
 }
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 return g;
}

/* ============================== GARMENT ============================== */
function buildGarment(m,gar,fab){
 const H=m.height,hs=H/170;
 const F=FABRICS.find(x=>x.id===fab.id),drape=F.drape;
 const group=new THREE.Group(),bom={outerA:0,slipA:0,buttons:0,zip:0};
 const sil=SILS[gar.sil],nk=NECKS[gar.neck];
 const easeF=y=>{const s=bodySemi(m,y);return 1+gar.ease/circ(s.w,s.d);};
 const bodyRing=(yf,ex=0)=>{const s=bodySemi(m,yf),f=easeF(yf);
   return ellipsePts(yf*H,(s.w+ex)*f,(s.d+ex*0.9)*f);};
 const yb=nk.y*H;
 let rx,rz;
 if(nk.neckBased){const nb=semiFromC(33*hs,0.92);rx=nb+(gar.neck==='v'?3.1:2.6);rz=nb*0.94+2.5;}
 else{const s=bodySemi(m,0.78);rx=s.w*0.94;rz=s.d*0.92;}
 const neck=[];
 for(let j=0;j<=SEG;j++){
   const th=j/SEG*Math.PI*2,X=Math.sin(th)*rx,Z=Math.cos(th)*rz;
   const ff=M.clamp(Z/rz*3,0,1),bf=M.clamp(-Z/rz*3,0,1),u=Math.min(1,Math.abs(X)/rx);
   let y=yb,dip=0;
   if(nk.shape==='heart'){y+=1.7*hs*u*u*ff;dip=nk.dip*hs*(1-Math.pow(u,1.5))+0.7*hs*Math.exp(-Math.pow(X/(2.4*hs),2));}
   else if(nk.shape==='round')dip=nk.dip*hs*(1-u*u);
   else dip=nk.dip*hs*(1-u);
   y-=dip*ff+nk.back*hs*bf;
   neck.push(V3(X,y,Z));
 }
 const yTopMin=(yb-(nk.dip*hs+1.4))/H;
 const baseYs=sil==='gown'?[0.795,0.762,0.737,0.700,0.668,0.640,0.612,0.585]
   :sil==='twopiece'?[0.795,0.762,0.737,0.710,0.685]
   :[0.795,0.762,0.737,0.700,0.668,0.640];
 const bodYs=[yTopMin,...baseYs.filter(y=>y<yTopMin-0.004)];
 const hemY=sil==='gown'?LENS.floor.y:LENS[gar.len].y;
 const hipB=semiFromC(m.hip,0.74);
 let hemW,exp;
 if(sil==='sheath'){hemW=Math.max(bodyRing(0.640)[10].x*1.06,hipB*0.86);exp=0.8;}
 else if(sil==='aline'){hemW=hipB*(1.16+0.24*drape);exp=M.lerp(0.9,1.9,drape);}
 else if(sil==='twopiece'){hemW=hipB*(1.22+0.2*drape);exp=M.lerp(0.9,1.8,drape);}
 else{hemW=hipB*(1.5+0.35*drape);exp=M.lerp(1.0,1.8,drape);}
 function pushSkirt(rings,topY,topW){
   const nR=sil==='gown'?10:7;
   for(let i=1;i<=nR;i++){
     const y=M.lerp(topY,hemY,i/nR),t=(topY-y)/(topY-hemY);
     let w=topW+(hemW-topW)*Math.pow(Math.max(t,0),exp);
     w=Math.max(w,skirtClampW(m,Math.max(y,0.0))+gar.ease*0.22+0.45);
     const d=w*(sil==='sheath'?0.88:0.82);
     const pts=ellipsePts(y*H,w,d);
     if(sil!=='sheath'&&i>=nR-1){
       const amp=(drape*1.4)*(i===nR?1:0.5)/w;
       pts.forEach(p=>{const th=Math.atan2(p.x,p.z),f=1+amp*Math.sin(6*th+0.7);p.x*=f;p.z*=f;});
     }
     rings.push(pts);
   }
 }
 const lofts=[];
 if(sil==='twopiece'){
   const topRings=[neck,...bodYs.map(y=>bodyRing(y))];
   const s=bodySemi(m,0.660),f=easeF(0.660);
   topRings.push(ellipsePts(0.660*H,(s.w+0.8)*f,(s.d+0.7)*f));
   lofts.push({rings:topRings,slip:true,drop:1});
   const bs=bodySemi(m,0.645),bf=easeF(0.645);
   const bw=(bs.w+0.55)*bf,bd=(bs.d+0.5)*bf;
   const skRings=[ellipsePts(0.652*H,bw,bd),ellipsePts(0.626*H,bw,bd)];
   pushSkirt(skRings,0.626,bw);
   lofts.push({rings:skRings,slip:true,drop:0});
 }else{
   const rings=[neck,...bodYs.map(y=>bodyRing(y))];
   const topW=rings[rings.length-1][10].x;
   pushSkirt(rings,sil==='gown'?0.585:0.640,topW);
   lofts.push({rings,slip:true,drop:sil==='gown'?2:1});
 }
 if(gar.sleeve!=='none'){
   for(const s of [1,-1]){
     const fr=armFrame(m,s),tEnd=gar.sleeve==='cap'?0.30:0.93,NR=gar.sleeve==='cap'?5:7,sl=[];
     for(let i=0;i<NR;i++){
       const t=M.lerp(-0.045,tEnd,i/(NR-1)),c=fr.S.clone().addScaledVector(fr.D,t*fr.L);
       let r=armRadius(Math.max(0,t))*hs+0.85;
       if(t<0.05)r+=1.0;if(gar.sleeve==='long'&&t>0.85)r+=0.35;
       const pts=[];
       for(let j=0;j<=16;j++){const ph=j/16*Math.PI*2;
         pts.push(c.clone().addScaledVector(fr.u,r*Math.cos(ph)).addScaledVector(fr.v,r*Math.sin(ph)));}
       sl.push(pts);
     }
     lofts.push({rings:sl,slip:false,drop:0});
   }
 }
 const outerMat=fabricMaterial(fab.id,fab.color);
 for(const L of lofts){
   const mesh=new THREE.Mesh(loft(L.rings),outerMat);
   mesh.castShadow=!F.sheer;mesh.receiveShadow=true;
   group.add(mesh);bom.outerA+=geoArea(mesh.geometry);
   if(L.slip&&F.sheer){
     const sr=L.rings.slice(L.drop).map(ring=>ring.map(p=>V3(p.x*0.985,p.y,p.z*0.985)));
     if(sr.length>1){
       const sm=new THREE.Mesh(loft(sr),slipMat);
       sm.castShadow=true;sm.receiveShadow=false;
       group.add(sm);bom.slipA+=geoArea(sm.geometry);
     }
   }
 }
 if(gar.buttons>0){
   const bmat=buttonMaterial(gar.btnStyle);
   const geo=new THREE.SphereGeometry(1.05,18,14);
   const yA=yb-nk.dip*hs-3.2, yB=(sil==='gown'?0.585:sil==='twopiece'?0.662:0.640)*H;
   for(let i=0;i<gar.buttons;i++){
     const y=M.lerp(yA,yB,gar.buttons===1?0.5:i/(gar.buttons-1));
     const yf=M.clamp(y/H,0.462,0.85),s=bodySemi(m,yf),f=easeF(yf);
     const b=new THREE.Mesh(geo,bmat);
     b.scale.set(hs,hs,0.55*hs);
     b.position.set(0,y,s.d*f+1.1);
     b.castShadow=true;group.add(b);
   }
   bom.buttons=gar.buttons;
 }
 if(gar.belt){
   const bw=gar.beltW,s=bodySemi(m,0.645),f=easeF(0.645);
   const w=(s.w+0.55)*f+0.25,d=(s.d+0.5)*f+0.25;
   const belt=new THREE.Mesh(loft([ellipsePts(0.645*H+bw/2,w,d),ellipsePts(0.645*H-bw/2,w,d)]),beltMat);
   belt.castShadow=true;group.add(belt);
   const bk=new THREE.Mesh(new THREE.BoxGeometry(3.8*hs,2.6*hs,0.6*hs),
     buttonMaterial(gar.buckle==='gold'?'gold':'jet'));
   bk.position.set(0,0.645*H,d+0.6*hs);bk.castShadow=true;group.add(bk);
 }
 bom.zip=sil==='twopiece'?Math.max(20,Math.round(yb-0.655*H+4))
        :(sil==='sheath'||sil==='gown')?Math.round(yb-0.51*H):0;
 return {group,bom};
}

/* ============================== TAPES ============================== */
let tapeAnchors=[],tapeEls=[];
const TAPE_DEFS=[['BUST','bust',0.737],['WAIST','waist',0.635],['HIPS','hip',0.532]];
function buildTapes(m){
 const g=new THREE.Group();tapeAnchors=[];
 const H=m.height;
 for(const [name,,y] of TAPE_DEFS){
   const s=bodySemi(m,y);
   const pts=ellipsePts(y*H,s.w+2.2,s.d+2.2,64);
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),tapeMat);
   line.computeLineDistances();g.add(line);
   tapeAnchors.push(V3(s.w+3.6,y*H,0));
 }
 return g;
}

/* ============================== SCENE ============================== */
const stage=$('#stage');
let renderer=null;
try{renderer=new THREE.WebGLRenderer({antialias:true});}
catch(e){renderer=null;}
let scene,camera,controls,formG=null,garG=null,tapeG=null,userDragging=false;
if(renderer){
 try{
   renderer.setPixelRatio(Math.min(devicePixelRatio,2));
   renderer.outputColorSpace=THREE.SRGBColorSpace;
   renderer.toneMapping=THREE.ACESFilmicToneMapping;
   renderer.toneMappingExposure=1.05;
   renderer.shadowMap.enabled=true;
   renderer.shadowMap.type=THREE.PCFSoftShadowMap;
   stage.appendChild(renderer.domElement);
   renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();toast('3D context lost — recovering…');},false); // [M3]
   renderer.domElement.addEventListener('webglcontextrestored',()=>rebuild(),false);
   scene=new THREE.Scene();
   scene.background=new THREE.Color(0xE8E2D5);
   scene.fog=new THREE.Fog(0xE8E2D5,900,2200);
   camera=new THREE.PerspectiveCamera(30,1,2,4000);
   camera.position.setFromSpherical(new THREE.Spherical(460,1.32,0.42)).add(V3(0,90,0));
   controls=new OrbitControls(camera,renderer.domElement);
   controls.target.set(0,90,0);
   controls.enableDamping=true;controls.dampingFactor=.08;
   controls.enablePan=false;controls.minDistance=170;controls.maxDistance=950;
   controls.minPolarAngle=.4;controls.maxPolarAngle=1.62;
   controls.autoRotateSpeed=.7;
   controls.addEventListener('start',()=>{userDragging=true;});
   controls.addEventListener('end',()=>{userDragging=false;});
   scene.add(new THREE.HemisphereLight(0xF4EFE6,0x8A8074,0.75));
   const key=new THREE.DirectionalLight(0xFFF2E2,2.5);
   key.position.set(130,300,170);key.castShadow=true;
   key.shadow.mapSize.set(2048,2048);
   key.shadow.camera.left=-160;key.shadow.camera.right=160;
   key.shadow.camera.top=280;key.shadow.camera.bottom=-20;
   key.shadow.camera.near=50;key.shadow.camera.far=900;
   key.shadow.bias=-0.0006;key.shadow.normalBias=1.2;
   scene.add(key);
   const rim=new THREE.DirectionalLight(0xE8EAF0,0.7);rim.position.set(-200,220,-220);scene.add(rim);
   const pm=new THREE.PMREMGenerator(renderer);
   scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;
   const ground=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),new THREE.ShadowMaterial({opacity:.26}));
   ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
   const ped=new THREE.Mesh(new THREE.CylinderGeometry(28,30,1.6,64),
     new THREE.MeshStandardMaterial({color:0x262220,roughness:.9}));
   ped.position.y=.8;ped.receiveShadow=true;scene.add(ped);
   const onResize=()=>{
     if(!renderer)return;
     renderer.setSize(stage.clientWidth,stage.clientHeight);
     camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();
   };
   new ResizeObserver(onResize).observe(stage);onResize();
 }catch(e){                                                  // [C1]
   console.error('3D scene init failed:',e);
   if(renderer.domElement&&renderer.domElement.parentNode)renderer.domElement.remove();
   renderer=null;
 }
}
if(!renderer){                                               // [C1] append, never wipe stage children
 const d=document.createElement('div');d.className='glfail';
 d.textContent='The 3D engine could not start on this device — measurements, fabrics, sourcing and the Fit Agent still work.';
 stage.appendChild(d);
}

/* ============================== REBUILD / HUD ============================== */
function disposeGroup(g){g.traverse(o=>{if(o.geometry)o.geometry.dispose();});scene.remove(g);}
function rebuild(){
 if(!renderer)return;
 if(formG)disposeGroup(formG);
 if(garG)disposeGroup(garG);
 if(tapeG)disposeGroup(tapeG);
 formG=buildMannequin(state.meas);scene.add(formG);
 const res=buildGarment(state.meas,state.gar,state.fab);
 garG=res.group;bomCache=res.bom;scene.add(garG);
 tapeG=buildTapes(state.meas);scene.add(tapeG);
 tapeG.visible=state.rings;
 if(controls)controls.target.set(0,state.meas.height*0.53,0);   // [M2]
 syncHud();
 if(state.panel==='src'&&!tweenActive)renderPanel();
}
function syncHud(){
 const m=state.meas;
 $('#statusLine').textContent=`${SILS[state.gar.sil].label.toUpperCase()} · ${NECKS[state.gar.neck].label.toUpperCase()} · ${FAB().name.toUpperCase()} — ${colorName()} · EU ${euSize(m.bust)} · ${Math.round(m.height)} CM`;
 $('#bodyChip').textContent=`${state.preset==='custom'?'CUSTOM FORM':PRESETS[state.preset].label.toUpperCase()} · ${Math.round(m.height)} CM`;
 const vals={height:m.height,bust:m.bust,waist:m.waist,hip:m.hip,shoulder:m.shoulder,ease:state.gar.ease,beltW:state.gar.beltW};
 $$('#panel [data-bind]').forEach(b=>{const k=b.dataset.bind;if(vals[k]!=null)b.textContent=fmt(vals[k])+' cm';});
 $$('#panel input[type=range]').forEach(r=>{const k=r.dataset.mkey||r.dataset.gkey;if(k&&vals[k]!=null)r.value=vals[k];});
 tapeEls.forEach((el,i)=>{el.textContent=`${TAPE_DEFS[i][0]} ${fmt(m[TAPE_DEFS[i][1]])}`;});
}

/* ============================== TWEENS ============================== */
let tweenActive=false,twFrom=null,twTo=null,twT0=0,viewTween=null;
function tweenMeasures(to){twFrom={...state.meas};twTo={...state.meas,...to};twT0=performance.now();tweenActive=true;}
function stepTween(){
 const k=Math.min(1,(performance.now()-twT0)/650),e=1-Math.pow(1-k,3);
 for(const key of ['height','bust','waist','hip','shoulder'])
   state.meas[key]=twFrom[key]+(twTo[key]-twFrom[key])*e;
 rebuild();
 if(k>=1){tweenActive=false;state.meas={...twTo};rebuild();if(state.panel==='src')renderPanel();}
}
function setView(az){
 const off=camera.position.clone().sub(controls.target);
 const s=new THREE.Spherical().setFromVector3(off);
 while(s.theta-az>Math.PI)az+=Math.PI*2;
 while(s.theta-az<-Math.PI)az-=Math.PI*2;
 viewTween={from:s.theta,to:az,t0:performance.now()};
}
function stepView(){
 const k=Math.min(1,(performance.now()-viewTween.t0)/550),e=1-Math.pow(1-k,3);
 const off=camera.position.clone().sub(controls.target);
 const s=new THREE.Spherical().setFromVector3(off);
 s.theta=viewTween.from+(viewTween.to-viewTween.from)*e;
 camera.position.setFromSpherical(s).add(controls.target);
 if(k>=1)viewTween=null;
}

/* ============================== PANELS ============================== */
const sec=t=>`<div class="sec"><span>${t}</span><i></i></div>`;
const carousel=(name,cardsHtml)=>`<div class="carousel" data-carousel="${name}">
 <div class="car-track">${cardsHtml.join('')}</div>
 <div class="car-dots"></div>
</div>`;
const switchHtml=(checked,key)=>`<label class="sw"><input type="checkbox" data-switch="${key}" ${checked?'checked':''}><i></i></label>`;
function slider(key,label,min,max,val,gkey){
 return `<div class="ctl"><div class="ctl-t"><span>${label}</span><b class="mono" data-bind="${key}">${fmt(val)} cm</b></div>
 <input type="range" ${gkey?'data-gkey':'data-mkey'}="${key}" min="${min}" max="${max}" step="0.5" value="${val}"></div>`;
}
const presetGlyph=id=>`<svg viewBox="0 0 24 40"><circle cx="12" cy="4.5" r="2.5"/><path d="${PRESETG[id]}"/></svg>`;

function renderBody(){
 const m=state.meas;
 return `
 <h2>Client form</h2>
 <p class="sub">A parametric body — every measurement reshapes the 3D form and the garment draped over it, live.</p>
 <button class="cta" id="panelScan">
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7l1.5-3h4l1.5 3"/><circle cx="12" cy="13.2" r="3.4"/></svg>
   <span><b>Scan with the FLO Fit Agent</b><i>Camera measurements — processed on-device</i></span>
   <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6l6 6-6 6"/></svg>
 </button>
 ${sec('Body preset')}
 <div class="presets">${Object.entries(PRESETS).map(([id,p])=>
   `<button class="preset${state.preset===id?' on':''}" data-p="${id}">${presetGlyph(id)}<span>${p.label}</span></button>`).join('')}</div>
 ${sec('Measurements — cm')}
 ${slider('height','Height',150,192,m.height)}
 ${slider('bust','Bust',74,124,m.bust)}
 ${slider('waist','Waist',52,104,m.waist)}
 ${slider('hip','Hips',78,128,m.hip)}
 ${slider('shoulder','Shoulder',32,52,m.shoulder)}
 ${sec('Form notes')}
 <div class="noterow"><span>Pattern size</span><b class="mono">EU ${euSize(m.bust)}</b></div>
 <div class="switchrow"><span>Show tailor's tapes</span>${switchHtml(state.rings,'rings')}</div>
 <p class="fineprint">Measurements live in memory only — nothing is saved to the device or sent anywhere.</p>`;
}
function renderSil(){
 const g=state.gar;
 return `
 <h2>Silhouette</h2>
 <p class="sub">Procedurally cut and re-draped over the client form. The drape of the chosen fabric shapes the fall of the skirt.</p>
 ${sec('Cut')}
 <div class="seg">${Object.entries(SILS).map(([id,s])=>
   `<button class="${g.sil===id?'on':''}" data-sil="${id}"><svg class="tall" viewBox="0 0 24 40"><path d="${SILG[id]}"/></svg><span>${s.label.toUpperCase()}</span></button>`).join('')}</div>
 ${SILS[g.sil].lens.length>1?sec('Length')+`<div class="seg">${SILS[g.sil].lens.map(l=>
   `<button class="${g.len===l?'on':''}" data-len="${l}"><span>${LENS[l].label.toUpperCase()}</span></button>`).join('')}</div>`:''}
 ${sec('Neckline')}
 <div class="seg">${Object.entries(NECKS).map(([id,n])=>
   `<button class="${g.neck===id?'on':''}" data-neck="${id}"><svg viewBox="0 0 24 16"><path d="${NECKG[id]}"/></svg><span>${n.label.toUpperCase()}</span></button>`).join('')}</div>
 ${sec('Sleeve')}
 <div class="seg">${Object.entries(SLEEVES).map(([id,l])=>
   `<button class="${g.sleeve===id?'on':''}" data-sleeve="${id}"><span>${l.toUpperCase()}</span></button>`).join('')}</div>
 ${sec('Fit')}
 ${slider('ease','Ease — added to body',2,8,g.ease,true)}
 <p class="fineprint">Ease is the breathing room between body and garment. 2–3 cm is close-fitting, 6+ is relaxed.</p>`;
}
function renderFab(){
 const F=FAB();
 const drapeNotches=Array.from({length:5},(_,i)=>`<i class="${i<Math.round(F.drape*5)?'f':''}"></i>`).join('');
 return `
 <h2>Fabric library</h2>
 <p class="sub">Material drives both look and behaviour — the drape value bends the skirt's flare and hem. Swipe to browse.</p>
 ${sec('Library')}
 ${carousel('fab',FABRICS.map(f=>`
   <button class="swatch-card${f.id===state.fab.id?' on':''}" data-fab="${f.id}">
     <canvas width="96" height="96" data-thumb="${f.id}"></canvas>
     <b>${esc(f.name)}</b><i>${esc(f.comp)}</i>
     <em class="mono">€${f.price.toFixed(2)}${f.unit?'/m²':'/m'}</em>
   </button>`))}
 ${sec('Colourway — '+esc(colorName()))}
 <div class="chips">
   ${F.colors.map(c=>`<button class="chip${c.c===state.fab.color?' on':''}" data-c="${c.c}" title="${esc(c.n)}" style="background:${c.c}"></button>`).join('')}
   <label class="chip custom" title="Custom colour (type a hex value on iOS)"><input type="color" class="ccolor" value="${hexOK(state.fab.color)?state.fab.color:'#1C1B1E'}"><span>+</span></label>
 </div>
 ${sec('Behaviour')}
 <div class="meta"><span>Drape</span><span class="drape">${drapeNotches}<b style="margin-left:8px">${F.drape>.66?'FLUID':F.drape>.4?'SOFT':'STRUCTURED'}</b></span></div>
 <div class="meta"><span>Width</span><b>${F.unit?'panel cut':F.width+' cm'}</b></div>
 ${F.sheer?'<p class="finenote">Sheer cloth — a tone-on-tone slip is attached automatically so the line stays clean.</p>':''}`;
}
function paintFabricThumbs(){
 $$('[data-thumb]').forEach(cv=>{
   const f=FABRICS.find(x=>x.id===cv.dataset.thumb),x=cv.getContext('2d');
   x.fillStyle=f.thumb;x.fillRect(0,0,cv.width,cv.height);
   const t=getFabricTextures(f.id);
   if(f.id==='lace'){x.globalCompositeOperation='screen';x.globalAlpha=.95;x.drawImage(t.alpha.image,0,0,cv.width,cv.height);}
   else if(t.bump){x.globalAlpha=.3;x.drawImage(t.bump.image,0,0,cv.width,cv.height);}
   x.globalAlpha=1;x.globalCompositeOperation='source-over';
 });
}
function renderDet(){
 const g=state.gar;
 return `
 <h2>Details</h2>
 <p class="sub">Closures and hardware, rendered on the garment and costed into the bill of materials.</p>
 ${sec('Front closure')}
 <div class="seg">${[0,3,5,7].map(n=>
   `<button class="${g.buttons===n?'on':''}" data-btns="${n}"><span>${n===0?'NONE':n+' BUTTONS'}</span></button>`).join('')}</div>
 ${sec('Button finish')}
 <div class="bchips">${Object.entries(BTNS).map(([id,b])=>
   `<button class="bchip${g.btnStyle===id?' on':''}" data-bstyle="${id}"><i style="background:${b.dot}"></i><span>${b.label.toUpperCase()}</span></button>`).join('')}</div>
 ${sec('Belt')}
 <div class="switchrow"><span>Waist belt</span>${switchHtml(g.belt,'belt')}</div>
 <div class="ctl ${g.belt?'':'off'}">${slider('beltW','Width',2,6,g.beltW,true)}</div>
 <div class="seg">${['gold','nickel'].map(b=>
   `<button class="${g.buckle===b?'on':''}" data-buckle="${b}"><span>${b.toUpperCase()} BUCKLE</span></button>`).join('')}</div>`;
}
function bomRows(){
 const F=FAB(),b=bomCache;
 const rows=[];let cost=0;
 if(!renderer){rows.push(['3D engine unavailable','—']);bomCost=0;bomQtyTxt='—';return rows;}   // [L5]
 const full={sheath:1.35,aline:1.55,twopiece:1.5,gown:1.75}[state.gar.sil];
 if(F.unit==='m²'){
   const q=(b.outerA/1e4)*1.2;rows.push([F.name,`${q.toFixed(1)} m²`]);cost+=q*F.price;bomQtyTxt=`${q.toFixed(1)} m²`;
 }else{
   const q=(b.outerA/1e4)*full/((F.width-5)/100);
   rows.push([F.name,`${q.toFixed(1)} m · ${F.width} cm`]);cost+=q*F.price;bomQtyTxt=`${q.toFixed(1)} m`;
 }
 if(b.slipA>0){const q=(b.slipA/1e4)*1.25/1.45;
   rows.push(['Lining — crepe de chine',`${q.toFixed(1)} m · 150 cm`]);cost+=q*9.8;}
 if(b.buttons>0){rows.push([`${BTNS[state.gar.btnStyle].label} buttons`,`${b.buttons} pcs + 2 spare`]);
   cost+=(b.buttons+2)*BTNS[state.gar.btnStyle].price;}
 if(b.zip>0){rows.push(['Invisible zip',`${b.zip} cm`]);cost+=2.9;}
 rows.push(['Silk thread','1 spool']);cost+=3.8;
 rows.push(['Interfacing','0.4 m']);cost+=3.2;
 bomCost=cost;return rows;
}
function renderSrc(){
 const F=FAB(),rows=bomRows();
 ensureSuppliers(F.id);
 ensureQuotes();
 const supState=supplierCache[F.id];
 const supRows=supState?supState.rows:[];
 const supLoading=!supState||supState.status==='loading';
 const supOffline=supState&&supState.status==='offline';
 const reqRows=(quotesCache?.rows||[]).slice(0,6);
 const quotesOffline=quotesCache?.status==='offline';
 return `
 <h2>Sourcing</h2>
 <p class="sub">The bill of materials is measured off the 3D mesh itself — surface area, waste factor and fabric width included.</p>
 ${sec('Bill of materials')}
 ${rows.map(r=>`<div class="bomrow"><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`).join('')}
 ${sec('Suppliers — '+esc(F.name))}
 ${supLoading?'<p class="finenote">Loading suppliers…</p>':carousel('src',supRows.map((s,i)=>`
   <div class="sup">
     <div class="sup-t"><b>${esc(s.n)}</b><span>${esc(s.r)}</span></div>
     <div class="sup-m mono">€${s.p.toFixed(2)}${F.unit?'/m²':'/m'} · MOQ ${s.moq} ${F.unit?'m²':'m'} · ${s.lead} days${s.cert&&s.cert!=='—'?' · '+esc(s.cert):''}</div>
     <button class="btn tiny" data-sup="${i}">Request quote</button>
   </div>`))}
 ${supOffline?'<p class="finenote">Offline — showing cached supplier data.</p>':''}
 ${sec('Requests')}
 ${quotesOffline?'<p class="finenote">Offline — quote history is unavailable.</p>':''}
 ${reqRows.length?reqRows.map(r=>
   `<div class="req mono">${esc(new Date(r.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}))} · ${esc(r.supplierName)} · ${esc(r.fabricName)} · ${esc(r.qty)}</div>`).join('')
   :'<p class="finenote">No quote requests yet — pick a mill above.</p>'}
 <div class="total"><span>Estimated materials</span><b class="mono">€ ${bomCost.toFixed(2)}</b></div>
 <p class="fineprint">Live sourcing — pricing, MOQ and lead time are illustrative for this preview backend.</p>`;
}
const RENDERERS={body:renderBody,sil:renderSil,fab:renderFab,det:renderDet,src:renderSrc};
function reducedMotion(){return matchMedia('(prefers-reduced-motion: reduce)').matches;}
// Dependency-free, CSS-scroll-snap-driven carousel: dots are synced from the
// track's native scroll position (rAF-throttled), never intercepting touch —
// momentum scrolling stays fully native and doesn't fight #panel's own
// vertical scroll (overscroll-behavior-x/touch-action scope this to the
// horizontal axis only, see style.css .car-track).
function initCarousels(root){
 root.querySelectorAll('[data-carousel]').forEach(car=>{
   const track=car.querySelector('.car-track'),dotsEl=car.querySelector('.car-dots');
   const cards=[...track.children];
   if(cards.length<2){dotsEl.innerHTML='';return;}
   dotsEl.innerHTML=cards.map((_,i)=>`<i class="${i===0?'on':''}"></i>`).join('');
   const dots=[...dotsEl.children];
   dots.forEach((d,i)=>d.addEventListener('click',()=>
     cards[i].scrollIntoView({behavior:reducedMotion()?'auto':'smooth',inline:'start',block:'nearest'})));
   let raf=0;
   track.addEventListener('scroll',()=>{
     if(raf)return;
     raf=requestAnimationFrame(()=>{
       raf=0;
       let idx=0,best=Infinity;
       cards.forEach((c,i)=>{const d=Math.abs(c.offsetLeft-track.scrollLeft);if(d<best){best=d;idx=i;}});
       dots.forEach((d,i)=>d.classList.toggle('on',i===idx));
     });
   },{passive:true});
 });
}
function renderPanel(animate){
 const el=$('#panel');
 const html=RENDERERS[state.panel]();
 const paint=()=>{
   el.innerHTML=html;
   el.scrollTop=0;
   if(state.panel==='fab')paintFabricThumbs();
   initCarousels(el);
 };
 if(!animate||reducedMotion()||el.dataset.animBusy){paint();return;}
 el.dataset.animBusy='1';
 el.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-6px)'}],
   {duration:120,easing:'ease-in'}).onfinish=()=>{
   paint();
   el.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],
     {duration:180,easing:'cubic-bezier(.22,.61,.36,1)'}).onfinish=()=>{delete el.dataset.animBusy;};
 };
}

/* ---------- rail ---------- */
const SECTIONS=[['body','BODY','body'],['sil','CUT','dress'],['fab','FABRIC','fabric'],['det','DETAIL','button'],['src','SOURCE','spool']];
 $('#rail').innerHTML='<i class="rail-pill"></i>'+SECTIONS.map(([id,l,ic])=>
 `<button class="railbtn${state.panel===id?' on':''}" data-sec="${id}">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[ic]}</svg>
  <span>${l}</span></button>`).join('');
function movePill(btn){
 const pill=$('.rail-pill');
 if(!btn||!pill)return;
 pill.style.setProperty('--pill-y',btn.offsetTop+'px');   // btn's offsetParent is #rail itself
 pill.style.setProperty('--pill-h',btn.offsetHeight+'px');
}
movePill($('#rail .railbtn.on'));
addEventListener('resize',()=>movePill($('#rail .railbtn.on')));
 $('#rail').addEventListener('click',e=>{
 const b=e.target.closest('[data-sec]');if(!b)return;
 const s=b.dataset.sec,mobile=matchMedia('(max-width:920px)').matches;
 if(mobile&&state.panel===s&&document.body.classList.contains('paneled')){document.body.classList.remove('paneled');return;}
 state.panel=s;
 $$('#rail .railbtn').forEach(x=>x.classList.toggle('on',x.dataset.sec===s));
 movePill(b);
 renderPanel(true);
 if(mobile)document.body.classList.add('paneled');
});

/* ---------- panel events ---------- */
const panel=$('#panel');
panel.addEventListener('click',e=>{
 const t=e.target;
 const p=t.closest('.preset');if(p){state.preset=p.dataset.p;tweenMeasures(PRESETS[p.dataset.p]);renderPanel();return;}
 const f=t.closest('[data-fab]');if(f){state.fab={id:f.dataset.fab,color:FABRICS.find(x=>x.id===f.dataset.fab).colors[0].c};rebuild();renderPanel();return;}
 const c=t.closest('[data-c]');if(c){if(!hexOK(c.dataset.c))return;state.fab.color=c.dataset.c;rebuild();renderPanel();return;}
 const sil=t.closest('[data-sil]');if(sil){state.gar.sil=sil.dataset.sil;
   if(!SILS[sil.dataset.sil].lens.includes(state.gar.len))state.gar.len=SILS[sil.dataset.sil].dflt;
   rebuild();renderPanel();return;}
 const map={'[data-len]':el=>state.gar.len=el.dataset.len,'[data-neck]':el=>state.gar.neck=el.dataset.neck,
   '[data-sleeve]':el=>state.gar.sleeve=el.dataset.sleeve,'[data-buckle]':el=>state.gar.buckle=el.dataset.buckle,
   '[data-bstyle]':el=>state.gar.btnStyle=el.dataset.bstyle};
 for(const sel in map){const el=t.closest(sel);if(el){map[sel](el);rebuild();renderPanel();return;}}
 const bt=t.closest('[data-btns]');if(bt){state.gar.buttons=+bt.dataset.btns;rebuild();renderPanel();return;}
 if(t.closest('#panelScan')){openScan();return;}
 const sup=t.closest('[data-sup]');
 if(sup){
   const F=FAB(),rows=(supplierCache[F.id]&&supplierCache[F.id].rows)||[];
   const s=rows[+sup.dataset.sup];
   if(s)submitQuote(F.id,s.n,bomQtyTxt,F.unit?'m²':'m');
 }
});
panel.addEventListener('input',e=>{
 const t=e.target;
 if(t.dataset.mkey){state.meas[t.dataset.mkey]=+t.value;state.preset='custom';rebuild();
   $$('.preset').forEach(b=>b.classList.toggle('on',b.dataset.p===state.preset));}
 else if(t.dataset.gkey){state.gar[t.dataset.gkey]=+t.value;rebuild();}
 else if(t.classList.contains('ccolor')){if(!hexOK(t.value))return;state.fab.color=t.value;rebuild();}
});
panel.addEventListener('change',e=>{
 const t=e.target;
 if(t.dataset.switch==='rings'){state.rings=t.checked;if(tapeG)tapeG.visible=state.rings;$('#ringsBtn').classList.toggle('on',state.rings);}
 if(t.dataset.switch==='belt'){state.gar.belt=t.checked;rebuild();renderPanel();}
});

/* ---------- viewport controls ---------- */
 $('#viewPills').innerHTML=['FRONT','SIDE','BACK'].map((l,i)=>
 `<button data-view="${[0,Math.PI/2,Math.PI][i]}">${l}</button>`).join('');
 $('#viewPills').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b&&renderer&&camera&&controls)setView(+b.dataset.view);});
 $('#spinBtn').innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS.rotate}</svg>`;
 $('#spinBtn').onclick=()=>{state.spin=!state.spin;if(controls)controls.autoRotate=state.spin;$('#spinBtn').classList.toggle('on',state.spin);};
 $('#ringsBtn').innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS.ruler}</svg>`;
 $('#ringsBtn').onclick=()=>{state.rings=!state.rings;if(tapeG)tapeG.visible=state.rings;
 $('#ringsBtn').classList.toggle('on',state.rings);
 if(state.panel==='body')renderPanel();};

/* ============================== FLO FIT AGENT ============================== */
const scan={stream:null,landmarker:null,vision:null,files:null,modelBuffer:null,
            raf:0,samples:[],active:false,frame:0,token:0,t0:0,result:null};
const scanModal=$('#scanModal'),video=$('#scanVideo'),scanCanvas=$('#scanCanvas'),scanCtx=scanCanvas.getContext('2d');

function consentRecord(){try{return JSON.parse(localStorage.getItem(CONSENT_KEY));}catch(e){return null;}}
function recordScanConsent(){try{localStorage.setItem(CONSENT_KEY,JSON.stringify({v:1,lastScan:Date.now()}));}catch(e){}}

let poseAssetsPromise=null;
function loadPoseEngine(){
 if(poseAssetsPromise)return poseAssetsPromise;
 poseAssetsPromise=(async()=>{
   const vision=await import('./vendor/mediapipe/vision_bundle.mjs');
   const files=await vision.FilesetResolver.forVisionTasks('./vendor/mediapipe/wasm');
   const rj=await fetch('./assets/models/model-manifest.json');
   if(!rj.ok)throw new Error('model manifest missing');                       // [M6]
   const manifest=await rj.json();
   const rb=await fetch('./assets/models/pose_landmarker_lite.task');
   if(!rb.ok)throw new Error('model file missing');
   const buf=await rb.arrayBuffer();
   if(buf.byteLength<1000000)throw new Error('model file truncated');
   if(manifest&&manifest.sha256&&window.crypto&&crypto.subtle){
     const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buf))]
       .map(b=>b.toString(16).padStart(2,'0')).join('');
     if(digest!==manifest.sha256)throw new Error('model integrity check failed');
   }
   scan.vision=vision;scan.files=files;scan.modelBuffer=new Uint8Array(buf);
 })();
 poseAssetsPromise.catch(()=>{poseAssetsPromise=null;});                     // [H6] failures stay retryable
 return poseAssetsPromise;
}
// Two-phase open: display:none->flex and the .open class must land in
// separate paints, or the browser coalesces them and the CSS transition
// never runs — hence the double rAF before adding .open.
function openModal(el){
 el.style.display='flex';
 requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('open')));
}
function closeModal(el){
 if(reducedMotion()){el.classList.remove('open');el.style.display='none';return;}
 el.classList.remove('open');
 const done=()=>{el.style.display='none';el.removeEventListener('transitionend',done);};
 el.addEventListener('transitionend',done);
 setTimeout(done,300);   // fallback if transitionend doesn't fire (e.g. no visible property changed)
}
function openScan(){
 scan.samples=[];scanModal.dataset.step='1';$('#scanMsg').textContent='';
 const c=consentRecord();
 $('#consentBox').checked=false;$('#scanStart').disabled=true;
 $('#consentStamp').textContent=c?`Consent on record — last scan ${new Date(c.lastScan).toLocaleString()}`:'';
 openModal(scanModal);
}
function closeScan(){stopScan();closeModal(scanModal);}
function stopScan(){
 scan.token++;                                // [C3] invalidate any in-flight startCamera()
 scan.active=false;cancelAnimationFrame(scan.raf);
 if(scan.stream){scan.stream.getTracks().forEach(t=>t.stop());scan.stream=null;}
 video.srcObject=null;
 try{scanCtx.setTransform(1,0,0,1,0,0);scanCtx.clearRect(0,0,scanCanvas.width,scanCanvas.height);}catch(e){}
 const bar=$('#scanBar');if(bar)bar.style.width='0%';
}
document.addEventListener('visibilitychange',()=>{                          // [H2]
 if(document.hidden&&scan.active){
   stopScan();scanModal.dataset.step='1';
   $('#scanMsg').textContent='Scan interrupted — the app went to the background. Start again when ready.';
 }
});
 $('#consentBox').addEventListener('change',e=>{$('#scanStart').disabled=!e.target.checked;});

async function startCamera(){
 const my=++scan.token;                       // [C3]
 $('#scanMsg').textContent='';scan.samples=[];scan.frame=0;scan.t0=performance.now();
 recordScanConsent();
 scanModal.dataset.step='2';$('#scanStatus').textContent='Loading on-device pose engine…';
 try{
   if(!scan.landmarker){
     await loadPoseEngine();
     if(my!==scan.token)return;
     const opts=d=>({baseOptions:{modelAssetBuffer:scan.modelBuffer,delegate:d},runningMode:'VIDEO',numPoses:1});
     try{scan.landmarker=await scan.vision.PoseLandmarker.createFromOptions(scan.files,opts('GPU'));}
     catch(gpuErr){console.warn('GPU delegate failed, falling back to CPU',gpuErr);   // [H3]
       scan.landmarker=await scan.vision.PoseLandmarker.createFromOptions(scan.files,opts('CPU'));}
   }
 }catch(e){
   if(my!==scan.token)return;
   stopScan();scanModal.dataset.step='1';
   $('#scanMsg').textContent='Pose engine could not start (assets missing, corrupted, or incompatible). Run "npm run setup", or enter measurements manually.';
   return;
 }
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){          // [H4]
   scanModal.dataset.step='1';
   $('#scanMsg').textContent='Camera needs a secure context — use http://localhost, https, or the installed app. Or enter measurements manually.';
   return;
 }
 $('#scanStatus').textContent='Requesting camera…';
 let stream;
 try{
   stream=await navigator.mediaDevices.getUserMedia({audio:false,
     video:{facingMode:'user',width:{ideal:960},height:{ideal:720}}});
 }catch(err){
   if(my!==scan.token)return;
   scanModal.dataset.step='1';
   if(err&&(err.name==='NotAllowedError'||err.name==='SecurityError')){
     let st='';
     try{st=(await navigator.permissions.query({name:'camera'})).state;}catch(e){}
     $('#scanMsg').textContent='Camera is blocked'+(st==='denied'?' (permission denied)':'')+'. '+
       (st==='denied'
         ?'Enable it in system settings — iOS: Settings > FLO > Camera · Android: Settings > Apps > FLO > Permissions — then retry, or enter measurements manually.'
         :'Grant camera access when prompted, or enter measurements manually.');
   }else{
     $('#scanMsg').textContent='No camera available on this device — enter measurements manually.';
   }
   return;
 }
 if(my!==scan.token){stream.getTracks().forEach(t=>t.stop());return;}        // [C3] closed mid-load
 scan.stream=stream;
 video.srcObject=stream;
 await video.play().catch(()=>{});
 if(my!==scan.token)return;
 scanCanvas.width=video.videoWidth||960;scanCanvas.height=video.videoHeight||720;
 scan.active=true;scan.raf=requestAnimationFrame(scanLoop);
}
function scanLoop(){
 if(!scan.active)return;
 scan.frame++;
 let lm=null;
 if(video.readyState>=2&&video.videoWidth>0){
   if(scanCanvas.width!==video.videoWidth){scanCanvas.width=video.videoWidth;scanCanvas.height=video.videoHeight;}
   try{const res=scan.landmarker.detectForVideo(video,performance.now());lm=res&&res.landmarks&&res.landmarks[0];}catch(e){}
 }
 drawOverlay(lm);
 if(lm){
   const vis=[0,11,12,23,24,27,28].map(i=>(lm[i]&&lm[i].visibility!=null)?lm[i].visibility:1);
   if(Math.min(...vis)>0.55&&scan.frame%3===0&&scan.samples.length<24)
     collect(lm,video.videoWidth,video.videoHeight);
   $('#scanStatus').textContent=scan.samples.length?`Hold still — capturing ${scan.samples.length}/24`:'Body found — hold still…';
 }else{
   $('#scanStatus').textContent=(performance.now()-scan.t0>15000)
     ?'Still nothing — more light, plain background, whole body incl. feet…'
     :'Step back — full body in frame, feet visible…';
 }
 $('#scanBar').style.width=(scan.samples.length/24*100)+'%';
 if(scan.samples.length>=24){finishScan();return;}
 scan.raf=requestAnimationFrame(scanLoop);
}
function collect(lm,w,h){
 const px=i=>({x:lm[i].x*w,y:lm[i].y*h});
 const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const LS=px(11),RS=px(12),LH=px(23),RH=px(24),NO=px(0),LA=px(27),RA=px(28);
 const bodyPx=((LA.y+RA.y)/2)-NO.y;
 if(bodyPx<=0)return;
 const shoulderPx=d(LS,RS),hipPx=d(LH,RH);
 if(shoulderPx<8||hipPx<8)return;
 scan.samples.push({rS:shoulderPx/bodyPx,rH:hipPx/bodyPx});
}
function drawOverlay(lm){
 const c=scanCtx;
 c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,scanCanvas.width,scanCanvas.height);
 if(!lm)return;
 c.setTransform(-1,0,0,1,scanCanvas.width,0);
 c.strokeStyle='#E4703F';c.lineWidth=3;c.lineCap='round';
 const P=i=>[lm[i].x*scanCanvas.width,lm[i].y*scanCanvas.height];
 const BONES=[[11,12],[11,23],[12,24],[23,24],[11,13],[13,15],[12,14],[14,16],
   [23,25],[25,27],[24,26],[26,28],[27,31],[28,32],[0,11],[0,12]];
 c.beginPath();
 for(const [a,b] of BONES){const A=P(a),B=P(b);c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);}
 c.stroke();
 c.fillStyle='#F2EDE3';
 for(const i of [0,11,12,23,24,27,28]){const A=P(i);c.beginPath();c.arc(A[0],A[1],5,0,7);c.fill();}
}
function finishScan(){
 stopScan();
 const med=k=>{const a=scan.samples.map(s=>s[k]).sort((x,y)=>x-y);return a[Math.floor(a.length/2)];};
 const rS=med('rS'),rH=med('rH');
 const H=M.clamp(parseFloat($('#scanHeight').value)||170,120,220);
 const kS=rS*0.94,kH=rH*0.94;
 const anchor={s:0.235,h:0.20};
 const shoulder=M.clamp(kS*H,32,52);
 const sc=kS/anchor.s,hc=kH/anchor.h;
 const bust=M.clamp(0.53*H*(0.5*sc+0.5*hc),74,124);
 const hip=M.clamp(0.571*H*(0.62*hc+0.38*sc),78,128);
 const waist=M.clamp(0.412*H*Math.pow((bust+hip)/(1.101*H),1.15),52,104);
 scan.result={height:H,bust,waist,hip,shoulder};
 const spread=k=>{const a=scan.samples.map(s=>s[k]);const mu=a.reduce((x,y)=>x+y,0)/a.length;
   return Math.sqrt(a.reduce((x,y)=>x+(y-mu)*(y-mu),0)/a.length)/mu;};
 const sp=(spread('rS')+spread('rH'))/2;
 const conf=sp<0.02?['HIGH','steady stance, tight samples']:sp<0.05?['MEDIUM','some movement — refine with sliders']:['LOW','unsteady capture — treat as a rough start'];
 $('#scanRes').innerHTML=[
   ['Client height',fmt(H)+' cm'],['Shoulder (estimated)',fmt(shoulder)+' cm'],
   ['Bust (estimated)',fmt(bust)+' cm'],['Waist (estimated)',fmt(waist)+' cm'],
   ['Hips (estimated)',fmt(hip)+' cm']
 ].map(([a,b])=>`<div class="resrow"><span>${esc(a)}</span><b class="mono">${esc(b)}</b></div>`).join('');
 $('#scanConf').textContent=`Confidence ${conf[0]} — ${conf[1]}. Proportion-based estimate ±3 cm; fine-tune on the form afterwards.`;
 scanModal.dataset.step='3';
}
function applyScan(){
 if(!scan.result)return;
 state.scanSource={agent:true,ts:Date.now()};
 tweenMeasures(scan.result);state.preset='custom';
 state.rings=true;if(tapeG)tapeG.visible=true;$('#ringsBtn').classList.add('on');
 closeScan();
 state.panel='body';
 $$('#rail .railbtn').forEach(b=>b.classList.toggle('on',b.dataset.sec==='body'));
 movePill($('#rail .railbtn.on'));
 renderPanel(true);
 toast('Client form updated — refine with the sliders if needed');
}
 $('#btnScan').onclick=openScan;
 $('#scanClose').onclick=closeScan;
 $('#scanCancel').onclick=closeScan;
 $('#scanStart').onclick=startCamera;
 $('#scanRetake').onclick=startCamera;
 $('#scanApply').onclick=applyScan;
 $('#scanManual').onclick=()=>{closeScan();toast('Enter measurements with the Body sliders');};

/* ============================== TECH PACK ============================== */
function techText(){
 const m=state.meas,g=state.gar,F=FAB();
 const rows=bomRows();
 const L=[];
 L.push('DESIGN BY FLO — TECH PACK','Generated '+new Date().toLocaleString(),'');
 L.push('1 · CLIENT FORM',
   `Height .......... ${fmt(m.height)} cm`,
   `Bust ............ ${fmt(m.bust)} cm  (EU ${euSize(m.bust)})`,
   `Waist ........... ${fmt(m.waist)} cm`,
   `Hips ............ ${fmt(m.hip)} cm`,
   `Shoulder ........ ${fmt(m.shoulder)} cm`,
   state.scanSource?`Source .......... FLO Fit Agent (on-device) · ${new Date(state.scanSource.ts).toLocaleDateString()}`:'Source .......... Preset / manual entry','');
 L.push('2 · DESIGN',
   `Silhouette ...... ${SILS[g.sil].label}${g.sil!=='gown'?' — '+LENS[g.len].label.toLowerCase()+' length':''}`,
   `Neckline ........ ${NECKS[g.neck].label}`,
   `Sleeve .......... ${SLEEVES[g.sleeve]}`,
   `Ease ............ ${fmt(g.ease)} cm`,
   g.buttons?`Closure ......... ${g.buttons} × ${BTNS[g.btnStyle].label} buttons`:'Closure ......... —',
   g.belt?`Belt ............ ${fmt(g.beltW)} cm, ${g.buckle} buckle`:'Belt ............ —','');
 L.push('3 · MATERIAL',
   `Fabric .......... ${F.name} — ${colorName()} (${state.fab.color})`,
   `Composition ..... ${F.comp}`,
   `Drape ........... ${F.drape}`,
   F.sheer?'Lining .......... attached tone slip':'Lining .......... —','');
 L.push('4 · BILL OF MATERIALS');
 rows.forEach(r=>L.push(`${r[0]} ${'.'.repeat(Math.max(2,22-r[0].length))} ${r[1]}`));
 L.push(`Estimated materials ${'.'.repeat(2)} € ${bomCost.toFixed(2)}`,'');
 L.push('5 · SOURCING SHORTLIST');
 F.sup.forEach(s=>L.push(`- ${s.n} · €${s.p.toFixed(2)}/${F.unit?'m²':'m'} · MOQ ${s.moq} ${F.unit?'m²':'m'} · ${s.lead} d`));
 L.push('','Body measurements are estimates (±3 cm) — verify before cutting.',
   'All processing on-device. No client imagery stored or transmitted.');
 return L.join('\n');
}
async function saveTextFile(name,data){
 const cap=window.Capacitor;
 if(cap&&cap.isPluginAvailable&&cap.isPluginAvailable('Filesystem')){
   try{
     await cap.Plugins.Filesystem.writeFile({path:name,data,directory:'DOCUMENTS',encoding:'utf8'});
     return 'saved to app Documents';
   }catch(e){/* fall through to web download */}
 }
 const url=URL.createObjectURL(new Blob([data],{type:'text/plain'}));
 const a=document.createElement('a');a.href=url;a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),4000);
 return 'downloaded';
}
function openTech(){$('#techPre').textContent=techText();openModal($('#techModal'));}
 $('#btnTech').onclick=openTech;
 $('#techClose').onclick=()=>closeModal($('#techModal'));
 $('#techDl').onclick=async()=>{const r=await saveTextFile('FLO-techpack.txt',$('#techPre').textContent);toast('Tech pack '+r);};
 $('#techCopy').onclick=async()=>{
 const text=$('#techPre').textContent;
 try{await navigator.clipboard.writeText(text);toast('Tech pack copied to clipboard');}
 catch(e){toast('Copy not permitted — use download instead');}
};
 $('#techModal').addEventListener('click',e=>{if(e.target.id==='techModal')closeModal(e.currentTarget);});
 $('#scanModal').addEventListener('click',e=>{if(e.target.id==='scanModal')closeScan();});

/* ============================== LOOP / INIT ============================== */
function updateTapeLabels(){
 if(!renderer||!tapeEls.length)return;
 const w=stage.clientWidth,h=stage.clientHeight;
 tapeAnchors.forEach((a,i)=>{
   if(!state.rings){tapeEls[i].style.display='none';return;}
   const v=a.clone().project(camera);
   if(v.z>-1&&v.z<1){
     tapeEls[i].style.display='block';
     tapeEls[i].style.transform=`translate(${(v.x*.5+.5)*w+10}px,${(-v.y*.5+.5)*h}px) translateY(-50%)`;
   }else tapeEls[i].style.display='none';
 });
}
function tick(){
 requestAnimationFrame(tick);
 if(!renderer)return;
 if(tweenActive)stepTween();
 if(viewTween)stepView();
 controls.autoRotate=state.spin&&!userDragging&&!viewTween;
 controls.update();
 renderer.render(scene,camera);
 updateTapeLabels();
}
try{                                                       // [C2] total init containment
 if($('#labels'))TAPE_DEFS.forEach(()=>{
   const el=document.createElement('div');el.className='mlabel';el.style.display='none';
   $('#labels').append(el);tapeEls.push(el);
 });
 rebuild();
 renderPanel();
 if(renderer)requestAnimationFrame(tick);
 window.__FLO_BOOTED=true;
 setTimeout(()=>toast('Atelier ready — drag the form to rotate, or scan a client'),900);
}catch(err){
 console.error('FLO init error:',err);
 toast('Startup error — see the browser console');
}