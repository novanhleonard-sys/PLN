import { Button } from '../../../ui/basic/Button';
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
      <Button variant="text" size="sm" onClick={onViewOriginal} className="!text-teal/80 hover:!text-teal !px-2 !h-auto underline">Baca versi asli</Button>
    </div>
  );
};
