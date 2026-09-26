import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-[100dvh] bg-stone-50 flex w-full font-nunito overflow-hidden">
      {/* Sidebar */}
      <div 
        className={cn(
          "shrink-0 bg-white border-r border-stone-200 transition-all duration-300 flex flex-col z-20 shadow-sm",
          isOpen ? "w-64" : "w-0 border-r-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="p-4 flex-1 flex flex-col gap-2 overflow-y-auto mt-4">
          {items.map(item => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left whitespace-nowrap",
                  isActive ? "bg-teal text-white shadow-md" : "text-stone-600 hover:bg-stone-100",
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
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative bg-cream">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:px-8 md:py-4 bg-white/80 backdrop-blur border-b border-stone-200 sticky top-0 z-10 shadow-sm">
          {/* Left: Hamburger */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors flex items-center gap-2 font-bold text-sm"
          >
            <Icon name="Menu" size={24} />
            <span className="hidden sm:inline">{isOpen ? 'Tutup Menu' : 'Buka Menu'}</span>
          </button>
          
          {/* Right: Title & Back */}
          <div className="flex items-center gap-4 text-right">
            <h1 className="text-xl font-fredoka font-bold text-teal hidden md:block">{title}</h1>
            <div className="w-px h-6 bg-stone-300 hidden md:block"></div>
            <Link to="/" className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-teal transition-colors">
              Kembali ke Peta
              <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
