const WebSocket = require('ws');
global.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jnmucqbtdzgafuuaowyo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpubXVjcWJ0ZHpnYWZ1dWFvd3lvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE1ODg2MCwiZXhwIjoyMTA1NzM0ODYwfQ.K9lvH20b8cRz8cbg3bAVQ6sSjczNS_-K1dvk7AeKmBw');

async function run() {
  const { data: versions, error: vError } = await supabase.from('story_versions').select('id, stories(title), status, asset_status, story_visual_bibles(id)');
  
  if (vError) {
    console.error(vError);
    return;
  }
  
  const missingVisuals = versions.filter(v => v.story_visual_bibles === null || v.story_visual_bibles.length === 0);
  console.log(`Found ${missingVisuals.length} versions missing visual bibles.`);
  
  for (const v of missingVisuals) {
    const title = v.stories?.title || v.id;
    console.log(`Triggering visual generation for version: ${title}`);
    const { data: runId, error: rpcError } = await supabase.rpc('start_ai_process_run', {
      p_version_id: v.id,
      p_scope: 'image_only',
      p_config_snapshot: { source: 'batch_trigger_missing_visuals' }
    });
    
    if (rpcError) {
      console.error(`Failed to trigger for ${v.id}:`, rpcError);
    } else {
      console.log(`Successfully queued run ${runId} for ${title}`);
    }
  }
}
run();
