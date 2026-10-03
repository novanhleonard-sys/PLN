const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkStory() {
    const { data: s } = await supabase.from('stories').select('id, title, slug').eq('title', 'Tuan Tapa dan Putri Naga');
    console.table(s);
}
checkStory();
