import { describe, it, expect, vi } from 'vitest';
import { applyVerdict } from '../../src/orchestrator/index';

describe('applyVerdict', () => {
  it('should approve valid job', async () => {
    const job = { id: '1', payload: { isValid: true } };
    const update = vi.fn().mockReturnThis();
    const eq = vi.fn().mockResolvedValue({});
    const ctx = {
      supabase: {
        from: vi.fn().mockReturnValue({ update: (...args: any) => ({ eq }) })
      }
    };
    
    const result = await applyVerdict(job, ctx);
    expect(result).toBe(true);
    expect(ctx.supabase.from).toHaveBeenCalledWith('jobs');
  });

  it('should reject invalid job', async () => {
    const job = { id: '2', payload: { isValid: false } };
    const update = vi.fn().mockReturnThis();
    const eq = vi.fn().mockResolvedValue({});
    const ctx = {
      supabase: {
        from: vi.fn().mockReturnValue({ update: (...args: any) => ({ eq }) })
      }
    };
    
    const result = await applyVerdict(job, ctx);
    expect(result).toBe(false);
  });
});