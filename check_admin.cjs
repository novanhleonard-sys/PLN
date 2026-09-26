const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jnmucqbtdzgafuuaowyo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpubXVjcWJ0ZHpnYWZ1dWFvd3lvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE1ODg2MCwiZXhwIjoyMTA1NzM0ODYwfQ.K9lvH20b8cRz8cbg3bAVQ6sSjczNS_-K1dvk7AeKmBw');

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
