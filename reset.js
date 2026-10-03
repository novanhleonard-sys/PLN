const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function reset() {
    // get submissions
    const { data: subs } = await supabase.from('submissions').select('id, title').in('title', ['Dongeng Bawang dan Kesuna', 'Tuan Tapa dan Putri Naga']).eq('status', 'approved');
    console.log("Found subs:", subs);
    
    if (subs) {
        for (const sub of subs) {
            // reset to needs_review
            await supabase.from('submissions').update({ status: 'needs_review' }).eq('id', sub.id);
        }
    }
    
    // get stories to delete (this will cascade to versions, adaptations, pages, etc.)
    const { data: stories } = await supabase.from('stories').select('id').in('title', ['Dongeng Bawang dan Kesuna', 'Tuan Tapa dan Putri Naga']);
    if (stories) {
        for (const s of stories) {
            await supabase.from('stories').delete().eq('id', s.id);
        }
    }
    console.log("Done.");
}
reset();
