const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSettings() {
    const { data: b } = await supabase.from('app_settings').select('*').eq('key', 'moderation');
    console.log("Moderation Settings:", JSON.stringify(b, null, 2));
}
checkSettings();
