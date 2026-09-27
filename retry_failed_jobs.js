require('dotenv').config({path: '.env.local'});
const url = process.env.VITE_SUPABASE_URL + '/rest/v1';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' };

async function patch(path, body) {
  const r = await fetch(url + path, { method: 'PATCH', headers, body: JSON.stringify(body) });
  if(!r.ok) throw new Error(await r.text());
}

async function main() {
  console.log('Me-reset failed story-visual-bible jobs ke antrean...');
  await patch('/jobs?kind=eq.story-visual-bible&status=eq.failed', {
    status: 'queued',
    attempts: 0,
    run_after: new Date().toISOString()
  });
  console.log('Berhasil di-reset!');
}
main().catch(console.error);
