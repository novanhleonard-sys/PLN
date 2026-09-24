// packages/shared/src/ai/routes.ts

export const AI_ROUTES = {
  triage: {
    provider: 'zai',
    model: 'glm-4-flash',
  },
  verify: {
    provider: 'gemini',
    model: 'gemini-pro-latest', 
  },
  segment: {
    provider: 'gemini',
    model: 'gemini-flash-latest',
  },
  tts: {
    provider: 'gemini',
    model: 'gemini-3.8-flash-tts',
  },
  image: {
    provider: 'gemini',
    model: 'gemini-3.1-flash-image',
  }
};
