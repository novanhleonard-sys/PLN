import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  console.log('Inserting dummy user...');
  const { data: user, error: userError } = await supabase.auth.admin.createUser({
    email: 'seed_' + Date.now() + '@example.com',
    password: 'password123',
    email_confirm: true
  });
  
  if (userError) {
    console.error('Failed to create user:', userError);
    // Ignore and proceed if we just need a user ID from existing profiles
  }
  
  if (user && user.user) { await supabase.from('profiles').insert({ id: user.user.id, display_name: 'Seed User' }); }
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  const userId = profiles?.[0]?.id;
  if (!userId) throw new Error('No user profile found');

  // Insert seed stories
  const seedDir = path.join(process.cwd(), 'content', 'seed');
  const files = await fs.readdir(seedDir);
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const content = JSON.parse(await fs.readFile(path.join(seedDir, file), 'utf8'));
    
    // Create submission
    console.log('Inserting submission for', content.title);
    const { data: submission, error: subErr } = await supabase.from('submissions').insert({
      user_id: userId,
      title: content.title,
      type: content.type === 'sage' ? 'legenda' : content.type,
      lat: content.lat,
      lng: content.lng,
      version_label: content.version_label || 'Original',
      body: content.body,
      sources: [], source_url: content.source_url
    }).select().single();
    
    if (subErr) {
      console.error('Submission error:', subErr);
      continue;
    }
    
    // Enqueue triage job
    const { error: jobErr } = await supabase.from('jobs').insert({
      kind: 'triage',
      ref_type: 'submission',
      ref_id: submission.id,
      status: 'queued',
      attempts: 0,
      run_after: new Date().toISOString(),
      idempotency_key: 'triage_' + submission.id
    });
    
    if (jobErr) console.error('Job enqueue error:', jobErr);
    else console.log('Enqueued triage job for', submission.id);
  }
  
  console.log('Done!');
}
main().catch(console.error);





