// Seed data for the sourcing API — ported from the fabric library that used to be
// hardcoded directly in www/app.js. Supplier pricing/MOQ/lead-time figures are still
// illustrative (this is a stub backend), but they now live server-side, behind
// /api/fabrics/:id/suppliers, instead of shipping in the client bundle.
export const FABRICS = [
  {id:'lace',name:'Chantilly Lace',comp:'52% nylon · 48% viscose',price:34,width:140,drape:0.82,sheer:true,thumb:'#575263',
   colors:[{n:'Noir',c:'#211F24'},{n:'Bone',c:'#EFE6D6'},{n:'Oxblood',c:'#5E2018'},{n:'Sage',c:'#6E7561'},{n:'Champagne',c:'#C9A96A'}],
   sup:[{n:'Dentelle de Calais',r:'Calais, FR · Leavers looms',p:34,moq:12,lead:28,cert:'OEKO-TEX 100'},
        {n:'Noyon Dentelle',r:'Compiègne, FR',p:31.5,moq:20,lead:21,cert:'OEKO-TEX 100'},
        {n:'Kowloon Lace Works',r:'Kowloon, HK',p:22.8,moq:50,lead:14,cert:'—'}]},
  {id:'satin',name:'Silk Charmeuse',comp:'100% mulberry silk · 19 mm',price:28.5,width:140,drape:0.9,thumb:'#9C2B23',
   colors:[{n:'Lacquer',c:'#9C2B23'},{n:'Ink',c:'#1C1B1E'},{n:'Bone',c:'#EFE6D6'},{n:'Bottle',c:'#2E4038'},{n:'Ochre',c:'#C0944A'},{n:'Plum',c:'#4A2C3F'}],
   sup:[{n:'Como Seta S.r.l.',r:'Como, IT',p:28.5,moq:15,lead:21,cert:'GOTS'},
        {n:'XT Silk Mill',r:'Suzhou, CN',p:19.8,moq:45,lead:12,cert:'OEKO-TEX 100'},
        {n:'Huguet Tissage',r:'Lyon, FR',p:32,moq:10,lead:35,cert:'—'}]},
  {id:'velvet',name:'Silk Velvet',comp:'Silk pile · rayon back',price:41,width:140,drape:0.62,thumb:'#1F4A38',
   colors:[{n:'Emerald',c:'#1F4A38'},{n:'Bordeaux',c:'#6B2432'},{n:'Midnight',c:'#23262E'},{n:'Rust',c:'#A65A2E'},{n:'Bone',c:'#E8DFCB'}],
   sup:[{n:'Velours de Gênes',r:'Genoa, IT',p:41,moq:12,lead:28,cert:'—'},
        {n:'Zhangjiagang Velvet',r:'Zhangjiagang, CN',p:26.5,moq:60,lead:18,cert:'OEKO-TEX 100'},
        {n:'Tessitura Serica',r:'Como, IT',p:38,moq:15,lead:25,cert:'—'}]},
  {id:'crepe',name:'Wool Crepe',comp:'100% virgin wool · 210 g/m²',price:22,width:150,drape:0.5,thumb:'#33312E',
   colors:[{n:'Charcoal',c:'#33312E'},{n:'Camel',c:'#B08D57'},{n:'Ink',c:'#1C1B1E'},{n:'Olive',c:'#5B5A3A'},{n:'Chalk',c:'#E8E2D5'}],
   sup:[{n:'Biella Wool Co.',r:'Biella, IT',p:22,moq:20,lead:24,cert:'Mulesing-free'},
        {n:'Südwolle GmbH',r:'Nuremberg, DE',p:17.5,moq:60,lead:15,cert:'GOTS'},
        {n:'Huddersfield F.W.',r:'Huddersfield, UK',p:24,moq:10,lead:35,cert:'—'}]},
  {id:'poplin',name:'Cotton Poplin',comp:'100% organic cotton · 115 g/m²',price:8.2,width:148,drape:0.32,thumb:'#E5DDC9',
   colors:[{n:'Chalk',c:'#EDE7DA'},{n:'Poppy',c:'#C4441C'},{n:'Sage',c:'#77806B'},{n:'Ink',c:'#1C1B1E'},{n:'Maize',c:'#D9A93F'}],
   sup:[{n:'Greiz Weberei',r:'Greiz, DE',p:8.2,moq:50,lead:14,cert:'GOTS'},
        {n:'Ibrahim Tekstil',r:'İzmir, TR',p:5.9,moq:100,lead:10,cert:'OEKO-TEX 100'},
        {n:'Can Clariana',r:'Igualada, ES',p:7.4,moq:30,lead:18,cert:'GOTS'}]},
  {id:'denim',name:'Raw Denim 12 oz',comp:'100% cotton · right-hand twill',price:11,width:150,drape:0.12,thumb:'#2F3E5C',
   colors:[{n:'Raw Indigo',c:'#2F3E5C'},{n:'Stone',c:'#97A3B4'},{n:'Black',c:'#1E1F24'},{n:'Ecru',c:'#D8CFBE'}],
   sup:[{n:'Kuroki Mills',r:'Okayama, JP',p:14,moq:8,lead:42,cert:'Natural indigo'},
        {n:'Vidalia Mills',r:'Vidalia, US',p:11,moq:30,lead:21,cert:'—'},
        {n:'Candiani Denim',r:'Robecchetto, IT',p:16,moq:6,lead:30,cert:'Kitotex'}]},
  {id:'chiffon',name:'Silk Chiffon',comp:'100% silk · 8 mm',price:19.5,width:140,drape:0.95,sheer:true,thumb:'#C9B9A6',
   colors:[{n:'Blush',c:'#D8A79A'},{n:'Ivory',c:'#EFE6D6'},{n:'Smoke',c:'#6E6E75'},{n:'Sage',c:'#8A9082'},{n:'Powder',c:'#B7C0C4'}],
   sup:[{n:'Como Seta S.r.l.',r:'Como, IT',p:19.5,moq:15,lead:21,cert:'GOTS'},
        {n:'Suzhou Silk House',r:'Suzhou, CN',p:12.8,moq:45,lead:12,cert:'—'},
        {n:'Huguet Tissage',r:'Lyon, FR',p:21,moq:10,lead:35,cert:'—'}]},
  {id:'leather',name:'Lambskin Nappa',comp:'French lambskin · 0.7 mm',price:92,unit:'m²',width:0,drape:0.25,thumb:'#5E241C',
   colors:[{n:'Oxblood',c:'#5E241C'},{n:'Black',c:'#1A1813'},{n:'Cognac',c:'#8A4F2D'},{n:'Bone',c:'#E4DCC8'}],
   sup:[{n:'Mégisserie de Millau',r:'Millau, FR',p:92,moq:8,lead:21,cert:'LWG Silver'},
        {n:'Curtidos de Ubrique',r:'Ubrique, ES',p:78,moq:12,lead:18,cert:'LWG Gold'},
        {n:'Baden Leder',r:'Karlsruhe, DE',p:105,moq:4,lead:28,cert:'—'}]}
];

export const PUBLIC_FIELDS = ['id','name','comp','price','unit','width','drape','sheer','thumb','colors'];

export function toPublicFabric(f){
  const out = {};
  for (const k of PUBLIC_FIELDS) if (k in f) out[k] = f[k];
  return out;
}
