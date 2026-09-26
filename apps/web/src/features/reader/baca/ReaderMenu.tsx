import React, { useState, useRef, useEffect } from 'react';
import { useMediaQuery } from '../../../utils/useMediaQuery';
import { Sheet } from '../../../ui/layers/Sheet';
import { Icon } from '../../../ui/basic/Icon';
import { useReaderStore } from '../store/useReaderStore';
import { cn } from '../../../utils/cn';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/AuthStore';
import { Button } from '../../../ui/basic/Button';
import { Stepper } from '../../../ui/basic/Stepper';

interface ReaderMenuProps {
  isOpen: boolean;
  onClose: () => void;
  mode: string; 
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
    versionId: string;
  adaptationId: string;
  onAdaptationReady: (adaptationId: string) => void;
}

type MenuView = 'main' | 'suasana' | 'usia' | 'laporan';

export const ReaderMenu: React.FC<ReaderMenuProps> = ({ 
  isOpen, onClose, mode, buttonRef, versionId, adaptationId, onAdaptationReady
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const [view, setView] = useState<MenuView>('main');
  
  // Report state
  const [reportReason, setReportReason] = useState('');
  const [reportStatus, setReportStatus] = useState<'idle'|'submitting'|'success'>('idle');
  
  // Adapt state
  const [age, setAge] = useState(6);
  const [adaptLoading, setAdaptLoading] = useState(false);
  
  const { 
    theme, setTheme, 
    fontSize, setFontSize,
    backgroundAudio, setBackgroundAudio,
    dongengImageMode, setDongengImageMode,
    dongengShowText, setDongengShowText,
    dongengSpeed, setDongengSpeed
  } = useReaderStore();

  useEffect(() => {
    if (isOpen) {
      setView('main');
      setReportStatus('idle');
      setReportReason('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isDesktop && isOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (buttonRef?.current && buttonRef.current.contains(e.target as Node)) return;
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isDesktop, onClose, buttonRef]);

  const submitReport = async () => {
    if (!user || !reportReason.trim()) return;
    setReportStatus('submitting');
    await supabase.from('reports').insert({
      user_id: user.id,
      target_type: adaptationId ? 'adaptation' : 'version',
      target_id: adaptationId || versionId,
      reason: reportReason.trim()
    });
    setReportStatus('success');
    setTimeout(() => {
      onClose();
      setView('main');
    }, 1500);
  };

  const submitAdapt = async () => {
    if (!user) return;
    setAdaptLoading(true);
    const ageToBand = (a: number) => {
      if (a < 5) return '3-4';
      if (a <= 6) return '5-6';
      if (a <= 9) return '7-9';
      if (a <= 12) return '10-12';
      return 'asli';
    };
    const band = ageToBand(age);
    if (band === 'asli') {
       setAdaptLoading(false);
       onClose();
       // Fetch original adaptation id
       supabase.from('story_adaptations').select('id').eq('version_id', versionId).eq('age_band', 'asli').single()
         .then(({ data }) => { if (data) onAdaptationReady(data.id); });
       return;
    }
    
    // Check if exists
    const { data: existing } = await supabase.from('story_adaptations')
      .select('id, status')
      .eq('version_id', versionId)
      .eq('age_band', band)
      .single();
      
    if (existing) {
      setAdaptLoading(false);
      onAdaptationReady(existing.id);
      onClose();
      return;
    }
    
    // Insert new adaptation job
    const { data: newAd } = await supabase.from('story_adaptations').insert({
      version_id: versionId,
      age_band: band,
      status: 'processing'
    }).select('id').single();
    
    if (newAd) {
      await supabase.from('jobs').insert({
        type: 'generate_adaptation',
        payload: { versionId, band, adaptationId: newAd.id },
        status: 'pending'
      });
      onAdaptationReady(newAd.id);
    }
    setAdaptLoading(false);
    onClose();
  };

  const renderMainView = () => (
    <div className="flex flex-col gap-5 text-sm text-stone-800 font-nunito w-full md:w-[320px]">
      {/* Tampilan */}
      <div className="flex flex-col gap-2">
        <label className="font-bold">Tampilan</label>
        <div className="flex bg-stone-100 p-1 rounded-xl">
          {(['terang', 'hangat', 'gelap'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-center transition-colors capitalize",
                theme === t ? "bg-white shadow-sm font-bold text-teal" : "text-stone-500 hover:text-stone-700"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {mode === 'Baca' ? (
        <>
          {/* Ukuran Teks */}
          <div className="flex items-center justify-between">
            <label className="font-bold">Ukuran teks</label>
            <div className="flex items-center gap-4 bg-stone-100 rounded-full px-2 py-1">
              <button onClick={() => setFontSize('small')} className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", fontSize === 'small' ? 'bg-white shadow-sm text-teal' : 'text-stone-500 hover:text-stone-700')}><Icon name="Minus" size={16} /></button>
              <span className="font-fredoka font-medium">A</span>
              <button onClick={() => setFontSize('large')} className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", fontSize === 'large' ? 'bg-white shadow-sm text-teal' : 'text-stone-500 hover:text-stone-700')}><Icon name="Plus" size={16} /></button>
            </div>
          </div>

          {/* Suara Latar */}
          <div className="flex flex-col gap-2">
            <label className="font-bold">Suara latar</label>
            <div className="flex bg-stone-100 p-1 rounded-xl text-xs">
              <button onClick={() => setBackgroundAudio('mati')} className={cn("flex-1 py-1.5 rounded-lg text-center transition-colors", backgroundAudio === 'mati' ? "bg-white shadow-sm font-bold text-teal" : "text-stone-500 hover:text-stone-700")}>Mati</button>
              <button onClick={() => setBackgroundAudio('otomatis')} className={cn("flex-1 py-1.5 rounded-lg text-center transition-colors", backgroundAudio === 'otomatis' ? "bg-white shadow-sm font-bold text-teal" : "text-stone-500 hover:text-stone-700")}>Otomatis</button>
              <button onClick={() => setView('suasana')} className={cn("flex-1 py-1.5 rounded-lg text-center transition-colors", backgroundAudio !== 'mati' && backgroundAudio !== 'otomatis' ? "bg-white shadow-sm font-bold text-teal" : "text-stone-500 hover:text-stone-700")}>Pilih suasana</button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Gambar (Dongeng) */}
          <div className="flex items-center justify-between">
            <label className="font-bold">Gambar</label>
            <div className="flex bg-stone-100 p-1 rounded-xl text-xs">
              <button onClick={() => setDongengImageMode('dengan')} className={cn("px-3 py-1.5 rounded-lg text-center transition-colors", dongengImageMode === 'dengan' ? "bg-white shadow-sm font-bold text-teal" : "text-stone-500 hover:text-stone-700")}>Dengan gambar</button>
              <button onClick={() => setDongengImageMode('tanpa')} className={cn("px-3 py-1.5 rounded-lg text-center transition-colors", dongengImageMode === 'tanpa' ? "bg-white shadow-sm font-bold text-teal" : "text-stone-500 hover:text-stone-700")}>Tanpa gambar</button>
            </div>
          </div>

          {/* Kecepatan Suara */}
          <div className="flex items-center justify-between">
            <label className="font-bold">Kecepatan suara</label>
            <select 
              value={dongengSpeed} 
              onChange={(e) => setDongengSpeed(Number(e.target.value))}
              className="bg-stone-100 border-none outline-none rounded-xl px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-teal/20"
            >
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
            </select>
          </div>

          {/* Teks Narasi */}
          <div className="flex items-center justify-between">
            <label className="font-bold">Teks narasi</label>
            <div className="flex items-center gap-3">
              <span className="text-stone-500 text-xs font-bold">Tampilkan</span>
              <button 
                onClick={() => setDongengShowText(!dongengShowText)}
                className={cn("w-10 h-6 rounded-full p-1 transition-colors", dongengShowText ? "bg-teal" : "bg-stone-300")}
              >
                <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", dongengShowText ? "translate-x-4" : "translate-x-0")} />
              </button>
            </div>
          </div>
        </>
      )}

      <hr className="border-stone-100" />

      {/* Actions */}
      <div className="flex flex-col gap-1 -mx-2">
        <button 
          onClick={() => setView('usia')}
          className="flex items-center justify-between px-2 py-2 hover:bg-stone-50 rounded-xl transition-colors"
        >
          <span className="font-bold">Sesuaikan usia</span>
          <Icon name="ChevronRight" size={16} className="text-stone-400" />
        </button>
        <button 
          onClick={() => setView('laporan')}
          className="flex items-center justify-between px-2 py-2 hover:bg-stone-50 rounded-xl transition-colors"
        >
          <span className="font-bold text-coral">Laporkan cerita</span>
          <Icon name="ChevronRight" size={16} className="text-stone-400" />
        </button>
      </div>
    </div>
  );

  const renderReportView = () => (
    <div className="flex flex-col font-nunito h-full w-full md:w-[320px]">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setView('main')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 transition-colors">
          <Icon name="ArrowLeft" size={16} />
        </button>
        <h3 className="font-fredoka font-bold text-lg">Laporkan Cerita</h3>
      </div>
      <div className="flex-1">
        {reportStatus === 'success' ? (
          <div className="py-8 text-center text-teal font-bold flex flex-col items-center gap-3">
            <Icon name="Check" size={40} />
            Laporan berhasil dikirim
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-500">Beri tahu kami apa yang salah dengan cerita ini (misalnya, tidak sesuai usia, mengandung kekerasan, atau rasisme).</p>
            <textarea 
              rows={4} 
              className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-teal resize-none bg-stone-50"
              placeholder="Jelaskan alasannya..."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
            />
            <Button variant="primary" className="!bg-red-500 hover:!bg-red-600 !border-red-500 text-white w-full" onClick={submitReport} disabled={!reportReason.trim() || reportStatus === 'submitting'}>
              {reportStatus === 'submitting' ? 'Mengirim...' : 'Kirim Laporan'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAdaptationView = () => (
    <div className="flex flex-col font-nunito h-full w-full md:w-[320px]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('main')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 transition-colors">
          <Icon name="ArrowLeft" size={16} />
        </button>
        <h3 className="font-fredoka font-bold text-lg">Sesuaikan Usia</h3>
      </div>
      <div className="flex flex-col gap-6">
        <p className="text-sm text-stone-500">Sesuaikan bahasa dan penyajian cerita agar cocok dengan usia anak.</p>
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="text-4xl font-fredoka font-bold text-teal">
            {age >= 13 ? 'Asli' : `${age} th`}
          </div>
          <Stepper value={age} onChange={setAge} min={3} max={13} />
        </div>
        <Button variant="primary" onClick={submitAdapt} disabled={adaptLoading} className="w-full">
          {adaptLoading ? 'Memproses...' : 'Terapkan'}
        </Button>
      </div>
    </div>
  );

  const renderSuasanaView = () => (
    <div className="flex flex-col font-nunito h-full w-full md:w-[320px]">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setView('main')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 transition-colors">
          <Icon name="ArrowLeft" size={16} />
        </button>
        <h3 className="font-fredoka font-bold text-lg">Pilih Suasana</h3>
      </div>
      <div className="flex-1 py-10 flex flex-col items-center justify-center text-stone-400 gap-3">
        <Icon name="Music" size={40} className="opacity-20" />
        <span className="text-sm">Pustaka suara belum tersedia</span>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(view) {
      case 'laporan': return renderReportView();
      case 'usia': return renderAdaptationView();
      case 'suasana': return renderSuasanaView();
      case 'main':
      default: return renderMainView();
    }
  };

  if (!isOpen) return null;

  if (isDesktop) {
    return (
      <div ref={menuRef} className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 z-50 p-6 min-w-[320px]">
        {renderContent()}
      </div>
    );
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} hideCloseButton>
      <div className="bg-white rounded-t-3xl p-6 pt-8 min-h-[50vh]">
        {renderContent()}
      </div>
    </Sheet>
  );
};
