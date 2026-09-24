import React, { useState } from 'react';
import { Sheet } from '../../../ui/layers/Sheet';
import { Modal } from '../../../ui/layers/Modal';
import { useMediaQuery } from '../../../utils/useMediaQuery';
import { Button } from '../../../ui/basic/Button';
import { Stepper } from '../../../ui/basic/Stepper';
import { Chip } from '../../../ui/basic/Chip';
import { Icon } from '../../../ui/basic/Icon';
import { supabase } from '../../../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  versionId: string;
  onAdaptationReady: (adaptationId: string) => void;
}

export const AdaptationModal: React.FC<Props> = ({ isOpen, onClose, versionId, onAdaptationReady }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const [age, setAge] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const ageToBand = (a: number) => {
    if (a < 5) return '3-4';
    if (a <= 6) return '5-6';
    if (a <= 9) return '7-9';
    if (a <= 12) return '10-12';
    return 'asli';
  };
  
  const band = ageToBand(age);
  
  const handleAdapt = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request_adaptation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ version_id: versionId, age })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Gagal meminta adaptasi');
      }
      
      if (data.status === 'ready' || data.band === 'asli') {
        onAdaptationReady(data.adaptation_id);
        onClose();
        setLoading(false);
        return;
      }
      
      // If pending, subscribe to changes
      const adaptId = data.adaptation_id;
      
      const channel = supabase.channel(`adaptations:${adaptId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'adaptations',
          filter: `id=eq.${adaptId}`
        }, (payload) => {
          if (payload.new.status === 'ready') {
            supabase.removeChannel(channel);
            onAdaptationReady(adaptId);
            onClose();
            setLoading(false);
          } else if (payload.new.status === 'failed') {
            supabase.removeChannel(channel);
            setError('Adaptasi gagal. Silakan coba lagi atau baca versi asli.');
            setLoading(false);
          }
        })
        .subscribe();
        
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const content = (
    <div className="p-4 md:p-6 flex flex-col items-center text-center">
      {!loading ? (
        <>
          <h2 className="text-2xl font-fredoka text-text-main mb-2">Sesuaikan dengan usia</h2>
          <p className="text-text-muted mb-8 max-w-sm">
            Cerita akan ditulis ulang agar lebih mudah dipahami. Usia tidak disimpan.
          </p>
          
          <div className="mb-6 w-full max-w-xs mx-auto">
             <Stepper value={age} onChange={setAge} min={2} max={15} label="tahun" />
          </div>
          
          <div className="mb-8">
            <Chip label={`Disesuaikan untuk usia ${band} tahun`} />
          </div>
          
          <div className="bg-cream p-4 rounded-xl text-sm text-text-muted flex items-start gap-3 text-left mb-8 max-w-sm">
            <Icon name="Info" size={20} className="shrink-0 text-teal mt-0.5" />
            <p>Teks disusun ulang oleh AI dan bisa berbeda dari cerita asli. Kamu selalu bisa kembali ke versi asli.</p>
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
            <Button onClick={handleAdapt}>Sesuaikan</Button>
            <Button variant="ghost" onClick={onClose}>Batal</Button>
          </div>
        </>
      ) : (
        <>
           <div className="h-24 w-24 bg-ocean rounded-full flex items-center justify-center text-teal mx-auto mb-4">
              <Icon name="BookOpen" size={32} />
           </div>
           <h2 className="text-2xl font-fredoka text-text-main mb-2">Menyesuaikan cerita...</h2>
           <p className="text-text-muted mb-6 max-w-sm">
             Biasanya sekitar setengah menit. Kamu bisa menutup ini dan membaca versi asli dulu.
           </p>
           <Button variant="secondary" onClick={onClose}>Baca versi asli</Button>
        </>
      )}
    </div>
  );

  if (isDesktop) {
    return <Modal isOpen={isOpen} onClose={onClose}>{content}</Modal>;
  }

  return <Sheet isOpen={isOpen} onClose={onClose}>{content}</Sheet>;
};
