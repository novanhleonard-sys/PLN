const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkVB() {
    const { data: v } = await supabase.from('story_versions').select('id, visual_bible_status').eq('id', '7f34f04c-318e-482e-bfce-f84aecb31c28').single();
    console.log(v);
}
checkVB();
