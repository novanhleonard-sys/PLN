import { useState } from 'react';
import { cn } from '../../utils/cn';


export function ProgressBar({ progress, label, className }: { progress: number, label?: string, className?: string }) {
  const p = Math.max(0, Math.min(100, progress));
  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {label && (
        <div className="flex justify-between items-center text-xs font-nunito font-semibold text-text-muted">
          <span>{label}</span>
          <span>{Math.round(p)}%</span>
        </div>
      )}
      <div className="h-2.5 w-full bg-cream border border-border-light rounded-pill overflow-hidden">
        <div 
          className="h-full bg-teal transition-all duration-300 ease-out rounded-pill" 
          style={{ width: `${p}%` }} 
        />
      </div>
    </div>
  );
}

export function AvatarButton({ initials, imageUrl, onClick, className }: { initials?: string, imageUrl?: string, onClick?: () => void, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn("w-11 h-11 rounded-full overflow-hidden bg-cream border-2 border-white shadow-sm flex items-center justify-center text-teal font-fredoka font-medium active:scale-95 transition-transform", className)}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span>{initials?.substring(0, 2).toUpperCase() || 'U'}</span>
      )}
    </button>
  );
}

export function MapStyleToggle({ isPainting, onChange, className }: { isPainting: boolean, onChange: (val: boolean) => void, className?: string }) {
  return (
    <button
      onClick={() => onChange(!isPainting)}
      className={cn(
        "w-14 h-14 rounded-2xl bg-white border border-border-light shadow-warm flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform overflow-hidden relative",
        className
      )}
    >
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-teal to-ocean pointer-events-none" />
      <span className="text-[10px] font-fredoka text-teal relative z-10">{isPainting ? 'Kartun' : 'Lukisan'}</span>
    </button>
  );
}

export function MapPin({ type, title, imageUrl, onClick, className }: { 
  type: 'legenda' | 'mite' | 'fabel' | 'dongeng', 
  title?: string, 
  imageUrl?: string,
  onClick?: () => void,
  className?: string 
}) {
  const [imgError, setImgError] = useState(false);

  const bgColors = {
    legenda: "bg-story-legenda",
    mite: "bg-story-mite",
    fabel: "bg-story-fabel",
    dongeng: "bg-story-dongeng",
  };

  return (
    <button 
      onClick={onClick}
      className={cn("group flex flex-col items-center cursor-pointer active:scale-95 transition-transform focus:outline-none origin-bottom relative", className)}
    >
      <div className="relative flex flex-col items-center pb-[3px]">
        {/* The Teardrop Pin - 50% 50% 50% 0 rotated -45deg creates Google Maps pin shape */}
        <div 
          className={cn(
            "relative w-[24px] h-[24px] rounded-[50%_50%_50%_0] -rotate-45 shadow-warm flex items-center justify-center p-[2px]",
            bgColors[type]
          )}
        >
          {/* Inner Circle (Image or Fallback) */}
          <div className="w-full h-full rounded-full overflow-hidden rotate-45 relative">
            {imageUrl && !imgError ? (
              <img 
                src={imageUrl} 
                alt={title || "Pin"} 
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-black/20" />
            )}
          </div>
        </div>
        
        {/* Shadow cast on map - placed precisely under the pin point */}
        <div className="absolute bottom-0 w-6 h-1.5 bg-[#2E2A26]/30 rounded-full blur-[2px]" />
      </div>
      
      {/* Title label */}
      {title && (
        <span className={cn(
          "px-2.5 py-0.5 rounded-md text-[11px] font-fredoka font-medium text-white shadow-sm mt-0.5",
          bgColors[type]
        )}>
          {title}
        </span>
      )}
    </button>
  );
}
