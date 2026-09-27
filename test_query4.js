require('dotenv').config({path: '.env.local'});
const url = process.env.VITE_SUPABASE_URL + '/rest/v1';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' };

async function main() {
  const versionId = '188e4c42-0411-4b29-af97-1e152fded41f';
  const r = await fetch(url + `/story_versions?select=id,body,story:stories(title,region_id),scenes(id,idx,description)&id=eq.${versionId}`, { headers });
  console.log("Status:", r.status);
  console.log("Body:", await r.text());
}
main().catch(console.error);
