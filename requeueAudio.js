const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function requeueAudioJobs() {
    console.log("Finding failed audio jobs due to const assignment bug...");
    
    // The exact error message in DB is likely in `error` column
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('id, process_run_id, status, error, attempts')
        .eq('kind', 'audio')
        .eq('status', 'failed');
        
    if (error) {
        console.error("Error fetching jobs:", error);
        return;
    }

    let requeued = 0;
    for (const job of jobs) {
        if (job.error && job.error.includes("Assignment to constant variable")) {
            // Reset job
            await supabase.from('jobs').update({
                status: 'queued',
                attempts: 0,
                error: null,
                run_after: new Date().toISOString()
            }).eq('id', job.id);
            
            // Reset process run if it was failed
            await supabase.from('ai_process_runs').update({
                status: 'running'
            }).eq('id', job.process_run_id).eq('status', 'failed');
            
            requeued++;
        }
    }
    
    console.log(`Requeued ${requeued} audio jobs.`);
}

requeueAudioJobs();
