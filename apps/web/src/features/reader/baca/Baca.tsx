import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStoryVersions, usePages, useReadHistory } from '../api/queries';
import { useAuth } from '../../auth/AuthStore';
import { supabase } from '../../../lib/supabase';
import { SegmentedControl } from '../../../ui/basic/SegmentedControl';
import { useMediaQuery } from '../../../utils/useMediaQuery';
import { GateModal } from '../../auth/GateModal';
import { ProgressBar } from '../../../ui/basic/Misc';
import { DongengMode } from '../dongeng/DongengMode';
import { ReportButton } from '../../report/ReportButton';
import { AdaptationModal } from '../adapt/AdaptationModal';
import { Button } from '../../../ui/basic/Button';
import { AdaptationBanner } from '../adapt/AdaptationBanner';


export const Baca: React.FC = () => {
  const { versionId } = useParams<{ versionId: string }>();
  const { data: versionData, isLoading: isLoadingVersion } = useStoryVersions(versionId || '');
  const { data: readHistory } = useReadHistory(versionId || '');
  const { user } = useAuth();
  
  const [selectedAdaptation, setSelectedAdaptation] = useState<string | null>(null);
  const [mode, setMode] = useState('Baca');
  const [gateOpen, setGateOpen] = useState(false);
  const [adaptModalOpen, setAdaptModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  // Versions view (S05)
  const [showVersions, setShowVersions] = useState(false);

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
    return <div className="flex items-center justify-center h-screen bg-[#FDF9F1] font-nunito text-text-muted">Memuat cerita...</div>;
  }

  if (!versionData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FDF9F1] font-nunito">
        <h2 className="text-2xl font-bold font-fredoka text-text-main mb-4">Cerita tidak ditemukan</h2>
        <Link to="/" className="px-4 py-2 bg-stone-800 text-stone-100 rounded-full">Kembali ke Peta</Link>
      </div>
    );
  }
  
  if (showVersions) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FDF9F1] font-nunito p-4">
        <h2 className="text-2xl font-bold font-fredoka text-text-main mb-8">Pilih Versi Bacaan</h2>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {versionData.adaptations.map(ad => (
            <button 
              key={ad.id}
              onClick={() => {
                setSelectedAdaptation(ad.id);
                setShowVersions(false);
              }}
              className="px-6 py-4 bg-white border-2 border-border-light rounded-xl font-bold text-text-main hover:border-teal transition-colors"
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
      <div className="flex flex-col items-center justify-center h-screen bg-[#FDF9F1] font-nunito">
        <h2 className="text-xl text-text-muted">Halaman belum tersedia.</h2>
        <Link to="/" className="mt-4 px-4 py-2 bg-stone-800 text-stone-100 rounded-full">Kembali</Link>
      </div>
    );
  }

  const page = pages[currentPage];
  if (!page) return null;
  
  // Gate check (if pages is truncated by RLS)
  const currentAdapt = versionData.adaptations.find(a => a.id === selectedAdaptation);
  const totalAdaptPages = currentAdapt?.total_pages || pages.length; // Fallback to pages.length
  
  const handleNext = () => {
    if (currentPage + 1 >= pages.length && pages.length < totalAdaptPages) {
      setGateOpen(true);
      return;
    }
    setCurrentPage((p: number) => Math.min(pages.length - 1, p + 1));
  };

  const handleModeChange = (newMode: string) => {
    if (newMode === 'Dongeng' && !user) {
      setGateOpen(true);
      return;
    }
    setMode(newMode);
  };

  const fontSize = isDesktop ? 'text-[20px]' : 'text-[18px]';

  if (mode === 'Dongeng') {
    return <DongengMode pages={pages} initialPage={currentPage} versionTitle={versionData.version.story.title} onBack={() => setMode('Baca')} adaptation={currentAdapt} totalAdaptPages={totalAdaptPages} onHitPaywall={() => setGateOpen(true)} />;
  }
  
  return (
    <div className="flex flex-col h-[100dvh] bg-[#FDF9F1] overflow-hidden relative">
      <header className="flex-none p-4 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border-light gap-4 bg-white z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Kembali ke Beranda" className="w-10 h-10 flex items-center justify-center rounded-full bg-cream text-text-main hover:bg-stone-200">
            &larr;
          </Link>
          <h1 className="font-fredoka text-lg md:text-xl font-bold text-text-main line-clamp-1">
              {versionData.version.story.title}
            </h1>
            <ReportButton targetType={selectedAdaptation ? 'adaptation' : 'version'} targetId={selectedAdaptation || versionId || ''} />
        </div>
        <div className="flex items-center gap-4 self-end md:self-auto">
          <Button size="sm" variant="secondary" onClick={() => setAdaptModalOpen(true)} className="!bg-teal/10 !text-teal !border-transparent hover:!bg-teal/20">Sesuaikan</Button>
          <SegmentedControl options={['Baca', 'Dongeng']} value={mode} onChange={handleModeChange} />
        </div>
      </header>
      
      <AdaptationBanner 
        band={currentAdapt?.age_band || 'asli'} 
        onViewOriginal={() => {
           const asli = versionData.adaptations.find(a => a.age_band === 'asli') || versionData.adaptations[0];
           if (asli) setSelectedAdaptation(asli.id);
        }} 
      />
      
      <main className="flex-1 flex flex-col sm:max-[768px]:flex-col md:max-h-full min-[768px]:portrait:flex-col min-[768px]:landscape:flex-row overflow-hidden relative">
        {/* Visual / Image Area */}
        <div className="flex-1 relative flex items-center justify-center bg-stone-100 min-h-[30vh]">
          {page.scene?.image_status === 'ready' && page.scene.image_path ? (
            <img src={page.scene.image_path} alt={page.scene.description || 'Ilustrasi cerita'} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-200/50">
                <img src={`/assets/fallback_bg_${(versionData.version.story.id.charCodeAt(0) % 5) + 1}.svg`} alt="Sedang disiapkan" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply" />
                <span className="text-sm font-nunito text-text-muted mb-2 relative z-10 bg-white/80 px-3 py-1 rounded-full">Ilustrasi sedang disiapkan</span>
              </div>
          )}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur text-white/90 text-xs rounded-md font-nunito font-semibold">
            Dibuat AI
          </div>
        </div>
        
        {/* Text Area */}
        <div className="flex-1 flex flex-col min-h-[30vh] bg-white">
          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex items-center relative">
            <p className={`font-nunito ${fontSize} text-text-main leading-relaxed max-w-2xl mx-auto w-full`}>
              {page.text}
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex-none p-4 flex items-center justify-between border-t border-border-light bg-cream">
            <Button variant="secondary" disabled={currentPage === 0} onClick={() => setCurrentPage((p: number) => Math.max(0, p - 1))}>Sebelumnya</Button>
            <div className="font-nunito text-sm text-text-muted font-bold">
              {currentPage + 1} / {totalAdaptPages}
            </div>
            <Button variant="primary" disabled={currentPage === pages.length - 1 && pages.length === totalAdaptPages} onClick={handleNext}>Selanjutnya</Button>
          </div>
        </div>
      </main>
      
      {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full z-50">
          <ProgressBar progress={((currentPage + 1) / totalAdaptPages) * 100} />
        </div>
        
        <GateModal 
        isOpen={gateOpen} 
        onClose={() => setGateOpen(false)} 
        message="Anda telah mencapai batas halaman gratis untuk sesi ini. Silakan masuk untuk membaca sampai tamat."
      />
      
      <AdaptationModal
        isOpen={adaptModalOpen}
        onClose={() => setAdaptModalOpen(false)}
        versionId={versionId!}
        onAdaptationReady={(id) => setSelectedAdaptation(id)}
      />
    </div>
  );
};






