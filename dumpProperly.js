const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function dumpProperly() {
    const { data: p, error } = await supabase.from('pages').select('*').limit(3);
    if(error) console.error(error);
    console.table(p);
}
dumpProperly();
