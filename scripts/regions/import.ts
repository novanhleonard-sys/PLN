import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // fallback

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  console.error("Please add them to .env.local to run this script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getRegionGroup(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes('sumatra') || n.includes('aceh') || n.includes('bengkulu') || n.includes('jambi') || n.includes('lampung') || n.includes('riau') || n.includes('bangka')) {
    return 'sumatera';
  }
  if (n.includes('java') || n.includes('banten') || n.includes('yogyakarta') || n.includes('jakarta')) {
    return 'jawa';
  }
  if (n.includes('kalimantan')) return 'kalimantan';
  if (n.includes('sulawesi') || n.includes('gorontalo')) return 'sulawesi';
  if (n.includes('maluku')) return 'maluku';
  if (n.includes('papua')) return 'papua';
  if (n.includes('bali') || n.includes('nusa tenggara')) return 'bali_nusra';
  return null;
}

async function main() {
  console.log("Reading provinsi.geojson...");
  const provData = JSON.parse(fs.readFileSync('content/regions/provinsi.geojson', 'utf-8'));
  
  const provRecords: any[] = [];
  const provMap = new Map();

  for (const feature of provData.features) {
    const props = feature.properties;
    const name = props.shapeName;
    const code = props.shapeISO || props.shapeID;
    const lat = props.centroid_y;
    const lng = props.centroid_x;
    const region_group = getRegionGroup(name);
    
    provRecords.push({
      code,
      name,
      level: 'provinsi',
      lat,
      lng,
      region_group
    });
  }

  console.log("Upserting provinces...");
  const { data: insertedProvs, error: provError } = await supabase
    .from('regions')
    .upsert(provRecords, { onConflict: 'code', ignoreDuplicates: false })
    .select('id, code, name');

  if (provError) {
    console.error("Error inserting provinces:", provError);
    return;
  }
  
  for (const p of insertedProvs) {
    provMap.set(p.code, p.id);
  }

  console.log("Reading kabkota.geojson...");
  let kabkotaData;
  try {
    kabkotaData = JSON.parse(fs.readFileSync('content/regions/kabkota.geojson', 'utf-8'));
  } catch (e) {
    console.error("Failed to read kabkota.geojson, make sure it exists.");
    return;
  }

  const kabkotaRecords: any[] = [];
  for (const feature of kabkotaData.features) {
    const props = feature.properties;
    const name = props.shapeName;
    const code = props.shapeISO || props.shapeID;
    const lat = props.centroid_y;
    const lng = props.centroid_x;
    
    kabkotaRecords.push({
      code,
      name,
      level: name.toLowerCase().includes('kota') ? 'kota' : 'kabupaten',
      lat,
      lng
    });
  }

  // batch upsert for kabkota (maybe chunk it to 1000 records)
  console.log(`Upserting ${kabkotaRecords.length} kab/kota...`);
  const chunkSize = 500;
  for (let i = 0; i < kabkotaRecords.length; i += chunkSize) {
    const chunk = kabkotaRecords.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('regions')
      .upsert(chunk, { onConflict: 'code' });
    if (error) {
      console.error(`Error inserting kabkota chunk ${i}:`, error);
    }
  }

  console.log("Done import!");
}

main();
