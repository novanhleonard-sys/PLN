import { GoogleGenAI, Type, Schema } from '@google/genai';
import { z } from 'zod';
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

const schema = z.object({
  isValid: z.boolean(),
  originalStory: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    name: z.string()
  }),
  confidence: z.number(),
  reason: z.string()
});

console.log(JSON.stringify(zodToGeminiSchema(schema), null, 2));
