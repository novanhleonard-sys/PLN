import { cn } from '../../utils/cn';
import { Icon } from './Icon';

export interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  label?: string;
  className?: string;
}

export function Stepper({ value, min = 0, max = 100, onChange, label, className }: StepperProps) {
  return (
    <div className={cn("inline-flex items-center bg-cream border border-border-light rounded-pill p-1 shadow-sm", className)}>
      <button 
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Kurangi"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-teal disabled:opacity-50 active:scale-95 transition-transform shadow-sm"
      >
        <Icon name="Minus" size={20} />
      </button>
      
      <div className="flex items-baseline justify-center px-4 min-w-[64px]">
        <span className="text-2xl font-fredoka text-teal leading-none">{value}</span>
        {label && <span className="text-sm font-fredoka text-text-muted ml-1 leading-none">{label}</span>}
      </div>

      <button 
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Tambah"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-teal disabled:opacity-50 active:scale-95 transition-transform shadow-sm"
      >
        <Icon name="Plus" size={20} />
      </button>
    </div>
  );
}
