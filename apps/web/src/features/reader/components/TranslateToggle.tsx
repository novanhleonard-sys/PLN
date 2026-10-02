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
        "relative w-[48px] h-8 rounded-full bg-black/5 hover:bg-black/10 transition-all flex items-center overflow-hidden focus:outline-none border border-black/5",
        disabled && "opacity-50 cursor-wait bg-black/10"
      )}
      aria-label={`Switch language. Current: ${isEn ? 'English' : 'Indonesian'}`}
    >
      <div className="absolute inset-0 flex items-center px-1">
        <div className="relative w-full h-6">
          
          {/* Indonesian Flag */}
          <div 
            className={cn(
              "absolute top-0 left-0 w-6 h-6 rounded-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm border border-black/10 origin-center",
              isEn ? "scale-75 opacity-60 translate-x-[16px] z-0" : "scale-100 opacity-100 translate-x-0 z-10",
              disabled && "animate-pulse"
            )}
          >
            <svg viewBox="0 0 300 200" className="w-full h-full object-cover">
              <rect width="300" height="100" fill="#FF0000" />
              <rect y="100" width="300" height="100" fill="#FFFFFF" />
            </svg>
          </div>

          {/* UK Flag */}
          <div 
            className={cn(
              "absolute top-0 right-0 w-6 h-6 rounded-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm border border-black/10 origin-center",
              isEn ? "scale-100 opacity-100 translate-x-0 z-10" : "scale-75 opacity-60 translate-x-[-14px] z-0",
              disabled && "animate-pulse"
            )}
          >
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
      </div>
    </button>
  );
};
