export * from './database.types';

export const freePageLimit = (totalPages: number) => {
    return Math.max(1, Math.floor(0.1 * (totalPages || 10)));
};

export const tierForZoom = (z: number) => {
    if (z < 5) return 1;
    if (z >= 5 && z < 7) return 2;
    if (z >= 7 && z < 9) return 3;
    return 4;
};

export const applyVerdict = (
    verdict: 'pass' | 'no_pass' | 'needs_human_review',
    confidence: number,
    settings: { auto_publish_enabled: boolean, auto_publish_min_confidence: number },
    safety_flags: string[] = [],
    sensitivity: number = 0
): 'approved' | 'rejected' | 'needs_review' => {
    if (safety_flags.length > 0 || sensitivity >= 1) return 'needs_review';
    
    if (verdict === 'pass' && confidence >= settings.auto_publish_min_confidence && settings.auto_publish_enabled) {
        return 'approved';
    }
    
    if (verdict === 'no_pass' && confidence >= settings.auto_publish_min_confidence) {
        return 'rejected';
    }
    
    return 'needs_review';
};
export * from './voice_personas';

import { z } from 'zod';

export const contributionSchema = z.object({
  target_story_id: z.string().uuid().optional().nullable(),
  title: z.string().min(3).max(100),
  type: z.enum(['legenda', 'mite', 'fabel', 'dongeng']),
  region_id: z.string().uuid().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  version_label: z.string().min(2).max(50),
  body: z.string().refine(val => {
    const words = val.trim().split(/\s+/).length;
    return words >= 150 && words <= 3000;
  }, { message: "Teks harus antara 150 - 3000 kata" }),
  sources: z.array(z.object({
    type: z.enum(['buku', 'arsip', 'web', 'lisan']),
    citation: z.string().min(5),
    author: z.string().min(2).optional()
  })).min(1, { message: "Minimal satu sumber cerita" }),
  rights_declared: z.boolean().refine(val => val === true, {
    message: "Harus menyetujui pernyataan hak"
  })
});

export type ContributionPayload = z.infer<typeof contributionSchema>;

import { Database } from './database.types';

export const ageToBand = (age: number): Database['public']['Enums']['age_band'] => {
    if (age < 5) return '3-4';
    if (age <= 6) return '5-6';
    if (age <= 9) return '7-9';
    if (age <= 12) return '10-12';
    return 'asli';
};