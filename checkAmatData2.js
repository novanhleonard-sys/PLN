const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAmat() {
    const { data: story } = await supabase.from('stories').select('id').eq('title', 'Legenda Amat Rhang Manyang').single();
    const { data: vs } = await supabase.from('story_versions').select('id, label, status, asset_status').eq('story_id', story.id);
    
    for (const v of vs) {
        console.log(`Version ${v.label}: status=${v.status}, asset_status=${v.asset_status}`);
        const { data: scenes } = await supabase.from('scenes').select('idx, image_path, image_status').eq('version_id', v.id).order('idx');
        console.dir(scenes);
    }
    
    const { data: run } = await supabase.from('ai_process_runs').select('status').eq('id', '1ac8767e-d478-4b7c-8fc0-f85423225d69').single();
    console.log("Run 1ac8767e status:", run ? run.status : "NOT FOUND");
}
checkAmat();
