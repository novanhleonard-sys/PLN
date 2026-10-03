const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    const { data: cRefs, error } = await supabase.from('canonical_references').select('*').limit(1);
    console.log("cRefs Error:", error);
    if (cRefs && cRefs.length > 0) console.log(Object.keys(cRefs[0]));
}
checkSchema();
