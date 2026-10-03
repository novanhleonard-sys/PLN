const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function requeueJobs() {
    // Requeue Bawang dan Kesuna triage
    const { data: job1 } = await supabase.from('jobs').select('*').eq('id', 'b266c89e-c4e0-4f43-b436-9f432c99154f').single();
    if (job1) {
        await supabase.from('jobs').update({
            status: 'queued',
            attempts: 0,
            error: null,
            run_after: new Date().toISOString()
        }).eq('id', job1.id);
        console.log("Requeued triage for Bawang dan Kesuna");
    }

    // Requeue Tuan Tapa verify
    const { data: job2 } = await supabase.from('jobs').select('*').eq('id', 'fb8b0c80-b87a-499f-baae-294ae6e60d28').single();
    if (job2) {
        await supabase.from('jobs').update({
            status: 'queued',
            attempts: 0,
            error: null,
            run_after: new Date().toISOString()
        }).eq('id', job2.id);
        console.log("Requeued verify for Tuan Tapa");
    }
}
requeueJobs();
