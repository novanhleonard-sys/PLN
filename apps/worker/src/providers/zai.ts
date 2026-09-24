import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { AIProvider } from './registry';

export class ZaiProvider implements AIProvider {
  name = 'zai';
  private apiKey: string;
  private endpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'; // standard GLM endpoint

  constructor() {
    this.apiKey = process.env.ZAI_API_KEY || '';
  }

  async generateText(model: string, prompt: string, systemInstruction?: string, opts?: Record<string, any>) {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages
      })
    });

    if (!res.ok) {
      const errBody = await res.text(); throw new Error('ZAI API error: ' + res.statusText + ' ' + errBody);
    }

    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content || '',
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
    };
  }

  async generateJSON<T>(model: string, prompt: string, schema: z.Schema<T>, systemInstruction?: string, opts?: Record<string, any>) {
    // Z.ai GLM-4-flash doesn't strictly support structured outputs natively in the same way as Gemini,
    // so we append instruction to return pure JSON.
    
    const jsonSchema = JSON.stringify(zodToJsonSchema(schema as any, 'schema'));
    const sys = (systemInstruction || '') + '\n\nYou must respond with only valid JSON matching this JSON schema: ' + jsonSchema + '\n\nCRITICAL: DO NOT TRANSLATE JSON KEYS! USE EXACTLY THE KEYS DEFINED IN THE SCHEMA (e.g. do not change "reason" to "alasan" or "isValid" to "status_verifikasi").';
    const { text, inputTokens, outputTokens } = await this.generateText(model, prompt, sys);
    
    // Attempt to extract JSON from markdown if wrapped
    const match = text.match(/\{[\s\S]*\}/); 
    const cleanText = match ? match[0] : text;
    let parsed; try { parsed = JSON.parse(cleanText); schema.parse(parsed); } catch (e) { console.error('ZAI PARSE ERROR on text:', text); throw e; } const data = schema.parse(parsed);
    console.log('Zai Output text:', text);

    return {
      data,
      inputTokens,
      outputTokens,
    };
  }
}












