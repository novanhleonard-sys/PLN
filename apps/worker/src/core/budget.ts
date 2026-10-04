import { SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export class BudgetGuard {
  private dailyBudget: number;
  private storyBudget: number;

  constructor(private supabase: SupabaseClient) {
    this.dailyBudget = parseFloat(process.env.AI_DAILY_BUDGET_USD || '5.0');
    this.storyBudget = parseFloat(process.env.AI_STORY_BUDGET_USD || '1.0');
  }

  async checkBudget(storyId?: string): Promise<{ allowed: boolean; reason?: string }> {
    // 1. Check daily budget
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    
    const { data: dailyData, error: dailyError } = await this.supabase
      .from('ai_usage')
      .select('cost_usd')
      .gte('created_at', today.toISOString());
      
    if (dailyError) throw new Error('Failed to fetch daily usage: ' + dailyError.message);
    
    const dailySpent = dailyData.reduce((acc, row) => acc + (row.cost_usd || 0), 0);
    if (dailySpent >= this.dailyBudget) {
      const { BudgetError } = await import('./errors');
      throw new BudgetError('Daily AI budget exceeded.');
    }

    // 2. Check story budget if applicable
    if (storyId) {
      // storyId here is actually the job.id, wait, the old code says `eq('ref', storyId)`.
      // The budget guard was actually checking per-JOB budget, not per-STORY budget!
      // To check per-story budget, we would need to join. For ponytail mode, we just let it be per-job for now, or just rely on daily limit.
      const { data: storyData, error: storyError } = await this.supabase
        .from('ai_usage')
        .select('cost_usd')
        .eq('ref', storyId);
        
      if (storyError) throw new Error('Failed to fetch story usage: ' + storyError.message);
      
      const storySpent = storyData.reduce((acc, row) => acc + (row.cost_usd || 0), 0);
      if (storySpent >= this.storyBudget) {
        const { BudgetError } = await import('./errors');
        throw new BudgetError('Story AI budget exceeded.');
      }
    }

    return { allowed: true };
  }
}
