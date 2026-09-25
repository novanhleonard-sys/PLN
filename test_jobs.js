globalThis.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data: jobs } = await supabase.from('jobs').select('id, ref_id, error').eq('kind', 'audio');
  const { data: pages } = await supabase.from('pages').select('id').in('id', jobs.map(j => j.ref_id));
  const pageIds = new Set(pages.map(p => p.id));
  console.log(jobs.map(j => ({ job_id: j.id, ref_id: j.ref_id, exists: pageIds.has(j.ref_id), error: j.error })));
}
test();
