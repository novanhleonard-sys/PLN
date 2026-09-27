const fs = require('fs');
let code = fs.readFileSync('apps/worker/src/providers/gemini.ts', 'utf-8');

code = code.replace(
  'async generateAudio(model: string, prompt: string, voiceName: string, systemInstruction?: string, opts?: \nRecord<string, any>) {1contents: prompt,2config: { systemInstruction,',
  \sync generateAudio(model: string, prompt: string, voiceName: string, systemInstruction?: string, opts?: Record<string, any>) {
    const response = await this.ai.models.generateContent({
      model: model || 'gemini-2.0-flash',
      contents: prompt,
      config: { systemInstruction,\
);

fs.writeFileSync('apps/worker/src/providers/gemini.ts', code);
