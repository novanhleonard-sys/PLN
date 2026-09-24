import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { calculateCost } from '../../../../packages/shared/src/ai/prices';
import { BudgetGuard } from '../core/budget';

export interface GenerateOptions {
  provider: string;
  model: string;
  systemInstruction?: string;
  prompt: string;
  ref?: string;
  userId?: string;
  stage: string;
  useSearchGrounding?: boolean;
}

export interface AIProvider {
  name: string;
  generateText(model: string, prompt: string, systemInstruction?: string, opts?: Record<string, any>): Promise<{ text: string; inputTokens: number; outputTokens: number }>;
  generateJSON<T>(model: string, prompt: string, schema: z.Schema<T>, systemInstruction?: string, opts?: Record<string, any>): Promise<{ data: T; inputTokens: number; outputTokens: number }>;
}

export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();
  
  constructor(private supabase: SupabaseClient, private budgetGuard: BudgetGuard) {}

  register(provider: AIProvider) {
    this.providers.set(provider.name, provider);
  }

  async generateJSON<T>(schema: z.Schema<T>, opts: GenerateOptions): Promise<T> {
    const budgetCheck = await this.budgetGuard.checkBudget(opts.ref);
    if (!budgetCheck.allowed) {
      throw new Error('BUDGET_EXCEEDED: ' + budgetCheck.reason);
    }

    const provider = this.providers.get(opts.provider);
    if (!provider) throw new Error('Provider not found: ' + opts.provider);

    let attempt = 0;
    while (attempt < 2) { // 1 retry
      try {
        const result = await provider.generateJSON(opts.model, opts.prompt, schema, opts.systemInstruction, opts);
        await this.logUsage(opts, result.inputTokens, result.outputTokens, false);
        return result.data;
      } catch (err: any) {
        attempt++;
        if (attempt >= 2) {
          throw new Error('Provider ' + opts.provider + ' failed after retry: ' + err.message, { cause: err });
        }
      }
    }
    throw new Error('Unreachable');
  }

  async generateText(opts: GenerateOptions): Promise<string> {
    const budgetCheck = await this.budgetGuard.checkBudget(opts.ref);
    if (!budgetCheck.allowed) {
      throw new Error('BUDGET_EXCEEDED: ' + budgetCheck.reason);
    }

    const provider = this.providers.get(opts.provider);
    if (!provider) throw new Error('Provider not found: ' + opts.provider);

    let attempt = 0;
    while (attempt < 2) { // 1 retry
      try {
        const result = await provider.generateText(opts.model, opts.prompt, opts.systemInstruction, opts);
        await this.logUsage(opts, result.inputTokens, result.outputTokens, false);
        return result.text;
      } catch (err: any) {
        attempt++;
        if (attempt >= 2) {
          throw new Error('Provider ' + opts.provider + ' failed after retry: ' + err.message, { cause: err });
        }
      }
    }
    throw new Error('Unreachable');
  }

  private async logUsage(opts: GenerateOptions, inputTokens: number, outputTokens: number, isImage: boolean) {
    const cost = calculateCost(opts.provider, opts.model, inputTokens, outputTokens, isImage);
    
    await this.supabase.from('ai_usage').insert({
      stage: opts.stage,
      provider: opts.provider,
      model: opts.model,
      units_in: inputTokens,
      units_out: outputTokens,
      cost_usd: cost,
      ref: opts.ref,
      user_id: opts.userId
    });
  }
}




