const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function patchAmat() {
    console.log("Resuming Amat...");
    const { error } = await supabase
        .from('jobs')
        .update({ status: 'queued', attempts: 0, error: null, run_after: new Date().toISOString() })
        .eq('process_run_id', '1ac8767e-d478-4b7c-8fc0-f85423225d69')
        .eq('status', 'failed');
    if (error) console.error("Jobs error:", error);
    
    const { error: runError } = await supabase
        .from('ai_process_runs')
        .update({ status: 'running' })
        .eq('id', '1ac8767e-d478-4b7c-8fc0-f85423225d69');
    if (runError) console.error("Run error:", runError);
    console.log("Done.");
}
patchAmat();
