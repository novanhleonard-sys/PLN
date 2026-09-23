import { cn } from '../../utils/cn';

export function Badge({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'success' | 'warning' | 'error' }) {
  const variants = {
    default: "bg-cream text-text-muted",
    success: "bg-feedback-success/10 text-feedback-success",
    warning: "bg-story-dongeng/10 text-story-dongeng",
    error: "bg-feedback-error/10 text-feedback-error"
  };
  
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-nunito font-bold", variants[variant], className)}>
      {children}
    </span>
  );
}

export function Card({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  return (
    <div 
      className={cn(
        "bg-white border border-border-light rounded-2xl overflow-hidden",
        onClick && "cursor-pointer transition-transform active:scale-[0.98] hover:shadow-warm",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
