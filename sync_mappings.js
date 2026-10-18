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
  const wb = xlsx.readFile('Master Wilayah Budaya PLN.xlsx');
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const mappings = [];

  let currentParent = null;
  let currentGroup = null;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    let parent = row[0];
    let groupName = row[2];
    let regionRaw = row[4];

    if (parent && parent.trim()) currentParent = parent.trim();
    if (groupName && groupName.trim()) currentGroup = groupName.trim();

    if (regionRaw && currentGroup) {
      const regionsStr = regionRaw.toString();
      const lines = regionsStr.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        let rName = line.trim();
        if (rName.includes(' - ')) {
          rName = rName.split(' - ')[1].trim();
        } else if (rName.includes('—')) { // em dash
          rName = rName.split('—')[1].trim();
        } else if (rName.includes('-')) {
          rName = rName.split('-')[1].trim();
        }
        mappings.push({ region_name: rName, group_name: currentGroup, parent_name: currentParent });
      }
    }
  }

  console.log(`Parsed ${mappings.length} mappings from Excel.`);

  const { data: dbGroups } = await supabase.from('region_groups').select('id, name');
  const groupMap = new Map();
  for (const g of dbGroups) {
    groupMap.set(g.name.replace(/–/g, '-').toLowerCase(), g.id);
  }

  const { data: dbRegions } = await supabase.from('regions').select('id, name');
  const regionMap = new Map();
  for (const r of dbRegions) {
    regionMap.set(r.name.toLowerCase().replace(/–/g, '-'), r.id);
  }

  const updates = [];
  let missingGroups = 0;
  let missingRegions = 0;

  for (const m of mappings) {
    const normalizedGroupName = m.group_name.replace(/–/g, '-').toLowerCase();
    const groupId = groupMap.get(normalizedGroupName);
    if (!groupId) {
      console.log(`[Warning] Group not found in DB: ${m.group_name}`);
      missingGroups++;
      continue;
    }

    let normalizedRegionName = m.region_name.toLowerCase().replace(/–/g, '-');
    // sometimes "Kabupaten " is not matching exactly if it's "Kab. " etc, but let's assume it matches.
    const regionId = regionMap.get(normalizedRegionName);
    if (!regionId) {
      console.log(`[Warning] Region not found in DB: ${m.region_name}`);
      missingRegions++;
      continue;
    }

    updates.push({ id: regionId, region_group_id: groupId });
  }

  console.log(`Preparing to update ${updates.length} regions.`);
  console.log(`Missing groups: ${missingGroups}, Missing regions: ${missingRegions}`);

  const chunkSize = 100;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    // use update instead of upsert to avoid issues with code/level conflicts if not fully provided
    for(const u of chunk) {
      await supabase.from('regions').update({ region_group_id: u.region_group_id }).eq('id', u.id);
    }
  }
  
  console.log("Sync complete.");
}

main().catch(console.error);
