import React from 'react';
import { cn } from '../../../utils/cn';

interface TranslateToggleProps {
  language: 'id' | 'en';
  onChange: (lang: 'id' | 'en') => void;
}

export const TranslateToggle: React.FC<TranslateToggleProps> = ({ language, onChange }) => {
  const isEn = language === 'en';

  return (
    <button
      onClick={() => onChange(isEn ? 'id' : 'en')}
      className="relative w-[52px] h-8 rounded-full bg-black/10 hover:bg-black/20 transition-colors flex items-center shadow-inner overflow-hidden focus:outline-none"
      aria-label={`Switch language. Current: ${isEn ? 'English' : 'Indonesian'}`}
    >
      <div 
        className={cn(
          "absolute flex items-center justify-between w-[52px] px-1 transition-transform duration-300 ease-in-out",
          isEn ? "translate-x-[-12px]" : "translate-x-[0px]"
        )}
      >
        {/* Indonesian Flag */}
        <div className={cn(
            "w-6 h-6 rounded-full overflow-hidden shrink-0 transition-transform duration-300 shadow-sm border border-black/10",
            isEn ? "scale-75 opacity-50 translate-x-[4px]" : "scale-100 z-10"
        )}>
          <svg viewBox="0 0 300 200" className="w-full h-full object-cover">
            <rect width="300" height="100" fill="#FF0000" />
            <rect y="100" width="300" height="100" fill="#FFFFFF" />
          </svg>
        </div>

        {/* UK Flag */}
        <div className={cn(
            "w-6 h-6 rounded-full overflow-hidden shrink-0 transition-transform duration-300 shadow-sm border border-black/10",
            isEn ? "scale-100 z-10 translate-x-[-8px]" : "scale-75 opacity-50 translate-x-[-12px]"
        )}>
          <svg viewBox="0 0 60 30" className="w-full h-full object-cover">
            <clipPath id="s">
              <path d="M0,0 v30 h60 v-30 z" />
            </clipPath>
            <clipPath id="t">
              <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
            </clipPath>
            <g clipPath="url(#s)">
              <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
              <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
              <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
              <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
              <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
            </g>
          </svg>
        </div>
      </div>
    </button>
  );
};
