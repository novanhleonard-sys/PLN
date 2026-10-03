const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function requeueFailedTriage() {
    const { data: job } = await supabase.from('jobs').select('*').eq('kind', 'triage').eq('status', 'failed').eq('id', 'b266c89e-c4e0-4f43-b436-9f432c99154f').single();
    if (job) {
        await supabase.from('jobs').update({
            status: 'queued',
            attempts: 0,
            error: null,
            run_after: new Date().toISOString()
        }).eq('id', job.id);
        console.log("Requeued triage job for Dongeng Bawang dan Kesuna");
    }
}

requeueFailedTriage();
