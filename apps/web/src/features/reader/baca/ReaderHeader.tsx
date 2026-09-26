import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SegmentedControl } from '../../../ui/basic/SegmentedControl';
import { Icon } from '../../../ui/basic/Icon';
import { ReaderMenu } from './ReaderMenu';
import { cn } from '../../../utils/cn';

interface ReaderHeaderProps {
  title: string;
  mode: 'Baca' | 'Dongeng';
  onModeChange: (mode: 'Baca' | 'Dongeng') => void;
  themeClasses: { navBg: string; border: string; textMain: string };
  versionId: string;
  storyId: string;
    onAdaptationReady: (id: string) => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  title, mode, onModeChange, themeClasses, versionId, storyId, onAdaptationReady
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <header className={cn(
      "flex-none h-16 px-4 flex items-center justify-between border-b relative z-30 transition-colors duration-300",
      themeClasses.navBg, themeClasses.border
    )}>
      <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
        <Link 
          to="/" 
          aria-label="Kembali ke Beranda" 
          className={cn(
            "w-9 h-9 shrink-0 flex items-center justify-center rounded-full transition-colors",
            "bg-black/5 hover:bg-black/10",
            themeClasses.textMain
          )}
        >
          <Icon name="ArrowLeft" size={20} />
        </Link>
        <h1 className={cn("font-fredoka text-base md:text-xl font-bold truncate", themeClasses.textMain)}>
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <div className="scale-90 md:scale-100 origin-right">
          <SegmentedControl 
            options={['Baca', 'Dongeng']} 
            value={mode} 
            onChange={(m) => onModeChange(m as 'Baca' | 'Dongeng')} 
          />
        </div>
        
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-colors",
              isMenuOpen ? "bg-black/10" : "bg-black/5 hover:bg-black/10",
              themeClasses.textMain
            )}
          >
            <Icon name="Ellipsis" size={20} />
          </button>
          
          <ReaderMenu 
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            mode={mode}
            
            versionId={versionId}
            
            storyId={storyId}
            onAdaptationReady={onAdaptationReady}
          />
        </div>
      </div>
    </header>
  );
};
