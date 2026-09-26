import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStoryVersions, usePages, useReadHistory } from '../api/queries';
import { useAuth } from '../../auth/AuthStore';
import { supabase } from '../../../lib/supabase';
import { useMediaQuery } from '../../../utils/useMediaQuery';
import { GateModal } from '../../auth/GateModal';
import { ProgressBar } from '../../../ui/basic/Misc';
import { DongengMode } from '../dongeng/DongengMode';
import { Button } from '../../../ui/basic/Button';
import { AdaptationBanner } from '../adapt/AdaptationBanner';
import { useReadSessionTracker } from '../../analytics/useReadSessionTracker';
import { useReaderStore, getThemeClasses } from '../store/useReaderStore';
import { ReaderHeader } from './ReaderHeader';
import { cn } from '../../../utils/cn';

export const Baca: React.FC = () => {
  const { versionId } = useParams<{ versionId: string }>();
  const { data: versionData, isLoading: isLoadingVersion } = useStoryVersions(versionId || '');
  const { data: readHistory } = useReadHistory(versionId || '');
  const { user } = useAuth();
  
  const [selectedAdaptation, setSelectedAdaptation] = useState<string | null>(null);
  const [mode, setMode] = useState<'Baca' | 'Dongeng'>('Baca');
  const [gateOpen, setGateOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  // Versions view (if user hits a link that has multiple bands and no history)
  const [showVersions, setShowVersions] = useState(false);

  // Store 
  const { theme, fontSize } = useReaderStore();
  const themeClasses = getThemeClasses(theme);

  useEffect(() => {
    if (versionData?.adaptations && !selectedAdaptation) {
      if (readHistory && readHistory.adaptation_id) {
        setSelectedAdaptation(readHistory.adaptation_id);
        setCurrentPage(Math.max(0, readHistory.last_page_idx - 1));
      } else if (versionData.adaptations.length > 1) {
        setShowVersions(true);
      } else {
        const asli = versionData.adaptations.find(a => a.age_band === 'asli') || versionData.adaptations[0];
        if (asli) setSelectedAdaptation(asli.id);
      }
    }
  }, [versionData, selectedAdaptation, readHistory]);

  const { data: pages, isLoading: isLoadingPages } = usePages(selectedAdaptation || '');

  const isCompleted = pages && pages.length > 0 && currentPage >= pages.length - 1;
  useReadSessionTracker(versionData?.version?.story_id, versionId, selectedAdaptation || undefined, mode, isCompleted);

  // Read History Debounce Upsert
  useEffect(() => {
    if (!user || !selectedAdaptation || !pages || pages.length === 0) return;
    
    const pageId = pages[currentPage]?.id;
    if (!pageId) return;
    
    const timer = setTimeout(() => {
      supabase.from('read_history').upsert({
        user_id: user.id,
        story_id: versionData!.version.story_id,
        version_id: versionId!,
        adaptation_id: selectedAdaptation,
        last_page_id: pageId,
        last_page_idx: currentPage + 1
      }).then();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [currentPage, user, selectedAdaptation, versionData, versionId, pages]);

  if (isLoadingVersion || (selectedAdaptation && isLoadingPages)) {
    return <div className={cn("flex items-center justify-center h-screen font-nunito", themeClasses.bg, themeClasses.textMuted)}>Memuat cerita...</div>;
  }

  if (!versionData) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-screen font-nunito", themeClasses.bg)}>
        <h2 className={cn("text-2xl font-bold font-fredoka mb-4", themeClasses.textMain)}>Cerita tidak ditemukan</h2>
        <Link to="/" className="px-4 py-2 bg-stone-800 text-stone-100 rounded-full">Kembali ke Peta</Link>
      </div>
    );
  }
  
  if (showVersions) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-screen font-nunito p-4", themeClasses.bg)}>
        <h2 className={cn("text-2xl font-bold font-fredoka mb-8", themeClasses.textMain)}>Pilih Versi Bacaan</h2>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {versionData.adaptations.map(ad => (
            <button 
              key={ad.id}
              onClick={() => {
                setSelectedAdaptation(ad.id);
                setShowVersions(false);
              }}
              className={cn("px-6 py-4 border-2 rounded-xl font-bold transition-colors hover:border-teal", themeClasses.surface, themeClasses.border, themeClasses.textMain)}
            >
              Versi {ad.age_band}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!pages || pages.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-screen font-nunito", themeClasses.bg)}>
        <h2 className={cn("text-xl", themeClasses.textMuted)}>Halaman belum tersedia.</h2>
        <Link to="/" className="mt-4 px-4 py-2 bg-stone-800 text-stone-100 rounded-full">Kembali</Link>
      </div>
    );
  }

  const page = pages[currentPage];
  if (!page) return null;
  
  const currentAdapt = versionData.adaptations.find(a => a.id === selectedAdaptation);
  const totalAdaptPages = currentAdapt?.total_pages || pages.length; 
  
  const handleNext = () => {
    if (currentPage + 1 >= pages.length && pages.length < totalAdaptPages) {
      setGateOpen(true);
      return;
    }
    setCurrentPage((p: number) => Math.min(pages.length - 1, p + 1));
  };

  const handleModeChange = (newMode: 'Baca' | 'Dongeng') => {
    if (newMode === 'Dongeng' && !user) {
      setGateOpen(true);
      return;
    }
    setMode(newMode);
  };

  const fontSizeClass = fontSize === 'small' ? (isDesktop ? 'text-[18px]' : 'text-[16px]') :
                        fontSize === 'large' ? (isDesktop ? 'text-[24px]' : 'text-[22px]') :
                        (isDesktop ? 'text-[20px]' : 'text-[18px]');

  if (mode === 'Dongeng') {
    return (
      <DongengMode 
        pages={pages} 
        initialPage={currentPage} 
        versionTitle={versionData.version.story.title} 
        onBack={() => setMode('Baca')} 
        adaptation={currentAdapt} 
        totalAdaptPages={totalAdaptPages} 
        onHitPaywall={() => setGateOpen(true)} 
                versionId={versionId!}
        onAdaptationReady={setSelectedAdaptation}
      />
    );
  }
  
  return (
    <div className={cn("flex flex-col h-[100dvh] overflow-hidden relative transition-colors duration-300", themeClasses.bg)}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full z-50">
        <ProgressBar progress={((currentPage + 1) / totalAdaptPages) * 100} />
      </div>

      <ReaderHeader 
        title={versionData.version.story.title}
        mode={mode}
        onModeChange={handleModeChange}
        themeClasses={themeClasses}
        
        versionId={versionId!}
        adaptationId={selectedAdaptation || ''}
        onAdaptationReady={(id) => { setSelectedAdaptation(id); setCurrentPage(0); }}
      />
      
      {currentAdapt?.age_band && currentAdapt.age_band !== 'asli' && (
        <AdaptationBanner 
          band={currentAdapt.age_band} 
          onViewOriginal={() => {
             const asli = versionData.adaptations.find(a => a.age_band === 'asli') || versionData.adaptations[0];
             if (asli) setSelectedAdaptation(asli.id);
          }} 
        />
      )}
      
      <main className="flex-1 flex flex-col sm:max-[768px]:flex-col md:max-h-[calc(100vh-4rem)] min-[768px]:portrait:flex-col min-[768px]:landscape:flex-row overflow-hidden relative">
        {/* Visual / Image Area */}
        <div className="flex-1 relative flex items-center justify-center bg-black/5 min-h-[30vh]">
          {page.scene?.image_status === 'ready' && page.scene.image_path ? (
            <img 
              src={page.scene.image_path} 
              alt={page.scene.description || 'Ilustrasi cerita'} 
              loading="lazy" 
              className={cn("w-full h-full object-cover transition-all duration-500", themeClasses.imageFilter)} 
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                <img src={`/assets/fallback_bg_${(versionData.version.story.id.charCodeAt(0) % 5) + 1}.svg`} alt="Sedang disiapkan" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply" />
                <span className="text-sm font-nunito text-stone-500 mb-2 relative z-10 bg-white/80 px-3 py-1 rounded-full">Ilustrasi sedang disiapkan</span>
              </div>
          )}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur text-white/90 text-xs rounded-md font-nunito font-semibold">
            Dibuat AI
          </div>
        </div>
        
        {/* Text Area */}
        <div className={cn("flex-1 flex flex-col min-h-[30vh] transition-colors duration-300", themeClasses.surface)}>
          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex items-center relative">
            <p className={cn("font-nunito leading-relaxed max-w-2xl mx-auto w-full transition-all duration-300", fontSizeClass, themeClasses.textMain)}>
              {page.text}
            </p>
          </div>
          
          {/* Controls */}
          <div className={cn("flex-none p-4 flex items-center justify-between border-t transition-colors duration-300", themeClasses.navBg, themeClasses.border)}>
            <Button variant="secondary" className="!bg-black/5 !border-transparent hover:!bg-black/10 text-inherit" disabled={currentPage === 0} onClick={() => setCurrentPage((p: number) => Math.max(0, p - 1))}>Sebelumnya</Button>
            <div className={cn("font-nunito text-sm font-bold", themeClasses.textMuted)}>
              {currentPage + 1} / {totalAdaptPages}
            </div>
            <Button variant="primary" disabled={currentPage === pages.length - 1 && pages.length === totalAdaptPages} onClick={handleNext}>Selanjutnya</Button>
          </div>
        </div>
      </main>
      
      <GateModal 
        isOpen={gateOpen} 
        onClose={() => setGateOpen(false)}
        message="Daftar atau masuk untuk membaca seluruh cerita ini."
      />
    </div>
  );
};
