const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRawaDB2() {
    const { data: scenes } = await supabase.from('scenes').select('idx, image_status, image_path').eq('version_id', 'ffcc3387-504c-4d47-890c-07735273e71d').order('idx');
    console.log("Scenes for ffcc3387:", scenes.length, "ready:", scenes.filter(s => s.image_status === 'ready').length);
    
    const { data: run } = await supabase.from('ai_process_runs').select('id, status, story_version_id').eq('id', 'bb66ae57-640c-416e-9fd4-0eab1ed1e5db');
    console.log("Run:", run);
}
checkRawaDB2();
