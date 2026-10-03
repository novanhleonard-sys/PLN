const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clearUsage() {
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    const { data, error } = await supabase.from('ai_usage').delete().gte('created_at', today.toISOString());
    console.log("Deleted today's usage. Error:", error);
}
clearUsage();
