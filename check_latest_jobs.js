require('dotenv').config({path: '.env.local'});
const url = process.env.VITE_SUPABASE_URL + '/rest/v1';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' };

async function main() {
  const r = await fetch(url + '/jobs?select=kind,status,error,created_at,run_after,attempts&order=created_at.desc&limit=10', { headers });
  console.log(await r.text());
}
main().catch(console.error);
