import React, { useState, useRef, useEffect } from 'react';
import { useMediaQuery } from '../../../utils/useMediaQuery';
import { Sheet } from '../../../ui/layers/Sheet';
import { Icon } from '../../../ui/basic/Icon';
import { useReaderStore, useComputedPrefs, getThemeClasses } from '../store/useReaderStore';
import { cn } from '../../../utils/cn';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/AuthStore';
import { Button } from '../../../ui/basic/Button';
import { Stepper } from '../../../ui/basic/Stepper';

interface ReaderMenuProps {
  isOpen: boolean;
  onClose: () => void;
  mode: string;
  
  versionId: string;
  
  storyId: string;
  onAdaptationReady: (adaptationId: string) => void;
}

type MenuView = 'main' | 'suasana' | 'usia' | 'laporan';

export const ReaderMenu: React.FC<ReaderMenuProps> = ({ 
  isOpen, onClose, mode, versionId, storyId, onAdaptationReady
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const [view, setView] = useState<MenuView>('main');
  const [reportReason, setReportReason] = useState('');
  const [reportStatus, setReportStatus] = useState<'idle'|'submitting'|'success'>('idle');
  const [age, setAge] = useState(6);
  const [adaptLoading, setAdaptLoading] = useState(false);
  const [availableSounds, setAvailableSounds] = useState<any[]>([]);

  const { updateOverride, resetOverride, activeStoryId, storyOverrides } = useReaderStore();
  const prefs = useComputedPrefs();
  const themeClasses = getThemeClasses(prefs.theme);
  
  const isOverridden = activeStoryId ? !!storyOverrides[activeStoryId] : false;

  useEffect(() => {
    if (view === 'suasana' && availableSounds.length === 0) {
      supabase.from('ambient_sounds').select('*').eq('is_active', true).then(({ data }) => {
        if (data) setAvailableSounds(data);
      });
    }
  }, [view]);

  const submitReport = async () => {
    setReportStatus('submitting');
    await supabase.from('reports').insert({
      version_id: versionId,
      user_id: user?.id,
      reason: reportReason,
      status: 'pending'
    });
    setReportStatus('success');
    setTimeout(() => {
      onClose();
      setView('main');
      setReportStatus('idle');
      setReportReason('');
    }, 2000);
  };

  const submitAdapt = async () => {
    setAdaptLoading(true);
    const { data } = await supabase.from('jobs').insert({
       type: 'adaptation',
       payload: { version_id: versionId, target_age: age },
       status: 'pending'
    }).select().single();
    
    if (data) onAdaptationReady(data.id);
    setAdaptLoading(false);
    onClose();
  };

  const renderMainView = () => (
    <div className={cn("flex flex-col gap-6 font-nunito h-full w-full md:w-[320px]", themeClasses.textMain)}>
      <h3 className="font-fredoka font-bold text-lg">Sesuaikan Bacaan</h3>
      
      {/* Tampilan */}
      <div className="flex items-center justify-between">
        <label className="font-bold">Tampilan</label>
        <div className={cn("flex p-1 rounded-xl text-xs", themeClasses.navBg)}>
          {(['terang', 'hangat', 'gelap'] as const).map(t => (
            <button 
              key={t}
              onClick={() => updateOverride(storyId, { theme: t })} 
              className={cn("px-3 py-1.5 rounded-lg text-center transition-colors capitalize", prefs.theme === t ? "bg-white shadow-sm font-bold text-teal" : "text-stone-500 hover:text-stone-700")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {mode === 'Baca' ? (
        <>
          <div className="flex items-center justify-between">
            <label className="font-bold">Ukuran teks (Baca)</label>
            <div className={cn("flex p-1 rounded-xl text-xs", themeClasses.navBg)}>
              {(['kecil', 'sedang', 'besar'] as const).map(s => (
                <button 
                  key={s}
                  onClick={() => updateOverride(storyId, { fontSizeBaca: s })} 
                  className={cn("px-3 py-1.5 rounded-lg text-center transition-colors capitalize", prefs.fontSizeBaca === s ? "bg-white shadow-sm font-bold text-teal" : "text-stone-500 hover:text-stone-700")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="font-bold">Suara latar</label>
              <div className="flex items-center gap-3">
                <span className={cn("text-xs font-bold", prefs.bgAudioOn ? "text-teal" : "text-stone-500")}>
                  {prefs.bgAudioOn ? 'Hidup' : 'Mati'}
                </span>
                <button 
                  onClick={() => updateOverride(storyId, { bgAudioOn: !prefs.bgAudioOn })}
                  className={cn("w-10 h-6 rounded-full p-1 transition-colors", prefs.bgAudioOn ? "bg-teal" : "bg-stone-300")}
                >
                  <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", prefs.bgAudioOn ? "translate-x-4" : "translate-x-0")} />
                </button>
              </div>
            </div>
            
            {prefs.bgAudioOn && (
              <button 
                onClick={() => setView('suasana')}
                className={cn("flex justify-between items-center px-4 py-2 rounded-xl text-sm transition-colors", themeClasses.navBg)}
              >
                <span>Pilih suasana</span>
                <span className="flex items-center gap-1 font-bold">
                  {availableSounds.find(s => s.id === prefs.bgAudioSoundId)?.name || 'Rekomendasi'}
                  <Icon name="ChevronRight" size={16} />
                </span>
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <label className="font-bold">Ukuran teks narasi</label>
            <div className={cn("flex p-1 rounded-xl text-xs", themeClasses.navBg)}>
              {(['kecil', 'sedang', 'besar'] as const).map(s => (
                <button 
                  key={s}
                  onClick={() => updateOverride(storyId, { fontSizeDongeng: s })} 
                  className={cn("px-3 py-1.5 rounded-lg text-center transition-colors capitalize", prefs.fontSizeDongeng === s ? "bg-white shadow-sm font-bold text-teal" : "text-stone-500 hover:text-stone-700")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-bold">Gambar</label>
            <div className={cn("flex p-1 rounded-xl text-xs", themeClasses.navBg)}>
              <button onClick={() => updateOverride(storyId, { dongengImageMode: 'dengan' })} className={cn("px-3 py-1.5 rounded-lg text-center transition-colors", prefs.dongengImageMode === 'dengan' ? "bg-white shadow-sm font-bold text-teal" : "text-stone-500 hover:text-stone-700")}>Dengan gambar</button>
              <button onClick={() => updateOverride(storyId, { dongengImageMode: 'tanpa' })} className={cn("px-3 py-1.5 rounded-lg text-center transition-colors", prefs.dongengImageMode === 'tanpa' ? "bg-white shadow-sm font-bold text-teal" : "text-stone-500 hover:text-stone-700")}>Tanpa gambar</button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-bold">Kecepatan suara</label>
            <select 
              value={prefs.dongengSpeed} 
              onChange={(e) => updateOverride(storyId, { dongengSpeed: Number(e.target.value) })}
              className={cn("border-none outline-none rounded-xl px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-teal/20", themeClasses.navBg, themeClasses.textMain)}
            >
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-bold">Teks narasi</label>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold opacity-70">Tampilkan</span>
              <button 
                onClick={() => updateOverride(storyId, { dongengShowText: !prefs.dongengShowText })}
                className={cn("w-10 h-6 rounded-full p-1 transition-colors", prefs.dongengShowText ? "bg-teal" : "bg-stone-300")}
              >
                <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", prefs.dongengShowText ? "translate-x-4" : "translate-x-0")} />
              </button>
            </div>
          </div>
        </>
      )}

      {isOverridden && (
        <Button variant="secondary" size="sm" onClick={() => resetOverride(storyId)} className="mt-2 w-full">
          Kembalikan ke Default
        </Button>
      )}

      <hr className={themeClasses.border} />

      <div className="flex flex-col gap-1 -mx-2">
        <button 
          onClick={() => setView('usia')}
          className={cn("flex items-center justify-between px-4 py-2 hover:bg-stone-500/10 rounded-xl transition-colors", themeClasses.textMain)}
        >
          <span className="font-bold">Sesuaikan usia</span>
          <Icon name="ChevronRight" size={16} className="opacity-50" />
        </button>
        <button 
          onClick={() => setView('laporan')}
          className="flex items-center justify-between px-4 py-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-500"
        >
          <span className="font-bold">Laporkan cerita</span>
          <Icon name="ChevronRight" size={16} className="opacity-50" />
        </button>
      </div>
    </div>
  );

  const wrapView = (title: string, content: React.ReactNode) => (
    <div className={cn("flex flex-col font-nunito h-full w-full md:w-[320px]", themeClasses.textMain)}>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setView('main')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-500/10 transition-colors">
          <Icon name="ArrowLeft" size={16} />
        </button>
        <h3 className="font-fredoka font-bold text-lg">{title}</h3>
      </div>
      <div className="flex-1">{content}</div>
    </div>
  );

  const renderSuasanaView = () => wrapView('Pilih Suasana', (
    <div className="flex flex-col gap-2">
      <button 
        onClick={() => updateOverride(storyId, { bgAudioSoundId: null })}
        className={cn("flex items-center justify-between p-3 rounded-xl border text-left", 
          !prefs.bgAudioSoundId ? "border-teal bg-teal/5" : themeClasses.border
        )}
      >
        <span className="font-bold">Rekomendasi (Otomatis)</span>
        {!prefs.bgAudioSoundId && <Icon name="Check" className="text-teal" size={16} />}
      </button>
      
      {availableSounds.map(s => (
         <button 
          key={s.id}
          onClick={() => updateOverride(storyId, { bgAudioSoundId: s.id })}
          className={cn("flex items-center justify-between p-3 rounded-xl border text-left", 
            prefs.bgAudioSoundId === s.id ? "border-teal bg-teal/5" : themeClasses.border
          )}
        >
          <div className="flex flex-col">
            <span className="font-bold">{s.name}</span>
            <span className="text-xs opacity-70">Vol: {s.volume}x</span>
          </div>
          {prefs.bgAudioSoundId === s.id && <Icon name="Check" className="text-teal" size={16} />}
        </button>
      ))}
    </div>
  ));

  const renderLaporanContent = () => (
    <>{reportStatus === 'success' ? (
      <div className="py-8 text-center text-teal font-bold flex flex-col items-center gap-3">
        <Icon name="Check" size={40} />
        Laporan berhasil dikirim
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        <p className="text-sm opacity-70">Beri tahu kami apa yang salah dengan cerita ini.</p>
        <textarea 
          rows={4} 
          className={cn("w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-teal resize-none", themeClasses.navBg, themeClasses.border, themeClasses.textMain)}
          placeholder="Jelaskan alasannya..."
          value={reportReason}
          onChange={e => setReportReason(e.target.value)}
        />
        <Button variant="primary" className="!bg-red-500 hover:!bg-red-600 !border-red-500 text-white w-full" onClick={submitReport} disabled={!reportReason.trim() || reportStatus === 'submitting'}>
          {reportStatus === 'submitting' ? 'Mengirim...' : 'Kirim Laporan'}
        </Button>
      </div>
    )}</>
  );

  const renderUsiaContent = () => (
    <div className="flex flex-col gap-6">
      <p className="text-sm opacity-70">Sesuaikan bahasa dan penyajian cerita agar cocok dengan usia anak.</p>
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
  );

  if (!isOpen) return null;

  if (isDesktop) {
    return (
      <div ref={menuRef} className={cn("absolute top-full right-0 mt-2 rounded-2xl shadow-xl border z-50 p-6 min-w-[320px]", themeClasses.surface, themeClasses.border)}>
        {view === 'main' && renderMainView()}
        {view === 'suasana' && renderSuasanaView()}
        {view === 'laporan' && wrapView('Laporkan Cerita', renderLaporanContent())}
        {view === 'usia' && wrapView('Sesuaikan Usia', renderUsiaContent())}
      </div>
    );
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} hideCloseButton>
      <div className={cn("rounded-t-3xl p-6 pt-8 min-h-[50vh]", themeClasses.surface)}>
        {view === 'main' && renderMainView()}
        {view === 'suasana' && renderSuasanaView()}
        {view === 'laporan' && wrapView('Laporkan Cerita', renderLaporanContent())}
        {view === 'usia' && wrapView('Sesuaikan Usia', renderUsiaContent())}
      </div>
    </Sheet>
  );
};
