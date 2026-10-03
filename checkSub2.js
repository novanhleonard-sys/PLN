const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSub() {
    const { data: b } = await supabase.from('submissions').select('id, title, status, body').eq('title', 'Dongeng Bawang dan Kesuna').single();
    console.log("Bawang:", b);

    const { data: t } = await supabase.from('submissions').select('id, title, status, body').eq('title', 'Tuan Tapa dan Putri Naga').single();
    console.log("Tuan Tapa:", t);
}
checkSub();
