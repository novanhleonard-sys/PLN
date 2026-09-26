import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from '../basic/Icon';
import { icons } from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: keyof typeof icons;
  isDanger?: boolean;
  onClick?: () => void;
}

interface SidebarLayoutProps {
  title: string;
  items: SidebarItem[];
  activeId: string;
  children: ReactNode;
}

export function SidebarLayout({ title, items, activeId, children }: SidebarLayoutProps) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center pt-20">
      <div className="w-full max-w-6xl p-4 md:p-8">
        <h1 className="text-3xl font-fredoka font-bold text-teal mb-6 md:mb-8 ml-2">{title}</h1>
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
            <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
              {items.map(item => {
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl font-nunito font-bold transition-all text-left whitespace-nowrap",
                      isActive ? "bg-teal text-white shadow-md" : "text-stone-600 hover:bg-stone-200",
                      item.isDanger && !isActive && "text-red-500 hover:bg-red-50"
                    )}
                  >
                    {item.icon && <Icon name={item.icon} size={20} />}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex-1 w-full bg-white rounded-3xl shadow-sm border border-stone-200 p-6 md:p-8 min-h-[60vh]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
