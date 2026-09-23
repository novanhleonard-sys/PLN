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

// applyVerdict logic from 8.3
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
