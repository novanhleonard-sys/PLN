import React, { useState, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../../ui/basic/Icon';

interface AdaptationLoadingShimmerProps {
  band: string;
  themeClasses: { textMain: string; textMuted: string; surface: string };
  onCancel?: () => void;
}

const MESSAGES = [
  "Menyesuaikan bahasa...",
  "Menjaga alur cerita...",
  "Mempertahankan unsur budaya...",
  "Menyelaraskan tingkat kesulitan..."
];

import { Button } from '../../../ui/basic/Button';
export const AdaptationLoadingShimmer: React.FC<AdaptationLoadingShimmerProps> = ({ band, themeClasses, onCancel }) => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className={cn("flex flex-col items-center gap-4 text-center p-8 rounded-3xl shadow-xl max-w-sm", themeClasses.surface)}>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <Icon name="Sparkles" size={32} className="text-teal animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-teal border-t-transparent animate-spin opacity-50" />
        </div>
        
        <div>
          <h3 className={cn("font-fredoka font-bold text-lg", themeClasses.textMain)}>
            Menyesuaikan cerita untuk usia {band} tahun
          </h3>
          <p className={cn("font-nunito text-sm mt-1 animate-pulse min-h-[1.5rem]", themeClasses.textMuted)}>
            {MESSAGES[msgIdx]}
          </p>
        </div>
        
        {/* Skeleton lines to simulate text rebuilding */}
        <div className="w-full flex flex-col gap-2 mt-4 opacity-40">
          <div className="h-2 w-full bg-stone-300 dark:bg-stone-600 rounded animate-pulse" />
          <div className="h-2 w-5/6 bg-stone-300 dark:bg-stone-600 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-4/6 bg-stone-300 dark:bg-stone-600 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        {onCancel && (
          <div className="mt-6 w-full">
            <Button variant="secondary" className="w-full" onClick={onCancel}>Batalkan</Button>
          </div>
        )}
      </div>
    </div>
  );
};

