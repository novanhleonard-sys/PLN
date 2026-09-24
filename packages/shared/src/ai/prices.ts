// packages/shared/src/ai/prices.ts

export const AI_PRICES = {
  gemini: {
    'gemini-flash-latest': {
      input_per_1m: 0.075,
      output_per_1m: 0.30,
    },
    'gemini-pro-latest': {
      input_per_1m: 1.25,
      output_per_1m: 2.50,
    },
    'gemini-3.8-flash-tts': {
      input_per_1m: 0.10, // approximate character cost mapped to 1M scale
      output_per_1m: 0.40,
    },
    'gemini-3.1-flash-image': {
      per_image: 0.03, // .03 per image
    }
  },
  zai: {
    'glm-4-flash': {
      input_per_1m: 0.01,
      output_per_1m: 0.01,
    }
  }
};

export function calculateCost(provider: string, model: string, inputTokens: number, outputTokens: number, isImage = false): number {
  if (isImage) {
    const costPerImage = AI_PRICES[provider as keyof typeof AI_PRICES]?.[model as any]?.per_image || 0.03;
    return costPerImage * outputTokens; // outputTokens is number of images
  }
  
  const pricing = AI_PRICES[provider as keyof typeof AI_PRICES]?.[model as any];
  if (!pricing) return 0;
  
  const inCost = (inputTokens / 1_000_000) * pricing.input_per_1m;
  const outCost = (outputTokens / 1_000_000) * pricing.output_per_1m;
  return inCost + outCost;
}
