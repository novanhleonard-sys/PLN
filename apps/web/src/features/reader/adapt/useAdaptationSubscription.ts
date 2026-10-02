import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export const useAdaptationSubscription = (pendingAdaptationId: string | null, onReady: (id: string) => void, onError: (msg: string) => void) => {
  useEffect(() => {
    if (!pendingAdaptationId) return;

    const channel = supabase.channel(`adapt_${pendingAdaptationId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'adaptations', 
        filter: `id=eq.${pendingAdaptationId}` 
      }, (payload) => {
        const status = payload.new.status;
        if (status === 'ready') {
          onReady(pendingAdaptationId);
        } else if (status === 'failed') {
          onError('Versi usia ini belum berhasil dibuat. Kamu tetap membaca versi asli.');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pendingAdaptationId, onReady, onError]);
};
