const fs = require('fs');
const env = require('dotenv').parse(fs.readFileSync('.env.local'));
async function fetchDb() {
  const url = `${env.VITE_SUPABASE_URL}/rest/v1/jobs?select=id,kind,status,error,attempts&kind=eq.audio`;
  const res = await fetch(url, { headers: { 'apikey': env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } });
  const data = await res.json();
  console.log(data);
}
fetchDb();
