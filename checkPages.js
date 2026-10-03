const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPages() {
    const { data: s } = await supabase.from('pages').select('id, story_id, sequence_number, content').eq('story_id', '39cecf2a-6bf9-48de-a350-f6e183840394').order('sequence_number');
    console.table(s);
}
checkPages();
