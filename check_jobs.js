const fs = require('fs');
const env = require('dotenv').parse(fs.readFileSync('.env.local'));
async function fetchDb() {
  const url = `${env.VITE_SUPABASE_URL}/rest/v1/jobs?select=id,kind,status,ref_id,error`;
  const res = await fetch(url, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const data = await res.json();
  if (!Array.isArray(data)) {
    console.log("Error:", data);
    return;
  }
  const stats = {};
  data.forEach(j => {
    const key = `${j.kind} - ${j.status}`;
    stats[key] = (stats[key] || 0) + 1;
    if (j.status === 'failed') {
      console.log(`Failed Job [${j.kind}]: ${j.error}`);
    }
  });
  console.log("Job Stats:");
  console.log(stats);
}
fetchDb();
