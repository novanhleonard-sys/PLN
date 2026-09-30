const fs = require("fs");
let runner = fs.readFileSync("apps/worker/src/core/runner.ts", "utf-8");

runner = runner.replace(
  /} catch \(err: any\) \{\s*const msg = err\.message \|\| 'Unknown error';\s*if \(msg\.includes\('BUDGET_EXCEEDED'\)\) \{\s*await this\.markDeferred\(job\.id, msg\);\s*\} else \{\s*await this\.handleRetry\(job, msg\);\s*\}/m,
  `} catch (err: any) {
      const msg = err.message || 'Unknown error';
      if (msg.includes('BUDGET_EXCEEDED')) {
        await this.markDeferred(job.id, msg);
      } else if (msg.includes('429') || msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED')) {
        await this.handleRateLimit(job, msg);
      } else {
        await this.handleRetry(job, msg);
      }
    }`
);

runner = runner.replace(
  /private async handleRetry\(job: Job, errorMsg: string\) \{/m,
  `private async handleRateLimit(job: Job, errorMsg: string) {
    const nextRunAfter = new Date();
    nextRunAfter.setSeconds(nextRunAfter.getSeconds() + 60);
    console.warn(\`[Rate Limit] Job \${job.id} deferred for 60s due to 429 Quota Exceeded.\`);
    await this.supabase.from('jobs').update({
      status: 'queued',
      error: errorMsg,
      run_after: nextRunAfter.toISOString()
      // Do not increment attempts so we don't hit the 2-attempt fail guardrail
    }).eq('id', job.id);
  }

  private async handleRetry(job: Job, errorMsg: string) {`
);

fs.writeFileSync("apps/worker/src/core/runner.ts", runner, "utf-8");
