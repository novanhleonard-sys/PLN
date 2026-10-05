import React from 'react';
import { cn } from '../../../utils/cn';

interface TranslateToggleProps {
  language: 'id' | 'en';
  onChange: (lang: 'id' | 'en') => void;
  disabled?: boolean;
}

export const TranslateToggle: React.FC<TranslateToggleProps> = ({ language, onChange, disabled }) => {
  const isEn = language === 'en';

  return (
    <button
      onClick={() => !disabled && onChange(isEn ? 'id' : 'en')}
      disabled={disabled}
      className={cn(
        "relative w-11 h-11 rounded-full hover:bg-black/5 transition-all flex items-center justify-center focus:outline-none shrink-0",
        disabled && "opacity-50 cursor-wait"
      )}
      aria-label={`Switch language. Current: ${isEn ? 'English' : 'Indonesian'}`}
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        
        {/* Indonesian Flag */}
        <div 
          className={cn(
            "absolute w-7 h-7 rounded-[0.5rem] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md border border-stone-500/30 origin-center",
            isEn 
              ? "z-0 -rotate-[8deg] -translate-x-1.5 -translate-y-1.5 scale-90 opacity-70" 
              : "z-10 rotate-[6deg] translate-x-1 translate-y-1 scale-100 opacity-100",
            disabled && "animate-pulse"
          )}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <rect width="100" height="50" fill="#FF0000" />
            <rect y="50" width="100" height="50" fill="#FFFFFF" />
          </svg>
        </div>

        {/* UK Flag */}
        <div 
          className={cn(
            "absolute w-7 h-7 rounded-[0.5rem] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md border border-stone-500/30 origin-center",
            isEn 
              ? "z-10 rotate-[6deg] translate-x-1 translate-y-1 scale-100 opacity-100" 
              : "z-0 -rotate-[8deg] -translate-x-1.5 -translate-y-1.5 scale-90 opacity-70",
            disabled && "animate-pulse"
          )}
        >
          <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
            <clipPath id="uk-s">
              <path d="M0,0 v30 h60 v-30 z" />
            </clipPath>
            <clipPath id="uk-t">
              <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
            </clipPath>
            <g clipPath="url(#uk-s)">
              <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
              <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
              <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-t)" stroke="#C8102E" strokeWidth="4" />
              <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
              <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
            </g>
          </svg>
        </div>
        
      </div>
    </button>
  );
};
