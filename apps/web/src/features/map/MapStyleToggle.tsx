import React from 'react';

interface Props {
  currentStyle: 'A' | 'B';
  onChange: (style: 'A' | 'B') => void;
}

export const MapStyleToggle: React.FC<Props> = ({ currentStyle, onChange }) => {
  const isA = currentStyle === 'A';
  
  return (
    <button 
      onClick={() => onChange(isA ? 'B' : 'A')}
      className="absolute bottom-6 left-6 z-20 w-16 h-16 rounded-xl overflow-hidden shadow-warm border-2 border-white bg-white group transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-teal/30"
      aria-label={`Ubah ke gaya ${isA ? 'Lukisan' : 'Kartun'}`}
    >
      <div className="absolute inset-0 bg-stone-200">
         {isA ? (
           <img src="/assets/fallback_bg_3.svg" alt="" loading="lazy" className="w-full h-full object-cover opacity-60 mix-blend-multiply" />
         ) : (
           <div className="w-full h-full bg-[#fff9ec] flex flex-col items-center justify-center">
             <div className="w-full h-1/2 bg-[#d1f4f9]" />
             <div className="w-full h-1/2 bg-[#fff9ec]" />
           </div>
         )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-[10px] font-bold text-white py-0.5 text-center leading-tight">
        {isA ? 'Lukisan' : 'Kartun'}
      </div>
    </button>
  );
};
