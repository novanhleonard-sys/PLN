import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { calculateCost } from '../../../../packages/shared/src/ai/prices';
import { BudgetGuard } from '../core/budget';

export interface GenerateOptions {
  referenceImages?: string[];
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
  generateAudio?(model: string, prompt: string, voiceName: string, systemInstruction?: string, opts?: Record<string, any>): Promise<{ audioBase64: string; inputTokens: number; outputTokens: number }>;
  generateImage?(model: string, prompt: string, referenceImages?: string[], opts?: Record<string, any>): Promise<{ imageBase64: string; costUsd?: number }>;
}

export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();
  
  constructor(private supabase: SupabaseClient, private budgetGuard: BudgetGuard) {}

  register(provider: AIProvider) {
    this.providers.set(provider.name, provider);
  }

  async generateJSON<T>(schema: z.Schema<T>, opts: GenerateOptions): Promise<T> {
    await this.budgetGuard.checkBudget(opts.ref);

    const provider = this.providers.get(opts.provider);
    if (!provider) throw new Error('Provider not found: ' + opts.provider);

    let attempt = 0;
    while (attempt < 2) {
      try {
        const result = await provider.generateJSON(opts.model, opts.prompt, schema, opts.systemInstruction, opts);
        await this.logUsage(opts, result.inputTokens, result.outputTokens, false, 'succeeded', attempt + 1);
        return result.data;
      } catch (err: any) {
        await this.logUsage(opts, 0, 0, false, 'failed', attempt + 1, err.message);
        attempt++;
        if (attempt >= 2) throw new Error('Provider ' + opts.provider + ' failed after retry: ' + err.message, { cause: err });
      }
    }
    throw new Error('Unreachable');
  }

  async generateText(opts: GenerateOptions): Promise<string> {
    await this.budgetGuard.checkBudget(opts.ref);

    const provider = this.providers.get(opts.provider);
    if (!provider) throw new Error('Provider not found: ' + opts.provider);

    let attempt = 0;
    while (attempt < 2) {
      try {
        const result = await provider.generateText(opts.model, opts.prompt, opts.systemInstruction, opts);
        await this.logUsage(opts, result.inputTokens, result.outputTokens, false, 'succeeded', attempt + 1);
        return result.text;
      } catch (err: any) {
        await this.logUsage(opts, 0, 0, false, 'failed', attempt + 1, err.message);
        attempt++;
        if (attempt >= 2) throw new Error('Provider ' + opts.provider + ' failed after retry: ' + err.message, { cause: err });
      }
    }
    throw new Error('Unreachable');
  }

  async generateAudio(opts: GenerateOptions & { voiceName: string }): Promise<string> {
    await this.budgetGuard.checkBudget(opts.ref);

    const provider = this.providers.get(opts.provider);
    if (!provider) throw new Error('Provider not found: ' + opts.provider);
    if (!provider.generateAudio) throw new Error('Provider ' + opts.provider + ' does not support generateAudio');

    let attempt = 0;
    while (attempt < 2) {
      try {
        const result = await provider.generateAudio(opts.model, opts.prompt, opts.voiceName, opts.systemInstruction, opts);
        await this.logUsage(opts, result.inputTokens, result.outputTokens, false, 'succeeded', attempt + 1);
        return result.audioBase64;
      } catch (err: any) {
        await this.logUsage(opts, 0, 0, false, 'failed', attempt + 1, err.message);
        attempt++;
        if (attempt >= 2) throw new Error('Provider ' + opts.provider + ' failed audio generation after retry: ' + err.message, { cause: err });
      }
    }
    throw new Error('Unreachable');
  }

  async generateImage(opts: GenerateOptions): Promise<string> {
    await this.budgetGuard.checkBudget(opts.ref);

    const provider = this.providers.get(opts.provider);
    if (!provider) throw new Error('Provider not found: ' + opts.provider);
    if (!provider.generateImage) throw new Error('Provider ' + opts.provider + ' does not support generateImage');

    let attempt = 0;
    while (attempt < 2) {
      try {
        const result = await provider.generateImage(opts.model, opts.prompt, opts.referenceImages, opts);
        const cost = result.costUsd || calculateCost(opts.provider, opts.model, 0, 1, true);
        await this.logUsage(opts, 0, 1, true, 'succeeded', attempt + 1, null, cost);
        return result.imageBase64;
      } catch (err: any) {
        await this.logUsage(opts, 0, 0, true, 'failed', attempt + 1, err.message);
        attempt++;
        if (attempt >= 2) throw new Error('Provider ' + opts.provider + ' failed image generation after retry: ' + err.message, { cause: err });
      }
    }
    throw new Error('Unreachable');
  }

  private async logUsage(opts: GenerateOptions, inputTokens: number, outputTokens: number, isImage: boolean, status: string, attempt: number, errorMsg: string | null = null, costUsdOverride?: number) {
    const cost = costUsdOverride !== undefined ? costUsdOverride : calculateCost(opts.provider, opts.model, inputTokens, outputTokens, isImage);
    try {
      await this.supabase.from('ai_usage').insert({
        stage: opts.stage,
        provider: opts.provider,
        model: opts.model,
        units_in: inputTokens,
        units_out: outputTokens,
        cost_usd: cost,
        ref: opts.ref,
        user_id: opts.userId,
        operation_status: status,
        attempt: attempt,
        error_message: errorMsg
      });
    } catch (e) {
      console.error("Failed to log usage:", e);
    }
  }
}






