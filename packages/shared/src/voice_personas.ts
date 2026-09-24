// packages/shared/src/voice_personas.ts

export interface VoicePersona {
  id: string;
  name: string;
  description: string;
  regions: string[]; // Kemendagri region codes or tags
  traits: string[];
}

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: "neutral_storyteller",
    name: "Pendongeng Nusantara",
    description: "Pendongeng bahasa Indonesia yang hangat, ekspresif, dan berirama santai layaknya bercerita pada anak-anak. Mengucapkan teks verbatim, emosi dibangun dari tempo dan jeda.",
    regions: ["general", "fabel", "unknown"],
    traits: ["warm", "expressive", "clear", "neutral_accent"]
  },
  {
    id: "jawa_storyteller",
    name: "Paman Jawa",
    description: "Pendongeng dengan cengkok dan kelembutan tutur khas tradisi lisan Jawa. Hangat, medok halus, berwibawa namun ramah anak.",
    regions: ["33", "34", "35"], // Jateng, DIY, Jatim
    traits: ["warm", "soft_spoken", "javanese_accent", "wise"]
  },
  {
    id: "betawi_storyteller",
    name: "Abang Betawi",
    description: "Pendongeng dengan gaya tutur Betawi yang lugas, ekspresif, berirama dinamis, dan penuh semangat.",
    regions: ["31", "36"], // DKI Jakarta, Banten (sebagian)
    traits: ["dynamic", "expressive", "betawi_accent", "energetic"]
  },
  {
    id: "sumatera_storyteller",
    name: "Datuk Sumatera",
    description: "Pendongeng dengan ritme melayu yang mengayun, jelas, pantun-esque, berwibawa dan kental nuansa Sumatera.",
    regions: ["11", "12", "13", "14", "15", "16"], // Aceh, Sumut, Sumbar, Riau, Jambi, Sumsel
    traits: ["rhythmic", "malay_accent", "authoritative", "warm"]
  }
];

export function getPersonaForRegion(regionCode: string, type: string): VoicePersona {
  if (type === 'fabel') {
    return VOICE_PERSONAS.find(p => p.id === 'neutral_storyteller')!;
  }
  
  const persona = VOICE_PERSONAS.find(p => p.regions.includes(regionCode));
  return persona || VOICE_PERSONAS.find(p => p.id === 'neutral_storyteller')!;
}
