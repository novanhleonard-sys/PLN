import { z } from 'zod';
import { AIProvider } from './registry';

export class ZaiProvider implements AIProvider {
  name = 'zai';
  private apiKey: string;
  private endpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'; // standard GLM endpoint

  constructor() {
    this.apiKey = process.env.ZAI_API_KEY || '';
  }

  async generateText(model: string, prompt: string, systemInstruction?: string) {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': Bearer  + this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages
      })
    });

    if (!res.ok) {
      throw new Error('ZAI API error: ' + res.statusText);
    }

    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content || '',
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
    };
  }

  async generateJSON<T>(model: string, prompt: string, schema: z.Schema<T>, systemInstruction?: string) {
    // Z.ai GLM-4-flash doesn't strictly support structured outputs natively in the same way as Gemini,
    // so we append instruction to return pure JSON.
    const sys = (systemInstruction || '') + '\n\nYou must respond with only valid JSON matching the schema.';
    const { text, inputTokens, outputTokens } = await this.generateText(model, prompt, sys);
    
    // Attempt to extract JSON from markdown if wrapped
    const cleanText = text.replace(/`json/g, '').replace(/`/g, '').trim();
    const parsed = JSON.parse(cleanText);
    const data = schema.parse(parsed);

    return {
      data,
      inputTokens,
      outputTokens,
    };
  }
}

