import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket;

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Inserting dummy story for e2e test...');
  
  const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();
  if (!profile) {
    console.error('No profile found to use as user_id.');
    return;
  }
  
  const dummyStory = {
    title: 'Cerita Dummy E2E Kancil',
    body: 'Pada zaman dahulu, hiduplah seekor kancil yang cerdik. Ia suka mencuri mentimun milik pak tani. Pada suatu hari ia terjebak karena pak tani membuat orang-orangan sawah yang dilumuri getah nangka. Kancil menempel dan tidak bisa lepas. Akhirnya ia ditangkap dan dimaafkan, lalu ia berjanji tidak akan mencuri lagi.',
    type: 'fabel',
    sources: ['buku cerita'],
    user_id: profile.id,
    version_label: 'Versi Dummy',
    rights_declared: true,
    status: 'draft', // UI starts with draft
  };

  // The edge function normally handles submission, or we can just insert and set status to 'submitted'.
  // We'll insert it as 'submitted' to trigger the trigger automatically, or just wait if worker polls it?
  // Wait, the edge function `submit_contribution` inserts the process run!
  // It's better to invoke the edge function, or just insert manually. Let's insert manually and mock the edge function's behavior.
  
  const { data: sub, error } = await supabase.from('submissions').insert({
    ...dummyStory,
    status: 'submitted',
  }).select().single();

  if (error) {
    console.error('Failed to insert submission:', error);
    return;
  }

  console.log('Submission ID:', sub.id);
  
  console.log('Enqueueing triage job...');
  const { error: jobError } = await supabase.from('jobs').insert({
    kind: 'triage',
    ref_type: 'submission',
    ref_id: sub.id,
    idempotency_key: `triage_submission_${sub.id}`
  });
  
  if (jobError) {
    console.error('Failed to enqueue job:', jobError);
    return;
  }
  
  console.log('Waiting for worker to process... (watching jobs)');
  
  let attempts = 0;
  let done = false;
  
  while (!done && attempts < 60) { // max 5 mins (60 * 5s)
    await new Promise(r => setTimeout(r, 5000));
    attempts++;
    
    // Check jobs for this submission
    const { data: jobs } = await supabase.from('jobs').select('kind, status').in('ref_type', ['submission', 'submissions']).eq('ref_id', sub.id);
    console.log(`Poll ${attempts}: Submission jobs:`, jobs);
    
    // Also check verification_runs
    const { data: vruns } = await supabase.from('verification_runs').select('*').eq('submission_id', sub.id);
    if (vruns && vruns.length > 0) {
       console.log('Verification Runs:', vruns.map(v => `${v.stage}: ${v.verdict}`));
    }
    
    const { data: updatedSub } = await supabase.from('submissions').select('status, reject_reason').eq('id', sub.id).single();
    console.log('Submission status:', updatedSub?.status);
    
    if (updatedSub?.status === 'rejected' || updatedSub?.status === 'needs_review' || updatedSub?.status === 'accepted') {
      console.log('E2E Finish for submission stage.');
      done = true;
    }
  }

  if (attempts >= 60) {
    console.log('E2E Timeout waiting for submission stage.');
    return;
  }

  console.log('Approving submission and generating version...');
  const { data: versionId, error: approveError } = await supabase.rpc('approve_submission_to_version', { p_submission_id: sub.id });
  if (approveError) {
    console.error('Failed to approve submission:', approveError);
    return;
  }
  console.log('Version ID:', versionId);

  console.log('Starting AI Process Run (scope: all)...');
  const { data: runId, error: runError } = await supabase.rpc('start_ai_process_run', {
    p_version_id: versionId,
    p_scope: 'all',
    p_config_snapshot: {}
  });

  if (runError) {
    console.error('Failed to start AI process run:', runError);
    return;
  }
  console.log('Process Run ID:', runId);
  
  // Also enqueue segment job (which should be done by DB trigger, wait, let's check if DB trigger enqueues it).
  // Actually start_ai_process_run inserts a job automatically via trigger.
  console.log('Waiting for generation jobs... (this can take 5-10 minutes)');

  done = false;
  attempts = 0;
  while (!done && attempts < 120) {
    await new Promise(r => setTimeout(r, 5000));
    attempts++;
    
    const { data: jobs } = await supabase.from('jobs').select('kind, status').eq('process_run_id', runId);
    
    const countByStatus = jobs.reduce((acc, j) => {
      acc[j.status] = (acc[j.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`Poll ${attempts}: Jobs = Total ${jobs.length}, Statuses:`, countByStatus);
    
    if (jobs.length > 0 && jobs.every(j => j.status === 'succeeded' || j.status === 'failed' || j.status === 'deferred')) {
      console.log('E2E Finish for Generation. Final job statuses:', countByStatus);
      done = true;
    }
  }
}

run().catch(console.error);
