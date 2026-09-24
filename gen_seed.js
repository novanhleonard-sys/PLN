const fs = require('fs');
const text = fs.readFileSync('seed_text.md', 'utf8');
const peningBody = text.substring(text.indexOf('Dahulu'), text.indexOf('SI PITUNG')).trim();
const pitungBody = text.substring(text.indexOf('Di masa penjajahan'), text.indexOf('KANCIL DAN BUAYA')).trim();
const kancilBody = text.substring(text.indexOf('Suatu hari Si Kancil'), text.indexOf('(SELESAI)')).trim();

const seed1 = {
  title: 'Legenda Rawa Pening',
  type: 'legenda',
  region_code: '33', // Jawa Tengah
  lat: -7.2917,
  lng: 110.4286,
  version_label: 'Asli',
  body: peningBody,
  sources: [{ type: 'website', citation: 'Dongeng Rakyat Nusantara' }],
  contributor: 'seed',
  tier: 4
};
const seed2 = {
  title: 'Si Pitung',
  type: 'sage',
  region_code: '31', // DKI Jakarta
  lat: -6.1983,
  lng: 106.7725,
  version_label: 'Asli',
  body: pitungBody,
  sources: [{ type: 'website', citation: 'Sejarah Jakarta' }],
  contributor: 'seed',
  tier: 3
};
const seed3 = {
  title: 'Kancil dan Buaya',
  type: 'fabel',
  region_code: '00', // General
  version_label: 'Asli',
  body: kancilBody,
  sources: [{ type: 'book', citation: 'Kumpulan Dongeng Nusantara' }],
  contributor: 'seed',
  tier: 2
};
fs.writeFileSync('content/seed/rawa_pening.json', JSON.stringify(seed1, null, 2));
fs.writeFileSync('content/seed/si_pitung.json', JSON.stringify(seed2, null, 2));
fs.writeFileSync('content/seed/kancil_buaya.json', JSON.stringify(seed3, null, 2));
