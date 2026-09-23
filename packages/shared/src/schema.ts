import { z } from 'zod';

export const triageSchema = z.object({
  decision: z.enum(['proceed', 'reject_spam', 'reject_offtopic', 'reject_unsafe']),
  duplicate_candidate_id: z.string().uuid().optional(),
  reasons: z.array(z.string())
});

export const verdictSchema = z.object({
  verdict: z.enum(['pass', 'no_pass', 'needs_human_review']),
  confidence: z.number().min(0).max(1),
  tale_type_guess: z.string(),
  region_consistent: z.boolean(),
  discrepancies: z.array(z.object({
    type: z.string(),
    detail: z.string(),
    evidence: z.string()
  })),
  matched_sources: z.array(z.object({
    title: z.string(),
    url: z.string().optional(),
    note: z.string()
  })),
  verbatim_overlap_suspected: z.boolean(),
  safety_flags: z.array(z.string()),
  summary: z.string()
});
