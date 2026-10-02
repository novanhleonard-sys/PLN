const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: jobs } = await supabase.from('jobs')
    .update({ status: 'queued', attempts: 0, error: null })
    .eq('kind', 'scene-image')
    .eq('status', 'failed')
    .select('id, process_run_id');
    
  console.log(`Requeued ${jobs ? jobs.length : 0} failed scene-image jobs.`);
  
  if (jobs && jobs.length > 0) {
    const runIds = [...new Set(jobs.map(j => j.process_run_id))];
    await supabase.from('ai_process_runs').update({ status: 'running' }).in('id', runIds);
  }
}
run();
