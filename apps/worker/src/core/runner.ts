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
  process_run_id?: string;
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
      } else if (msg.includes('429') || msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('500') || msg.includes('503')) {
        await this.handleRateLimit(job, msg);
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

  private async handleRateLimit(job: Job, errorMsg: string) {
    const nextRunAfter = new Date();
    nextRunAfter.setSeconds(nextRunAfter.getSeconds() + 60);
    console.warn(`[Rate Limit] Job ${job.id} deferred for 60s due to 429 Quota Exceeded.`);
    await this.supabase.from('jobs').update({
      status: 'queued',
      error: errorMsg,
      run_after: nextRunAfter.toISOString()
      // Do not increment attempts so we don't hit the 2-attempt fail guardrail
    }).eq('id', job.id);
  }

  private async handleRetry(job: Job, errorMsg: string) {
    const nextRunAfter = new Date();
    let status = 'queued';
    
    // SAFETY GUARDRAIL: Max 2 attempts
    if (job.attempts >= 4) {
      status = 'failed';
      console.error(`\n🚨 ADMIN ALERT: SAFETY GUARDRAIL TRIGGERED! 🚨`);
      console.error(`Job [${job.kind}] ID: ${job.id} has failed 4 times.`);
      console.error(`Last Error: ${errorMsg}`);
      console.error(`Action: STOPPING ALL QUEUED AI JOBS automatically.\n`);
      
      // Stop queued jobs to prevent runaway cost
      if (job.process_run_id) {
        await this.supabase.from('jobs')
          .update({ 
             status: 'failed', 
             error: `AUTO_CANCELLED: System paused due to repeated failure in job ${job.id}. Original Error: ${errorMsg}` 
          })
          .eq('status', 'queued')
          .eq('process_run_id', job.process_run_id);
          
        await this.supabase.from('ai_process_runs')
          .update({ status: 'failed' })
          .eq('id', job.process_run_id);
      } else {
        await this.supabase.from('jobs')
          .update({ 
             status: 'failed', 
             error: `AUTO_CANCELLED: System paused due to repeated failure in job ${job.id}. Original Error: ${errorMsg}` 
          })
          .eq('status', 'queued');
      }
    } else if (job.attempts === 1) {
      nextRunAfter.setSeconds(nextRunAfter.getSeconds() + 30);
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

