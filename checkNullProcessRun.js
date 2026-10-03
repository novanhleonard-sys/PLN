const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkNull() {
    const { count } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).is('process_run_id', null);
    console.log("Jobs with NULL process_run_id:", count);
}
checkNull();
