const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkNewRuns() {
    const { data: runs, error } = await supabase.from('ai_process_runs').select('id, status, scope, created_at, story_versions(story_id, stories(title))').gte('created_at', '2026-10-03T00:00:00Z').order('created_at', { ascending: false });
    console.dir(runs, { depth: null });
}
checkNewRuns();
