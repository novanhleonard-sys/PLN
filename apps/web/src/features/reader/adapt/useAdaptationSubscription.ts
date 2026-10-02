import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export const useAdaptationSubscription = (pendingAdaptationId: string | null, onReady: (id: string) => void, onError: (msg: string) => void) => {
  useEffect(() => {
    if (!pendingAdaptationId) return;

    let isSubscribed = true;

    // Fallback polling to catch race conditions where the backend finishes before Realtime connects
    const checkStatus = async () => {
      if (!isSubscribed) return;
      const { data } = await supabase.from('adaptations').select('status').eq('id', pendingAdaptationId).single();
      if (data) {
        if (data.status === 'ready') {
          onReady(pendingAdaptationId);
        } else if (data.status === 'failed') {
          onError('Versi usia ini belum berhasil dibuat. Kamu tetap membaca versi asli.');
        }
      }
    };

    const interval = setInterval(checkStatus, 3000);
    checkStatus(); // Check immediately once

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
      isSubscribed = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [pendingAdaptationId, onReady, onError]);
};
