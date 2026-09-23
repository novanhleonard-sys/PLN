import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div className={cn("inline-flex p-1 bg-cream border border-border-light rounded-pill relative", className)}>
      {options.map((opt) => {
        const isSelected = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "relative z-10 flex-1 px-6 h-10 rounded-pill text-sm font-fredoka transition-colors",
              isSelected ? "text-white" : "text-text-muted hover:text-text-main"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={`segmented-bg-${options.join('')}`}
                className="absolute inset-0 bg-teal rounded-pill shadow-sm -z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            {opt}
          </button>
        );
      })}
    </div>
  );
}
