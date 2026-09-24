import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStoryVersions, usePages } from '../features/reader/api/queries';

export const Baca: React.FC = () => {
  const { versionId } = useParams<{ versionId: string }>();
  const { data: versionData, isLoading: isLoadingVersion } = useStoryVersions(versionId || '');
  
  const [selectedAdaptation, setSelectedAdaptation] = useState<string | null>(null);
  
  useEffect(() => {
    if (versionData?.adaptations && !selectedAdaptation) {
      const asli = versionData.adaptations.find((a: any) => a.age_band === 'asli');
      if (asli) setSelectedAdaptation(asli.id);
      else setSelectedAdaptation(versionData.adaptations[0]?.id);
    }
  }, [versionData, selectedAdaptation]);

  const { data: pages, isLoading: isLoadingPages } = usePages(selectedAdaptation || '');
  const [currentPage, setCurrentPage] = useState(0);

  if (isLoadingVersion || isLoadingPages) {
    return <div className="flex items-center justify-center h-screen bg-[#FDF9F1] font-nunito text-stone-600">Memuat cerita...</div>;
  }

  if (!versionData || !pages || pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FDF9F1] font-nunito text-stone-600">
        <h2 className="text-2xl font-bold font-fredoka text-stone-800 mb-4">Cerita tidak ditemukan</h2>
        <Link to="/" className="px-4 py-2 bg-stone-800 text-stone-100 rounded-full">Kembali ke Peta</Link>
      </div>
    );
  }

  const page = pages[currentPage];
  
  return (
    <div className="flex flex-col h-[100dvh] bg-[#FDF9F1] overflow-hidden">
      {/* Header */}
      <header className="flex-none p-4 flex items-center justify-between border-b border-stone-200/50">
        <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-200 text-stone-600 hover:bg-stone-300">
          &larr;
        </Link>
        <h1 className="font-fredoka text-lg font-semibold text-stone-800">
          {versionData.version.story.title}
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </header>
      
      {/* Content layout: landscape >= 768 and aspect ratio > 1 = 2 columns, otherwise top-bottom */}
      <main className="flex-1 flex flex-col sm:max-[768px]:flex-col md:max-h-full min-[768px]:portrait:flex-col min-[768px]:landscape:flex-row overflow-hidden relative">
        {/* Visual / Image Area */}
        <div className="flex-1 relative flex items-center justify-center bg-stone-100 min-h-[30vh]">
          {page.scene?.status === 'ready' && page.scene.image_path ? (
            <img src={page.scene.image_path} alt={page.visual_prompt || 'Ilustrasi cerita'} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-200/50">
              <span className="text-sm font-nunito text-stone-500 mb-2">Ilustrasi sedang dibuat</span>
              {/* Fallback based on storyType could go here */}
            </div>
          )}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur text-white/90 text-xs rounded-md">
            Dibuat AI
          </div>
        </div>
        
        {/* Text Area */}
        <div className="flex-1 flex flex-col min-h-[30vh]">
          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex items-center">
            <p className="font-nunito text-lg md:text-xl text-stone-800 leading-relaxed max-w-2xl mx-auto w-full">
              {page.text}
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex-none p-4 flex items-center justify-between border-t border-stone-200/50 bg-[#FDF9F1]">
            <button 
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              className="px-6 py-3 rounded-full bg-stone-200 text-stone-700 font-semibold disabled:opacity-50"
            >
              Sebelahnya
            </button>
            <div className="font-nunito text-sm text-stone-500 font-medium">
              {currentPage + 1} / {pages.length}
            </div>
            <button 
              disabled={currentPage === pages.length - 1}
              onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
              className="px-6 py-3 rounded-full bg-stone-800 text-stone-100 font-semibold disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </main>
      
      {/* Progress bar */}
      <div className="h-1 bg-stone-200 w-full absolute top-0 left-0 z-50">
        <div 
          className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
