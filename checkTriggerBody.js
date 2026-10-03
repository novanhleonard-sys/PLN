const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTriggerBody() {
    const { data, error } = await supabase.rpc('run_sql', { query: "SELECT prosrc FROM pg_proc WHERE proname = 'ai_process_run_status_update';" });
    if (error) console.error(error);
    else console.log(data);
}
checkTriggerBody();
