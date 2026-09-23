import { cn } from '../../utils/cn';

export function SidePanel({ children, isOpen, className }: { children: React.ReactNode, isOpen: boolean, className?: string }) {
  // Desktop side panel (e.g. for reading mode or profile)
  return (
    <div 
      className={cn(
        "hidden md:flex flex-col h-full bg-white border-r border-border-light shadow-warm-lg transition-all duration-300 overflow-hidden relative z-20 shrink-0",
        isOpen ? "w-[360px] lg:w-[420px]" : "w-0 min-w-0 opacity-0 border-r-0",
        className
      )}
    >
      <div className="flex-1 w-[360px] lg:w-[420px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
