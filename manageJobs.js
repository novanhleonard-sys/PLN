const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function manageJobs() {
    console.log("Stopping all queued audio jobs...");
    const { data: audioJobs, error: err1 } = await supabase
        .from('jobs')
        .update({ status: 'deferred', error: 'Stopped by Admin to save credits' })
        .eq('kind', 'audio')
        .eq('status', 'queued')
        .select('id');
        
    console.log(`Stopped ${audioJobs ? audioJobs.length : 0} audio jobs.`);

    console.log("Requeuing specific moderation jobs...");
    
    // Bawang dan Kesuna triage
    const { data: job1 } = await supabase.from('jobs').update({
        status: 'queued', attempts: 0, error: null, run_after: new Date().toISOString()
    }).eq('id', 'b266c89e-c4e0-4f43-b436-9f432c99154f').select().single();
    if(job1) console.log("Requeued triage for Bawang dan Kesuna");

    // Tuan Tapa verify
    const { data: job2 } = await supabase.from('jobs').update({
        status: 'queued', attempts: 0, error: null, run_after: new Date().toISOString()
    }).eq('id', 'fb8b0c80-b87a-499f-baae-294ae6e60d28').select().single();
    if(job2) console.log("Requeued verify for Tuan Tapa");
}
manageJobs();
