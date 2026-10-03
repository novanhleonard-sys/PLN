const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkVB() {
    const { data: v } = await supabase.from('story_versions').select('id, stories(title)').eq('story_id', 'b656664a-8be7-47f2-9336-6161c4a0649f').single();
    const { data: bible } = await supabase.from('story_visual_bibles').select('*').eq('version_id', v.id);
    console.log(bible);
}
checkVB();
