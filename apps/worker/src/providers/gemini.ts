import { GoogleGenAI, Type, Schema } from '@google/genai';
import { z } from 'zod';
import { AIProvider } from './registry';

function zodToGeminiSchema(schema: any): Schema {
  const typeStr = schema._def?.type || schema.type;
  if (typeStr === 'object') {
    const properties: any = {};
    const required: string[] = [];
    const shape = schema.shape || schema._def?.shape();
    for (const key of Object.keys(shape)) {
      const fieldSchema = shape[key];
      const isOpt = fieldSchema._def?.type === 'optional' || fieldSchema.isOptional?.();
      properties[key] = zodToGeminiSchema(isOpt ? (fieldSchema._def?.innerType || fieldSchema.unwrap()) : fieldSchema);
      if (!isOpt) required.push(key);
    }
    return {
      type: Type.OBJECT,
      properties,
      required: required.length > 0 ? required : undefined,
      description: schema.description
    };
  }
  if (typeStr === 'array') {
    return {
      type: Type.ARRAY,
      items: zodToGeminiSchema(schema.element || schema._def?.type),
      description: schema.description
    };
  }
  if (typeStr === 'string') return { type: Type.STRING, description: schema.description };
  if (typeStr === 'number') return { type: Type.NUMBER, description: schema.description };
  if (typeStr === 'boolean') return { type: Type.BOOLEAN, description: schema.description };
  return { type: Type.STRING };
}

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
    const geminiSchema = zodToGeminiSchema(schema);

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





