import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobRunner, Job } from '../../src/core/runner';

describe('JobRunner Retry Logic', () => {
  it('should apply backoff correctly on failure', async () => {
    const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn() });
    const supabase = {
      rpc: vi.fn(),
      from: vi.fn().mockReturnValue({ update: mockUpdate })
    } as any;
    
    const runner = new JobRunner(supabase);
    runner.register('test_job', async () => { throw new Error('fail'); });
    
    // Simulate claim_job returning a job that just failed its 1st attempt (so attempts=1 coming from DB)
    supabase.rpc.mockResolvedValue({
      data: [{ id: '1', kind: 'test_job', attempts: 1 } as Job],
      error: null
    });
    
    await runner.runOnce();
    
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      status: 'queued',
      error: 'fail'
    }));
    
    const callArgs = mockUpdate.mock.calls[0][0];
    const runAfter = new Date(callArgs.run_after);
    const now = new Date();
    const diff = (runAfter.getTime() - now.getTime()) / 1000;
    
    expect(diff).toBeGreaterThan(25);
    expect(diff).toBeLessThan(35); // Approx +30s
  });

  it('should defer job if budget exceeded', async () => {
    const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn() });
    const supabase = {
      rpc: vi.fn(),
      from: vi.fn().mockReturnValue({ update: mockUpdate })
    } as any;
    
    const runner = new JobRunner(supabase);
    runner.register('test_job', async () => { throw new Error('BUDGET_EXCEEDED: daily limit'); });
    
    supabase.rpc.mockResolvedValue({
      data: [{ id: '1', kind: 'test_job', attempts: 1 } as Job],
      error: null
    });
    
    await runner.runOnce();
    
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      status: 'deferred',
      error: 'BUDGET_EXCEEDED: daily limit'
    }));
  });
});
