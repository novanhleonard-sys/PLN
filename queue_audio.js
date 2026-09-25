const { createClient } = require('@supabase/supabase-js');
globalThis.WebSocket = require('ws');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // get all pages
  const { data: pages } = await supabase.from('pages').select('id');
  
  // get all existing audio jobs
  const { data: jobs } = await supabase.from('jobs').select('ref_id').eq('kind', 'audio');
  const queuedJobIds = new Set(jobs.map(j => j.ref_id));

  // get all page_audio that already exists
  const { data: pageAudios } = await supabase.from('page_audio').select('page_id');
  const existingAudios = new Set(pageAudios.map(a => a.page_id));

  let toInsert = [];
  for (const p of pages) {
    if (!queuedJobIds.has(p.id) && !existingAudios.has(p.id)) {
      toInsert.push({
        kind: 'audio',
        ref_type: 'page',
        ref_id: p.id,
        status: 'queued',
        attempts: 0,
        cost_usd: 0,
        run_after: new Date().toISOString(),
        idempotency_key: 'audio_' + p.id
      });
    }
  }

  if (toInsert.length > 0) {
    console.log(`Queuing ${toInsert.length} audio jobs...`);
    const { error } = await supabase.from('jobs').insert(toInsert);
    if (error) console.error("Error inserting jobs:", error);
    else console.log("Jobs queued successfully!");
  } else {
    console.log("No new audio jobs to queue.");
  }
}
run();
