import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePageAudio } from '../api/queries';
import { supabase } from '../../../lib/supabase';
import { Icon } from '../../../ui/basic/Icon';

export const DongengMode = ({ pages, initialPage, versionTitle, onBack, adaptation }: any) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const page = pages[currentPage];
  const { data: audioData } = usePageAudio(page?.id);
  
  // Media Query for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error(e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, speed, currentPage, audioData]);

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
             kind: 'audio',
             ref_type: 'adaptation',
             ref_id: adaptation.id,
             idempotency_key: `audio:${adaptation.id}`
         });
         alert('Proses pembuatan suara sedang dikerjakan. Anda bisa menutup mode dongeng sementara menunggu.');
     }
  };

  // S07b Locked state if audio is not ready
  if (adaptation?.audio_status !== 'ready' && !audioData) {
    return (
      <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden items-center justify-center font-nunito p-4 relative">
        <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-white/10 rounded-full hover:bg-white/20">
          &larr; Kembali ke Baca
        </button>
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
          <Icon name="Lock" size={32} className="opacity-70" />
        </div>
        <h2 className="text-2xl font-bold font-fredoka mb-2">Suara sedang disiapkan</h2>
        <p className="text-white/60 mb-8 max-w-sm text-center">
          Mode Dongeng untuk versi ini sedang dalam proses. Silakan kembali ke Mode Baca sementara kami menyelesaikannya.
        </p>
        {adaptation?.age_band !== 'asli' && adaptation?.audio_status === 'none' ? (
          <button onClick={handleBuatSuara} className="px-6 py-3 bg-teal text-white rounded-full font-bold hover:bg-teal/80">
            Buat Suara
          </button>
        ) : (
          <button disabled className="px-6 py-3 bg-white/10 text-white/50 rounded-full font-bold">
            Buat Suara
          </button>
        )}
      </div>
    );
  }

  // Animation variants based on page ID hash (deterministic)
  const hash = page?.id ? page.id.charCodeAt(0) % 4 : 0;
  const variants = [
    { scale: [1, 1.1], x: [0, -20], y: [0, -10] },
    { scale: [1, 1.15], x: [0, 20], y: [0, 10] },
    { scale: [1.1, 1], x: [-10, 0], y: [-10, 0] },
    { scale: [1.1, 1.05], x: [10, -10], y: [0, 0] },
  ];
  
  const animation = prefersReducedMotion ? { scale: [1, 1], x: [0, 0], y: [0, 0] } : variants[hash];

  return (
    <div className="flex flex-col h-[100dvh] bg-black overflow-hidden relative">
      {/* Background Image Ken Burns */}
      {page.scene?.image_path ? (
        <motion.div
          key={page.id}
          className="absolute inset-0 z-0 origin-center"
          initial={{ scale: animation.scale[0], x: animation.x[0], y: animation.y[0] }}
          animate={{ scale: animation.scale[1], x: animation.x[1], y: animation.y[1] }}
          transition={{ duration: 10, ease: "linear" }}
        >
          <img src={page.scene.image_path} alt="" className="w-full h-full object-cover opacity-80" />
        </motion.div>
      ) : (
        <div className="absolute inset-0 z-0 bg-stone-900 flex items-center justify-center">
            <img src={`/assets/fallback_bg_3.svg`} alt="Sedang disiapkan" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <span className="text-white/30 relative z-10">Gambar tidak tersedia</span>
          </div>
      )}

      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
        <button onClick={onBack} className="text-white font-bold font-nunito flex items-center gap-2 drop-shadow-md">
          &larr; <span className="hidden sm:inline">Keluar</span>
        </button>
        <div className="text-white/90 font-fredoka font-bold drop-shadow-md">
          {versionTitle}
        </div>
        <div className="w-10"></div>
      </div>

      {/* Subtitles */}
      {showSubtitles && (
        <div className="absolute bottom-32 left-0 right-0 p-4 z-10 flex justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm px-6 py-4 rounded-2xl max-w-3xl border border-white/10">
            <p className="text-white font-nunito text-lg md:text-xl text-center leading-relaxed drop-shadow-sm">
              {page.text}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-10 flex flex-col items-center">
        <div className="flex items-center gap-6 mb-4">
          <button 
            onClick={() => setSpeed(s => s === 1 ? 1.2 : s === 1.2 ? 0.8 : 1)}
            className="w-12 h-12 flex items-center justify-center text-white/70 font-bold hover:text-white"
          >
            {speed}x
          </button>
          
          <button 
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p: number) => p - 1)}
            aria-label="Sebelumnya"
            className="w-12 h-12 flex items-center justify-center text-white hover:scale-110 transition-transform disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Jeda" : "Putar"}
            className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          
          <button 
            disabled={currentPage === pages.length - 1}
            onClick={() => setCurrentPage((p: number) => p + 1)}
            aria-label="Selanjutnya"
            className="w-12 h-12 flex items-center justify-center text-white hover:scale-110 transition-transform disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
          </button>
          
          <button 
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`w-12 h-12 flex items-center justify-center font-bold text-sm ${showSubtitles ? 'text-white' : 'text-white/30'}`}
          >
            CC
          </button>
        </div>
      </div>
      
      {/* Hidden Audio Element */}
      {audioData?.audio_url && (
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



