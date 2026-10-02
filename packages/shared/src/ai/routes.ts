// packages/shared/src/ai/routes.ts

export const AI_ROUTES = {
  triage: {
    provider: 'gemini',
    model: 'gemini-1.5-flash-lite',
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
    model: 'gemini-1.5-flash-image',
  }
};

