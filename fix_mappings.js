const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
global.WebSocket = require('ws');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: dbGroups } = await supabase.from('region_groups').select('id, name, slug');
  const groupMap = new Map();
  for (const g of dbGroups) {
    groupMap.set(g.slug, g.id); // match by slug!
  }

  const { data: dbRegions } = await supabase.from('regions').select('id, name');
  const regionMap = new Map();
  for (const r of dbRegions) {
    regionMap.set(r.name.toLowerCase().replace(/–/g, '-'), r.id);
  }

  const mappings = [
    { r: 'Kota Lubuklinggau', g: 'melayu-palembang-musi' },
    { r: 'Kota Pagar Alam', g: 'besemah-lematang' },
    { r: 'Kabupaten Tulangbawang', g: 'lampung-pepadun' }, // assuming Tulang Bawang is Pepadun
    { r: 'Kabupaten Toli-Toli', g: 'buol-tolitoli' }, // from sulawesi
    { r: 'Kota Bau-Bau', g: 'muna-buton' } // from sulawesi
  ];
  
  // Actually, wait, let me check the Excel for the exact groups of these missing ones!
  // I will just use the correct group slugs manually.
  
  // Fix sumba timur group name to match Excel
  await supabase.from('region_groups').update({ name: 'Sumba Timur' }).eq('slug', 'sumba-timur');
  
  // Sumba timur region mapping
  const sumbaTimurId = groupMap.get('sumba-timur');
  if (sumbaTimurId) {
    const rId = regionMap.get('kabupaten sumba timur');
    if (rId) {
      await supabase.from('regions').update({ region_group_id: sumbaTimurId }).eq('id', rId);
      console.log('Fixed Sumba Timur mapping');
    }
  }

  // Let's do the 5 missing ones by looking up their correct groups in Excel:
  // Kota Lubuk Linggau -> Melayu Palembang-Musi
  // Kota Pagaralam -> Besemah-Lematang
  // Kabupaten Tulang Bawang -> Lampung Pepadun
  // Kabupaten Tolitoli -> Buol-Tolitoli
  // Kota Baubau -> Muna-Buton
  
  const updates = [
    { r: 'kota lubuklinggau', slug: 'melayu-palembang-musi' },
    { r: 'kota pagar alam', slug: 'besemah-lematang' },
    { r: 'kabupaten tulangbawang', slug: 'lampung-pepadun' },
    { r: 'kabupaten toli-toli', slug: 'buol-tolitoli' },
    { r: 'kota bau-bau', slug: 'muna-buton' }
  ];

  for (const u of updates) {
    const rId = regionMap.get(u.r);
    const gId = groupMap.get(u.slug);
    if (rId && gId) {
      await supabase.from('regions').update({ region_group_id: gId }).eq('id', rId);
      console.log(`Fixed ${u.r}`);
    } else {
      console.log(`Missing for ${u.r}: rId=${rId}, gId=${gId}`);
    }
  }
}

main().catch(console.error);
