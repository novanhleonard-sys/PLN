import { describe, it, expect, vi } from 'vitest';
import { BudgetGuard } from '../../src/core/budget';

describe('BudgetGuard', () => {
  it('should block if daily budget exceeded', async () => {
    process.env.AI_DAILY_BUDGET_USD = '1.0';
    
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            data: [{ cost_usd: 0.8 }, { cost_usd: 0.3 }], // Total 1.1
            error: null
          })
        })
      })
    } as any;
    
    const guard = new BudgetGuard(supabase);
    const result = await guard.checkBudget();
    
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Daily AI budget exceeded');
  });

  it('should allow if budget under limit', async () => {
    process.env.AI_DAILY_BUDGET_USD = '2.0';
    
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            data: [{ cost_usd: 0.5 }],
            error: null
          })
        })
      })
    } as any;
    
    const guard = new BudgetGuard(supabase);
    const result = await guard.checkBudget();
    
    expect(result.allowed).toBe(true);
  });
});
