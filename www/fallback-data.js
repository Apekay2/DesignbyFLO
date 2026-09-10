// Offline fallback supplier data — used only when the sourcing API is unreachable
// (see ensureSuppliers() in app.js). Mirrors server/data/fabrics.seed.mjs's `sup`
// arrays as a static snapshot so the Sourcing panel still shows something useful
// with no network, rather than an empty state.
export const FALLBACK_SUPPLIERS = {
  lace: [
    {n:'Dentelle de Calais',r:'Calais, FR · Leavers looms',p:34,moq:12,lead:28,cert:'OEKO-TEX 100'},
    {n:'Noyon Dentelle',r:'Compiègne, FR',p:31.5,moq:20,lead:21,cert:'OEKO-TEX 100'},
    {n:'Kowloon Lace Works',r:'Kowloon, HK',p:22.8,moq:50,lead:14,cert:'—'},
  ],
  satin: [
    {n:'Como Seta S.r.l.',r:'Como, IT',p:28.5,moq:15,lead:21,cert:'GOTS'},
    {n:'XT Silk Mill',r:'Suzhou, CN',p:19.8,moq:45,lead:12,cert:'OEKO-TEX 100'},
    {n:'Huguet Tissage',r:'Lyon, FR',p:32,moq:10,lead:35,cert:'—'},
  ],
  velvet: [
    {n:'Velours de Gênes',r:'Genoa, IT',p:41,moq:12,lead:28,cert:'—'},
    {n:'Zhangjiagang Velvet',r:'Zhangjiagang, CN',p:26.5,moq:60,lead:18,cert:'OEKO-TEX 100'},
    {n:'Tessitura Serica',r:'Como, IT',p:38,moq:15,lead:25,cert:'—'},
  ],
  crepe: [
    {n:'Biella Wool Co.',r:'Biella, IT',p:22,moq:20,lead:24,cert:'Mulesing-free'},
    {n:'Südwolle GmbH',r:'Nuremberg, DE',p:17.5,moq:60,lead:15,cert:'GOTS'},
    {n:'Huddersfield F.W.',r:'Huddersfield, UK',p:24,moq:10,lead:35,cert:'—'},
  ],
  poplin: [
    {n:'Greiz Weberei',r:'Greiz, DE',p:8.2,moq:50,lead:14,cert:'GOTS'},
    {n:'Ibrahim Tekstil',r:'İzmir, TR',p:5.9,moq:100,lead:10,cert:'OEKO-TEX 100'},
    {n:'Can Clariana',r:'Igualada, ES',p:7.4,moq:30,lead:18,cert:'GOTS'},
  ],
  denim: [
    {n:'Kuroki Mills',r:'Okayama, JP',p:14,moq:8,lead:42,cert:'Natural indigo'},
    {n:'Vidalia Mills',r:'Vidalia, US',p:11,moq:30,lead:21,cert:'—'},
    {n:'Candiani Denim',r:'Robecchetto, IT',p:16,moq:6,lead:30,cert:'Kitotex'},
  ],
  chiffon: [
    {n:'Como Seta S.r.l.',r:'Como, IT',p:19.5,moq:15,lead:21,cert:'GOTS'},
    {n:'Suzhou Silk House',r:'Suzhou, CN',p:12.8,moq:45,lead:12,cert:'—'},
    {n:'Huguet Tissage',r:'Lyon, FR',p:21,moq:10,lead:35,cert:'—'},
  ],
  leather: [
    {n:'Mégisserie de Millau',r:'Millau, FR',p:92,moq:8,lead:21,cert:'LWG Silver'},
    {n:'Curtidos de Ubrique',r:'Ubrique, ES',p:78,moq:12,lead:18,cert:'LWG Gold'},
    {n:'Baden Leder',r:'Karlsruhe, DE',p:105,moq:4,lead:28,cert:'—'},
  ],
};
