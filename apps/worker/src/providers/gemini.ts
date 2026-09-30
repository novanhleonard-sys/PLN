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
        const isOpt = fieldSchema.isOptional ? fieldSchema.isOptional() : false;
        let inner = fieldSchema;
        if (isOpt && typeof fieldSchema.unwrap === 'function') {
           inner = fieldSchema.unwrap();
        } else if (isOpt && fieldSchema._def?.innerType) {
           inner = fieldSchema._def.innerType;
        }
        properties[key] = zodToGeminiSchema(inner);
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
    if (schema._def?.typeName === 'ZodAny') return { type: Type.STRING, description: schema.description };
    if (schema._def?.typeName === 'ZodAny') return { type: Type.STRING, description: schema.description };
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
    
    let cleanText = response.text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    // Parse and validate with zod
    const parsed = JSON.parse(cleanText);
    const data = schema.parse(parsed);

    return {
      data,
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
    };
  }

  async generateAudio(model: string, prompt: string, voiceName: string, systemInstruction?: string, opts?: Record<string, any>) {
    const response = await this.ai.models.generateContent({
      model: model || 'gemini-2.0-flash',
      contents: prompt,
      config: { systemInstruction: systemInstruction ? { role: 'user', parts: [{ text: systemInstruction }] } : undefined,
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName
            }
          }
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    const audioPart = parts.find((p: any) => p.inlineData && p.inlineData.mimeType?.startsWith('audio/'));
    
    if (!audioPart || !audioPart.inlineData || !audioPart.inlineData.data) {
      throw new Error('Gemini did not return audio data.');
    }

    console.log("Audio mimeType:", audioPart.inlineData.mimeType);

    return {
      audioBase64: audioPart.inlineData.data as string,
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
    };
  }
    async generateImage(model: string, prompt: string, referenceImages?: string[], opts?: Record<string, any>) {
    const contents = referenceImages?.length 
      ? [ { text: prompt }, ...referenceImages.map(img => ({ inlineData: { data: img, mimeType: 'image/png' } })) ] as any 
      : prompt;

    const response = await this.ai.models.generateContent({
      model: model || 'gemini-3.1-flash-image',
      contents
    });
    
    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData && p.inlineData.mimeType?.startsWith('image/'));
    
    if (!imagePart || !imagePart.inlineData || !imagePart.inlineData.data) {
      throw new Error('Gemini did not return image data.');
    }

    return {
      imageBase64: imagePart.inlineData.data as string,
      costUsd: undefined
    };
  }
}
