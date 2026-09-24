import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Seeding fake story stats...');

  // 1. Get all stories
  const { data: stories } = await supabase.from('stories').select('id, tier_locked');
  if (!stories) return;

  const updates = stories.map((s, idx) => {
    // Generate some random reads and saves
    // We want some to be below min_reads (10), some very high.
    const reads = Math.floor(Math.random() * 100);
    const saves = Math.floor(Math.random() * 20);
    
    return {
      story_id: s.id,
      reads_count: reads,
      saves_count: saves,
      score: 0 // to be calculated by the job
    };
  });

  const { error } = await supabase.from('story_stats').upsert(updates, { onConflict: 'story_id' });
  if (error) {
    console.error('Seed error:', error);
  } else {
    console.log(`Seeded ${updates.length} stats. Run the worker to see tier calculation!`);
  }
}

main().catch(console.error);
