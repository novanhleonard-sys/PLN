import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!authHeader || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing env vars or auth header");
    }

    // 1. Verify caller is admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (callerProfile?.role !== 'admin') {
      throw new Error("Forbidden: requires admin role");
    }

    // 2. Parse request payload
    const { action, email, profileId } = await req.json();

    if (action === 'add') {
      // Look up auth.users by email
      const { data: users, error: findError } = await supabase.auth.admin.listUsers();
      if (findError) throw findError;
      
      const targetUser = users.users.find(u => u.email === email);
      if (!targetUser) {
        return new Response(JSON.stringify({ error: "Email belum terdaftar" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 });
      }

      await supabase.from('profiles').update({ role: 'admin' }).eq('id', targetUser.id);
      await supabase.from('admin_audit_logs').insert({ actor_id: user.id, target_id: targetUser.id, action: 'add_admin' });
      return new Response(JSON.stringify({ success: true, message: "Berhasil menambahkan admin" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (action === 'remove') {
      if (profileId === user.id) {
        return new Response(JSON.stringify({ error: "Tidak dapat mencabut hak admin diri sendiri" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
      }
      
      // Prevent deleting last admin
      const { data: adminUsers, count } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'admin');
      if (count && count <= 1) {
        return new Response(JSON.stringify({ error: "Tidak dapat mencabut admin terakhir" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
      }
      
      await supabase.from('profiles').update({ role: 'user' }).eq('id', profileId);
      await supabase.from('admin_audit_logs').insert({ actor_id: user.id, target_id: profileId, action: 'remove_admin' });
      return new Response(JSON.stringify({ success: true, message: "Berhasil mencabut admin" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error("Invalid action");
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
