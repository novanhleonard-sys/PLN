import { SupabaseClient } from '@supabase/supabase-js';

export async function checkAndRunTierJob(supabase: SupabaseClient) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: lastRunData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'tier_job_last_run')
      .single();

    if (lastRunData && lastRunData.value === today) {
      return; // Already ran today
    }

    console.log(`[Tier] Running daily tier calculation job for ${today}`);
    await calculateTier(supabase);

    // Save today as last run
    await supabase.from('app_settings').upsert({ key: 'tier_job_last_run', value: `"${today}"` });
    console.log(`[Tier] Job completed for ${today}`);
  } catch (error) {
    console.error('[Tier] Error running tier job:', error);
  }
}

async function calculateTier(supabase: SupabaseClient) {
  // 1. Fetch settings
  const [percentilesRes, minReadsRes, weightsRes] = await Promise.all([
    supabase.from('app_settings').select('value').eq('key', 'tier_percentiles').single(),
    supabase.from('app_settings').select('value').eq('key', 'tier_min_reads').single(),
    supabase.from('app_settings').select('value').eq('key', 'score_weights').single(),
  ]);

  const percentiles = percentilesRes.data?.value || { '1': 5, '2': 15, '3': 30 };
  const minReads = parseInt(minReadsRes.data?.value || '10', 10);
  const weights = weightsRes.data?.value || { read: 1, save: 3 };

  // 2. Fetch all stories with stats
  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      id,
      tier,
      tier_locked,
      story_stats (
        reads_count,
        saves_count
      )
    `);

  if (error || !stories) {
    throw new Error('Failed to fetch stories: ' + error?.message);
  }

  // 3. Calculate scores for all stories
  const scoreUpdates: any[] = [];
  const validStories: any[] = [];

  for (const s of stories) {
    const stats = Array.isArray(s.story_stats) ? s.story_stats[0] : s.story_stats;
    if (!stats) continue;

    const reads = stats.reads_count || 0;
    const saves = stats.saves_count || 0;
    const score = (reads * (weights.read || 1)) + (saves * (weights.save || 3));

    scoreUpdates.push({
      story_id: s.id,
      reads_count: reads,
      saves_count: saves,
      score: score
    });

    if (!s.tier_locked && reads >= minReads) {
      validStories.push({
        id: s.id,
        score: score,
        currentTier: s.tier
      });
    }
  }

  // 4. Determine new tiers for valid stories
  validStories.sort((a, b) => b.score - a.score); // DESC

  const totalValid = validStories.length;
  let t1Count = Math.ceil(totalValid * (percentiles['1'] / 100));
  let t2Count = Math.ceil(totalValid * (percentiles['2'] / 100));
  let t3Count = Math.ceil(totalValid * (percentiles['3'] / 100));

  // Ensure minimum 1 if percentage > 0 and total > 0? No, let's just stick to the math rounding
  
  const tierUpdates: any[] = [];
  
  let i = 0;
  for (const s of validStories) {
    let newTier = 4;
    
    if (i < t1Count) {
      newTier = 1;
    } else if (i < t1Count + t2Count) {
      newTier = 2;
    } else if (i < t1Count + t2Count + t3Count) {
      newTier = 3;
    }
    
    if (newTier !== s.currentTier) {
      tierUpdates.push({ id: s.id, tier: newTier });
    }
    i++;
  }

  // 5. Batch update story_stats
  // Supabase JS upsert is limited. We can update one by one or upsert array.
  // Since story_stats PK is story_id, we can upsert.
  if (scoreUpdates.length > 0) {
    const { error: statsErr } = await supabase.from('story_stats').upsert(scoreUpdates, { onConflict: 'story_id' });
    if (statsErr) console.error('[Tier] Error updating story_stats:', statsErr);
  }

  // 6. Batch update stories
  // Supabase doesn't have a direct batch update for specific columns easily without passing all NOT NULLs.
  // We will loop or use a Promise.all to update just the 'tier' column.
  if (tierUpdates.length > 0) {
    await Promise.all(
      tierUpdates.map(tu => supabase.from('stories').update({ tier: tu.tier }).eq('id', tu.id))
    );
  }
}
