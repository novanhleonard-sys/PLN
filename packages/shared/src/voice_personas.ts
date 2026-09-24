export function getPersonaForRegion(region?: string | null): string {
    if (!region) return 'Aoede';
    const r = region.toLowerCase();
    
    // Asal versi cerita terverifikasi -> Persona
    if (r.includes('jawa')) return 'Kore';
    if (r.includes('sumatra') || r.includes('sumatera')) return 'Charon';
    if (r.includes('kalimantan')) return 'Fenrir';
    if (r.includes('sulawesi')) return 'Aoede';
    if (r.includes('papua')) return 'Puck';
    
    // Default
    return 'Aoede';
}

