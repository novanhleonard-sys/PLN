import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { AIProvider } from './registry';
import { zodToJsonSchema } from 'zod-to-json-schema';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateText(model: string, prompt: string, systemInstruction?: string, opts?: Record<string, any>) {
    const response = await this.ai.models.generateContent({
      model,
      contents: prompt,
      config: { systemInstruction, tools: opts?.useSearchGrounding ? [{ googleSearch: {} }] as any : undefined }
    });
    
    return {
      text: response.text || '',
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
    };
  }

  async generateJSON<T>(model: string, prompt: string, schema: z.Schema<T>, systemInstruction?: string, opts?: Record<string, any>) {
    const jsonSchema = zodToJsonSchema(schema as any, "mySchema") as any;
    // Adapt zodToJsonSchema output for Gemini
    const geminiSchema = jsonSchema.definitions ? jsonSchema.definitions.mySchema : jsonSchema;

    const response = await this.ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: opts?.useSearchGrounding ? [{ googleSearch: {} }] as any : undefined,
                systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: geminiSchema,
      }
    });

    if (!response.text) throw new Error('Empty response from Gemini');
    
    // Parse and validate with zod
    const parsed = JSON.parse(response.text);
    const data = schema.parse(parsed);

    return {
      data,
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
    };
  }
}





