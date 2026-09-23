import { cn } from '../../utils/cn';
import { Icon } from './Icon';

export interface ChipProps {
  label: string;
  type?: 'legenda' | 'mite' | 'fabel' | 'dongeng' | 'neutral' | 'region';
  icon?: React.ComponentProps<typeof Icon>['name'];
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ label, type = 'neutral', icon, selected, onClick, className }: ChipProps) {
  const base = "inline-flex items-center justify-center px-4 h-9 rounded-pill text-sm font-nunito font-semibold transition-colors";
  const interactive = onClick ? "cursor-pointer active:scale-95" : "";
  
  const styles = {
    legenda: "bg-story-legenda text-white",
    mite: "bg-story-mite text-white",
    fabel: "bg-story-fabel text-white",
    dongeng: "bg-story-dongeng text-white",
    neutral: selected ? "bg-teal text-white" : "bg-white text-text-main border border-border-light",
    region: "bg-cream text-teal border border-teal"
  };

  return (
    <div 
      className={cn(base, interactive, styles[type], className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {icon && <Icon name={icon} size={16} className="mr-2" />}
      {label}
    </div>
  );
}
