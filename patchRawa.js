const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function patchRawa() {
    console.log("Resuming Rawa Pening...");
    const { error } = await supabase
        .from('jobs')
        .update({ status: 'queued', attempts: 0, error: null, run_after: new Date().toISOString() })
        .eq('process_run_id', 'bb66ae57-640c-416e-9fd4-0eab1ed1e5db')
        .eq('status', 'failed');
    if (error) console.error("Jobs error:", error);
    
    const { error: runError } = await supabase
        .from('ai_process_runs')
        .update({ status: 'running' })
        .eq('id', 'bb66ae57-640c-416e-9fd4-0eab1ed1e5db');
    if (runError) console.error("Run error:", runError);
    console.log("Done.");
}
patchRawa();
