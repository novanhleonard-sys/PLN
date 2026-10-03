const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUsage() {
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    const { data: usage } = await supabase.from('ai_usage').select('cost_usd').gte('created_at', today.toISOString());
    const spent = usage.reduce((acc, row) => acc + (row.cost_usd || 0), 0);
    console.log("Spent today:", spent);
}
checkUsage();
