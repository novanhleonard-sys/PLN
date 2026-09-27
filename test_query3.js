require('dotenv').config({path: '.env.local'});
const url = process.env.VITE_SUPABASE_URL + '/rest/v1';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' };

async function main() {
  const r = await fetch(url + '/story_versions?select=id,body,story:stories(title,region_id),scenes(id,idx,description)&limit=1', { headers });
  console.log("Status:", r.status);
  console.log("Body:", (await r.text()).substring(0, 500));
}
main().catch(console.error);
