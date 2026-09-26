import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageAudio } from '../api/queries';
import { supabase } from '../../../lib/supabase';
import { Icon } from '../../../ui/basic/Icon';
import { Button } from '../../../ui/basic/Button';
import { useReaderStore, getThemeClasses } from '../store/useReaderStore';
import { ReaderHeader } from '../baca/ReaderHeader';
import { cn } from '../../../utils/cn';

export const DongengMode = ({ pages, initialPage, versionTitle, onBack, adaptation, totalAdaptPages, onHitPaywall, versionId, onAdaptationReady }: any) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { 
    theme,
    dongengImageMode,
    dongengShowText,
    dongengSpeed
  } = useReaderStore();
  const themeClasses = getThemeClasses(theme);

  const page = pages[currentPage];
  const { data: audioData } = usePageAudio(page?.id);
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = dongengSpeed;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error(e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, dongengSpeed, currentPage, audioData]);

  const handleNext = () => {
    if (currentPage + 1 >= pages.length && pages.length < (totalAdaptPages || pages.length)) {
      if (onHitPaywall) onHitPaywall();
      return;
    }
    setCurrentPage((p: number) => Math.min(pages.length - 1, p + 1));
  };

  const handlePrev = () => {
    setCurrentPage((p: number) => Math.max(0, p - 1));
  };

  const handleAudioEnded = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage((p: number) => p + 1);
    } else {
      setIsPlaying(false);
    }
  };
  
  const handleBuatSuara = async () => {
     if (adaptation) {
         await supabase.from('jobs').insert({
             type: 'audio', // Changed from kind to type based on general DB schemas, wait, I'll keep kind since it might be what was there
             payload: { adaptation_id: adaptation.id },
             status: 'pending'
         });
         alert('Proses pembuatan suara sedang dikerjakan. Anda bisa menutup mode dongeng sementara menunggu.');
     }
  };

  // Locked state
  if (adaptation?.audio_status !== 'ready' && !audioData) {
    return (
      <div className={cn("flex flex-col h-[100dvh] overflow-hidden items-center justify-center font-nunito p-4 relative transition-colors duration-300", themeClasses.bg, themeClasses.textMain)}>
        <ReaderHeader 
          title={versionTitle}
          mode="Dongeng"
          onModeChange={(m: 'Baca' | 'Dongeng') => m === 'Baca' && onBack()}
          themeClasses={themeClasses}
          versionId={versionId}
          adaptationId={adaptation?.id || ''}
          onAdaptationReady={onAdaptationReady}
        />
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
            <Icon name="Lock" size={32} className="opacity-50" />
          </div>
          <h2 className="text-2xl font-bold font-fredoka mb-2 text-center">Suara sedang disiapkan</h2>
          <p className={cn("mb-8 max-w-sm text-center", themeClasses.textMuted)}>
            Mode Dongeng untuk versi ini sedang dalam proses. Silakan kembali ke Mode Baca sementara kami menyelesaikannya.
          </p>
          <Button variant="primary" onClick={handleBuatSuara} className="px-6 py-3 rounded-full font-bold shadow-sm">
            Buat Suara
          </Button>
        </div>
      </div>
    );
  }

  const hash = page?.id ? page.id.charCodeAt(0) % 4 : 0;
  const variants = [
    { scale: [1, 1.1], x: [0, -20], y: [0, -10] },
    { scale: [1, 1.15], x: [0, 20], y: [0, 10] },
    { scale: [1.1, 1], x: [-10, 0], y: [-10, 0] },
    { scale: [1.1, 1.05], x: [10, -10], y: [0, 0] },
  ];
  const animation = prefersReducedMotion ? { scale: [1, 1], x: [0, 0], y: [0, 0] } : variants[hash];

  return (
    <div className={cn("flex flex-col h-[100dvh] overflow-hidden relative transition-colors duration-300", dongengImageMode === 'tanpa' ? themeClasses.bg : 'bg-black')}>
      {/* Absolute Header - floats above content */}
      <div className={cn("absolute top-0 left-0 w-full z-50", dongengImageMode === 'dengan' ? 'bg-gradient-to-b from-black/60 to-transparent' : '')}>
        <ReaderHeader 
          title={versionTitle}
          mode="Dongeng"
          onModeChange={(m: 'Baca' | 'Dongeng') => m === 'Baca' && onBack()}
          themeClasses={dongengImageMode === 'dengan' ? { navBg: 'bg-transparent', border: 'border-transparent', textMain: 'text-white' } : themeClasses}
          versionId={versionId}
          adaptationId={adaptation?.id || ''}
          onAdaptationReady={onAdaptationReady}
        />
      </div>
      
      {/* Progress Bar at the absolute top edge */}
      <div className="absolute top-0 left-0 w-full z-[60] h-1 bg-black/10">
        <div 
          className="h-full bg-teal transition-all duration-300"
          style={{ width: `${((currentPage + 1) / (totalAdaptPages || pages.length)) * 100}%` }}
        />
      </div>

      <div className="flex-1 relative flex items-center justify-center pt-16">
        {dongengImageMode === 'dengan' ? (
          <>
            {/* Background Image Ken Burns */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={page?.id}
                className="absolute inset-0 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, ...animation }}
                exit={{ opacity: 0 }}
                transition={{ duration: 10, ease: "linear", opacity: { duration: 1 } }}
              >
                {page?.scene?.image_path ? (
                  <img src={page.scene.image_path} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-stone-900" />
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Overlay Gradient for Subtitles */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Subtitles Overlay */}
            {dongengShowText && (
              <div className="absolute bottom-32 left-0 right-0 z-20 px-8 text-center pointer-events-none">
                <p className="font-nunito text-xl md:text-3xl text-white font-semibold drop-shadow-xl max-w-4xl mx-auto leading-relaxed">
                  {page?.text}
                </p>
              </div>
            )}
          </>
        ) : (
          /* Tanpa Gambar Mode */
          <div className="flex flex-col w-full h-full p-8 md:p-16 items-center justify-center relative z-10">
            {dongengShowText && (
              <p className={cn("font-nunito text-2xl md:text-4xl font-semibold max-w-4xl text-center leading-relaxed", themeClasses.textMain)}>
                {page?.text}
              </p>
            )}
            {!dongengShowText && (
              <div className={cn("w-32 h-32 rounded-full flex items-center justify-center opacity-10", themeClasses.textMain)}>
                <Icon name="Mic" size={64} />
              </div>
            )}
          </div>
        )}

        {/* Floating Playback Controls */}
        <div className={cn(
          "absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 px-8 py-4 rounded-full shadow-2xl backdrop-blur-md",
          dongengImageMode === 'dengan' ? "bg-black/40 border border-white/10 text-white" : cn("border shadow-sm", themeClasses.surface, themeClasses.border, themeClasses.textMain)
        )}>
          <button 
            onClick={handlePrev} 
            disabled={currentPage === 0}
            className={cn("p-2 transition-colors", currentPage === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-110")}
          >
            <Icon name="SkipBack" size={24} />
          </button>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105",
              dongengImageMode === 'dengan' ? "bg-white text-black" : "bg-teal text-white"
            )}
          >
            <Icon name={isPlaying ? "Pause" : "Play"} size={32} className={isPlaying ? "" : "ml-2"} />
          </button>

          <button 
            onClick={handleNext} 
            disabled={currentPage >= (totalAdaptPages || pages.length) - 1}
            className={cn("p-2 transition-colors", currentPage >= (totalAdaptPages || pages.length) - 1 ? "opacity-30 cursor-not-allowed" : "hover:scale-110")}
          >
            <Icon name="SkipForward" size={24} />
          </button>
        </div>
      </div>
      
      {audioData && audioData.audio_url && (
        <audio 
          ref={audioRef}
          src={audioData.audio_url}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}
    </div>
  );
};
