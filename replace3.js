const fs = require('fs');
let code = fs.readFileSync('supabase/functions/request_adaptation/index.ts', 'utf8');

const replacement1 = `if (existing) {
        if (existing.status === 'failed') {
            await supabaseAdmin.from('adaptations').update({ status: 'pending' }).eq('id', existing.id);
            await supabaseAdmin.from('jobs').insert({
                kind: 'adapt',
                ref_type: 'adaptation',
                ref_id: existing.id,
                idempotency_key: 'adapt:' + existing.id + ':' + Date.now()
            });
            return new Response(JSON.stringify({ success: true, adaptation_id: existing.id, status: 'pending', band }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        return new Response(JSON.stringify({ success: true, adaptation_id: existing.id, status: existing.status, band }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }`;

const replacement2 = `if (existing2) {
            if (existing2.status === 'failed') {
                await supabaseAdmin.from('adaptations').update({ status: 'pending' }).eq('id', existing2.id);
                await supabaseAdmin.from('jobs').insert({
                    kind: 'adapt',
                    ref_type: 'adaptation',
                    ref_id: existing2.id,
                    idempotency_key: 'adapt:' + existing2.id + ':' + Date.now()
                });
                return new Response(JSON.stringify({ success: true, adaptation_id: existing2.id, status: 'pending', band }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
            return new Response(JSON.stringify({ success: true, adaptation_id: existing2.id, status: existing2.status, band }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }`;

code = code.replace(/if \(existing\) \{[\s\S]*?\}\);[\s\S]*?\}/, replacement1);
code = code.replace(/if \(existing2\) \{[\s\S]*?\}\);[\s\S]*?\}/, replacement2);
fs.writeFileSync('supabase/functions/request_adaptation/index.ts', code);
