const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTuanTapa() {
    const { data: runs } = await supabase.from('verification_runs').select('*').eq('submission_id', '7c5f5228-2255-43e7-88df-5240ad6327fc');
    console.table(runs);
}
checkTuanTapa();
