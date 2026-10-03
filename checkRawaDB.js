const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRawaDB() {
    const { data: story } = await supabase.from('stories').select('lat, lng').eq('title', 'Legenda Rawa Pening').single();
    console.log("Rawa Pening Coords:", story);
}
checkRawaDB();
