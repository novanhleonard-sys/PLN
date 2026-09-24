import React from 'react';

interface Props {
  band: string;
  onViewOriginal: () => void;
}

export const AdaptationBanner: React.FC<Props> = ({ band, onViewOriginal }) => {
  if (!band || band === 'asli') return null;
  
  return (
    <div className="bg-ocean/30 px-4 py-2 border-b border-teal/10 flex items-center justify-center gap-2 text-sm z-10 relative">
      <span className="text-teal font-semibold">Disesuaikan untuk usia {band} tahun (dibuat AI)</span>
      <button onClick={onViewOriginal} className="text-teal/80 underline underline-offset-2 ml-2 hover:text-teal">
        Lihat versi asli
      </button>
    </div>
  );
};
