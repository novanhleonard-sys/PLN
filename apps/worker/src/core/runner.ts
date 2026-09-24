import { SupabaseClient } from '@supabase/supabase-js';

export interface Job {
  id: string;
  kind: string;
  ref_type: string;
  ref_id: string;
  status: string;
  attempts: number;
  run_after: string;
  idempotency_key: string;
  error?: string;
  cost_usd: number;
  created_at: string;
}

export interface StageContext {
  supabase: SupabaseClient;
}

export type StageContract = (ctx: StageContext, job: Job) => Promise<void>;

export class JobRunner {
  private stages = new Map<string, StageContract>();
  private isShuttingDown = false;

  constructor(private supabase: SupabaseClient) {}

  register(kind: string, handler: StageContract) {
    this.stages.set(kind, handler);
  }

  async runOnce(limit = 1) {
    if (this.isShuttingDown) return;

    const kinds = Array.from(this.stages.keys());
    if (kinds.length === 0) return;

    // Claim jobs
    const { data: jobs, error } = await this.supabase.rpc('claim_job', {
      p_kinds: kinds,
      p_limit: limit
    });

    if (error) {
      console.error('Failed to claim jobs:', error);
      return;
    }

    if (!jobs || jobs.length === 0) return;

    // Execute jobs sequentially to avoid rate limits
    for (const job of jobs) {
      await this.executeJob(job);
    }
  }

  private async executeJob(job: Job) {
    const handler = this.stages.get(job.kind);
    if (!handler) {
      await this.markFailed(job.id, 'No handler for kind: ' + job.kind);
      return;
    }

    try {
      await handler({ supabase: this.supabase }, job);
      await this.markSucceeded(job.id);
    } catch (err: any) {
      const msg = err.message || 'Unknown error';
      if (msg.includes('BUDGET_EXCEEDED')) {
        await this.markDeferred(job.id, msg);
      } else {
        await this.handleRetry(job, msg);
      }
    }
  }

  private async markSucceeded(jobId: string) {
    await this.supabase.from('jobs').update({
      status: 'succeeded',
      error: null
    }).eq('id', jobId);
  }

  private async markDeferred(jobId: string, error: string) {
    await this.supabase.from('jobs').update({
      status: 'deferred',
      error
    }).eq('id', jobId);
  }

  private async markFailed(jobId: string, error: string) {
    await this.supabase.from('jobs').update({
      status: 'failed',
      error
    }).eq('id', jobId);
  }

  private async handleRetry(job: Job, errorMsg: string) {
    const nextRunAfter = new Date();
    
    // attempts is already incremented by claim_job
    // if attempts == 1, failed once -> wait 30s
    // if attempts == 2, failed twice -> wait 2m
    // if attempts == 3, failed thrice -> wait 10m
    // if attempts >= 4, mark failed permanently
    
    let status = 'queued';
    
    if (job.attempts >= 4) {
      status = 'failed';
    } else if (job.attempts === 1) {
      nextRunAfter.setSeconds(nextRunAfter.getSeconds() + 30);
    } else if (job.attempts === 2) {
      nextRunAfter.setMinutes(nextRunAfter.getMinutes() + 2);
    } else if (job.attempts === 3) {
      nextRunAfter.setMinutes(nextRunAfter.getMinutes() + 10);
    }

    await this.supabase.from('jobs').update({
      status,
      error: errorMsg,
      run_after: nextRunAfter.toISOString()
    }).eq('id', job.id);
  }

  shutdown() {
    this.isShuttingDown = true;
  }
}

