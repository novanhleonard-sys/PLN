const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRuns() {
    const { data: story } = await supabase.from('stories').select('id').eq('title', 'Asal Mula Gunung Seulawah').single();
    const { data: v } = await supabase.from('story_versions').select('id').eq('story_id', story.id).single();
    const { data: runs, error } = await supabase.from('ai_process_runs').select('id, status, scope, created_at, updated_at').eq('story_version_id', v.id).order('created_at', { ascending: false });
    
    if (error) console.error(error);
    console.dir(runs);
}
checkRuns();
