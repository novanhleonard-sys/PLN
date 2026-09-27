require('dotenv').config({path: '.env.local'});
const url = process.env.VITE_SUPABASE_URL + '/rest/v1';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' };

async function get(path) {
  const r = await fetch(url + path, { headers });
  if(!r.ok) { console.error("API Error:", await r.text()); return null; }
  return r.json();
}

async function main() {
  const data = await get('/story_versions?select=id,text,story:stories(title,region_id,target_age,character_names),scenes(id,idx,description)&limit=1');
  console.log('Data:', JSON.stringify(data, null, 2));
}
main().catch(console.error);
