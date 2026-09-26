import React, { useState, useRef, useEffect, useMemo } from 'react';
import { usePageAudio } from '../api/queries';
import { Icon } from '../../../ui/basic/Icon';
import { ProgressBar } from '../../../ui/basic/Misc';
import { useComputedPrefs, getThemeClasses, getFontSizeClass } from '../store/useReaderStore';
import { ReaderHeader } from '../baca/ReaderHeader';
import { cn } from '../../../utils/cn';

interface DongengModeProps {
  pages: any[];
  initialPage: number;
  versionTitle: string;
  onBack: () => void;
    totalAdaptPages: number;
  onHitPaywall: () => void;
  versionId: string;
  storyId: string;
  onAdaptationReady: (id: string) => void;
}

export const DongengMode: React.FC<DongengModeProps> = ({ 
  pages, initialPage, versionTitle, onBack, totalAdaptPages, onHitPaywall, versionId, storyId, onAdaptationReady
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const page = pages[currentPage];
  const { data: audioData, isLoading: isLoadingAudio } = usePageAudio(page?.id);

  const prefs = useComputedPrefs();
  const themeClasses = getThemeClasses(prefs.theme);
  const fontClass = getFontSizeClass(prefs.fontSizeDongeng);

  // Fallback text splitting for subtitles
  const textChunks = useMemo(() => {
    if (!page?.text) return [];
    const sentences = page.text.match(/[^.!?]+[.!?]+/g) || [page.text];
    const chunks = [];
    let currentChunk = "";
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > 120) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += " " + sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks.length > 0 ? chunks : [page.text];
  }, [page?.text]);

  const activeChunkIndex = useMemo(() => {
    if (duration === 0 || textChunks.length === 0) return 0;
    const ratio = currentTime / duration;
    return Math.min(textChunks.length - 1, Math.floor(ratio * textChunks.length));
  }, [currentTime, duration, textChunks]);

  useEffect(() => {
    if (audioData?.audio_url) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = audioData.audio_url;
        audioRef.current.playbackRate = prefs.dongengSpeed;
        audioRef.current.load();
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        const audio = new Audio(audioData.audio_url);
        audio.playbackRate = prefs.dongengSpeed;
        audioRef.current = audio;
        
        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime);
          setProgress((audio.currentTime / (audio.duration || 1)) * 100);
        });
        
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
        });
        
        audio.addEventListener('ended', () => {
          handleNext();
        });
        
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioData, currentPage]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = prefs.dongengSpeed;
    }
  }, [prefs.dongengSpeed]);

  const handleNext = () => {
    if (currentPage + 1 >= pages.length && pages.length < totalAdaptPages) {
      onHitPaywall();
      return;
    }
    if (currentPage + 1 < pages.length) {
      setCurrentPage(p => p + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={cn("flex flex-col h-[100dvh] overflow-hidden relative transition-colors duration-300", themeClasses.bg)}>
      <div className="absolute top-0 left-0 w-full z-50">
        <ProgressBar progress={((currentPage + 1) / totalAdaptPages) * 100} />
      </div>
      
      <ReaderHeader 
        title={versionTitle}
        mode="Dongeng"
        onModeChange={(m: any) => { if (m === 'Baca') onBack(); }}
        themeClasses={themeClasses}
        versionId={versionId}
                storyId={storyId}
        onAdaptationReady={onAdaptationReady}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {prefs.dongengImageMode === 'dengan' && page.scene?.image_status === 'ready' && page.scene.image_path ? (
          <img 
            src={page.scene.image_path} 
            alt="Ilustrasi"
            className={cn("absolute inset-0 w-full h-full object-cover transition-all duration-500", themeClasses.imageFilter)}
          />
        ) : (
          <div className="absolute inset-0 bg-stone-900 flex items-center justify-center">
            {prefs.dongengImageMode === 'dengan' && (
              <span className="text-stone-500 font-nunito opacity-50">Ilustrasi sedang disiapkan</span>
            )}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 flex flex-col justify-end p-6 md:p-12 pb-32">
          {prefs.dongengShowText && (
             <div className="max-w-3xl mx-auto w-full text-center min-h-[120px] flex items-center justify-center">
                {isLoadingAudio ? (
                  <p className="text-white/70 font-nunito italic animate-pulse">Memuat narasi...</p>
                ) : !audioData?.audio_url ? (
                  <p className="text-white/70 font-nunito italic">Audio narasi belum tersedia untuk halaman ini.</p>
                ) : (
                  <p className={cn("text-white whitespace-pre-wrap font-semibold drop-shadow-md", fontClass)}>
                    {textChunks[activeChunkIndex]}
                  </p>
                )}
             </div>
          )}
        </div>
      </main>
      
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 bg-gradient-to-t from-black to-transparent">
        <div className="max-w-xl mx-auto bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <span className="text-xs font-nunito text-white/70 font-mono w-10 text-right">{formatTime(currentTime)}</span>
             <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden relative cursor-pointer"
               onClick={(e) => {
                 if (!audioRef.current || !duration) return;
                 const rect = e.currentTarget.getBoundingClientRect();
                 const pos = (e.clientX - rect.left) / rect.width;
                 audioRef.current.currentTime = pos * duration;
               }}
             >
               <div className="absolute top-0 left-0 h-full bg-teal transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
             </div>
             <span className="text-xs font-nunito text-white/70 font-mono w-10">{formatTime(duration)}</span>
          </div>
          
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <Icon name="SkipBack" size={24} />
            </button>
            
            <button 
              onClick={togglePlay}
              disabled={isLoadingAudio || !audioData?.audio_url}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-teal text-white hover:bg-teal-light hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg"
            >
              <Icon name={isPlaying ? "Pause" : "Play"} size={32} className={isPlaying ? "" : "ml-1"} />
            </button>
            
            <button 
              onClick={handleNext}
              disabled={currentPage === pages.length - 1 && pages.length === totalAdaptPages}
              className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <Icon name="SkipForward" size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
