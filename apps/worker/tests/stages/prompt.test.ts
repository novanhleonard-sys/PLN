import { assembleImagePrompt } from '../../src/stages/scene-image/index';
import { expect, test } from 'vitest';

test('assembleImagePrompt should correctly format the prompt', () => {
  const styleDescriptor = 'Gaya lukisan cat air, warna pastel.';
  const sceneDescription = 'Seekor kancil berdiri di pinggir sungai.';
  const characterDescriptors = ['Kancil: kecil, lincah, warna coklat'];
  
  const prompt = assembleImagePrompt(styleDescriptor, sceneDescription, characterDescriptors);
  
  expect(prompt).toContain(styleDescriptor);
  expect(prompt).toContain('Adegan: ' + sceneDescription);
  expect(prompt).toContain('Tokoh: Kancil: kecil, lincah, warna coklat.');
  expect(prompt).toContain('komposisi persegi');
});
