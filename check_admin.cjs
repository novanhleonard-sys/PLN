require('dotenv').config({ path: 'apps/web/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jnmucqbtdzgafuuaowyo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, display_name').eq('role', 'admin');
    if (pErr) throw pErr;
    
    const { data: users, error: uErr } = await supabase.auth.admin.listUsers();
    if (uErr) throw uErr;
    
    const admins = profiles.map(p => {
      const u = users.users.find(u => u.id === p.id);
      return { name: p.display_name, email: u ? u.email : 'Unknown' };
    });
    console.log("=== ADMIN ACCOUNTS ===");
    console.log(JSON.stringify(admins, null, 2));
  } catch (e) {
    console.error(e);
  }
}
main();
