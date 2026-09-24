import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { z } from "https://esm.sh/zod@3.22.4";

const requestSchema = z.object({
  version_id: z.string().uuid(),
  age: z.number().int().min(1).max(99)
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ageToBand = (age: number) => {
    if (age < 5) return '3-4';
    if (age <= 6) return '5-6';
    if (age <= 9) return '7-9';
    if (age <= 12) return '10-12';
    return 'asli';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const authHeader = req.headers.get('Authorization')!;
    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing auth header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!user.email_confirmed_at) {
        return new Response(JSON.stringify({ error: 'Email belum terverifikasi' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const payload = await req.json();
    const result = requestSchema.safeParse(payload);
    
    if (!result.success) {
      return new Response(JSON.stringify({ error: 'Invalid payload', details: result.error.errors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const { version_id, age } = result.data;
    const band = ageToBand(age);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // If asli, nothing to do, just return
    if (band === 'asli') {
        // We find the 'asli' adaptation
        const { data: asliAdapt } = await supabaseAdmin.from('adaptations')
            .select('id')
            .eq('version_id', version_id)
            .eq('age_band', 'asli')
            .single();
            
        return new Response(JSON.stringify({ success: true, adaptation_id: asliAdapt?.id, status: 'ready', band: 'asli' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Get prompt_version for this band
    const { data: rules } = await supabaseAdmin.from('age_band_rules')
        .select('prompt_version')
        .eq('band', band)
        .single();
        
    if (!rules) {
        return new Response(JSON.stringify({ error: 'Rules not found for band' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const prompt_version = rules.prompt_version;

    // Check cache
    const { data: existing } = await supabaseAdmin.from('adaptations')
        .select('id, status')
        .eq('version_id', version_id)
        .eq('age_band', band)
        .eq('prompt_version', prompt_version)
        .single();

    if (existing) {
        return new Response(JSON.stringify({ success: true, adaptation_id: existing.id, status: existing.status, band }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Check quota
    const { data: settings } = await supabaseAdmin.from('app_settings').select('value').eq('key', 'adaptations_per_day').single();
    const limit = settings?.value ?? 10;

    const startOfDay = new Date();
    startOfDay.setUTCHours(0,0,0,0);
    
    const { count } = await supabaseAdmin
      .from('adaptations')
      .select('*', { count: 'exact', head: true })
      .eq('requested_by', user.id)
      .gte('created_at', startOfDay.toISOString());

    if (count !== null && count >= limit) {
      return new Response(JSON.stringify({ error: 'Batas adaptasi harian tercapai' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get total_pages from 'asli' adaptation
    const { data: asliAdaptation } = await supabaseAdmin.from('adaptations')
        .select('total_pages')
        .eq('version_id', version_id)
        .eq('age_band', 'asli')
        .single();

    // Insert new adaptation
    const { data: adaptation, error: insertError } = await supabaseAdmin
      .from('adaptations')
      .insert({
        version_id,
        age_band: band,
        prompt_version,
        status: 'pending',
        audio_status: 'none',
        total_pages: asliAdaptation?.total_pages || 0,
        requested_by: user.id
      })
      .select()
      .single();

    if (insertError || !adaptation) {
      throw insertError || new Error('Failed to insert adaptation');
    }

    // Enqueue job
    const { error: jobError } = await supabaseAdmin
      .from('jobs')
      .insert({
        kind: 'adapt',
        ref_type: 'adaptation',
        ref_id: adaptation.id,
        status: 'queued',
        idempotency_key: `adapt:${adaptation.id}`
      });

    if (jobError) {
      throw jobError;
    }

    return new Response(JSON.stringify({ success: true, adaptation_id: adaptation.id, status: 'pending', band }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
