import React, { useState, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../../ui/basic/Icon';
import { Button } from '../../../ui/basic/Button';

interface ReaderProcessingStateProps {
  title: string;
  subtitles: string[];
  mode?: 'adapt' | 'translate';
  themeClasses: { textMain: string; textMuted: string; surface: string; bg?: string };
  onCancel?: () => void;
}

export const ReaderProcessingState: React.FC<ReaderProcessingStateProps> = ({ 
  title, 
  subtitles, 
  mode = 'adapt',
  themeClasses, 
  onCancel 
}) => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (!subtitles || subtitles.length === 0) return;
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % subtitles.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [subtitles]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col p-6 md:p-10 transition-all duration-300 pointer-events-auto">
      {/* Container max-w matching text column, slightly elevated from center */}
      <div className="w-full max-w-xl mx-auto mt-[10vh] flex flex-col gap-6">
        
        {/* Header section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Icon 
              name={mode === 'adapt' ? 'Sparkles' : 'Languages'} 
              size={18} 
              className={cn("animate-pulse", themeClasses.textMuted)} 
            />
            <h3 className={cn("font-fredoka font-semibold text-lg md:text-xl", themeClasses.textMain)}>
              {title}
            </h3>
          </div>
          
          {subtitles && subtitles.length > 0 && (
            <p className={cn("font-nunito text-base transition-opacity duration-500 min-h-[1.5rem]", themeClasses.textMuted)}>
              {subtitles[msgIdx]}
            </p>
          )}
        </div>

        {/* Skeleton lines with subtle shimmer */}
        <div className={cn("w-full flex flex-col gap-3 mt-4 opacity-40", themeClasses.textMain)}>
          <div className="h-2.5 w-full bg-current rounded-full animate-pulse opacity-20" />
          <div className="h-2.5 w-[85%] bg-current rounded-full animate-pulse opacity-20" style={{ animationDelay: '200ms' }} />
          <div className="h-2.5 w-[65%] bg-current rounded-full animate-pulse opacity-20" style={{ animationDelay: '400ms' }} />
          <div className="h-2.5 w-[90%] bg-current rounded-full animate-pulse opacity-20" style={{ animationDelay: '600ms' }} />
          <div className="h-2.5 w-[40%] bg-current rounded-full animate-pulse opacity-20" style={{ animationDelay: '800ms' }} />
        </div>

        {onCancel && (
          <div className="mt-6">
            <Button 
              variant="secondary" 
              className={cn("text-sm px-5 py-2 h-auto opacity-70 hover:opacity-100 transition-opacity !bg-transparent border", themeClasses.textMain, "border-current")}
              onClick={onCancel}
            >
              Batalkan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
