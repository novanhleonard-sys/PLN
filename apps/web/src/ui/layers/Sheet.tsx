import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

import { Icon } from '../basic/Icon';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: string[]; // e.g. ['30vh', '55vh', '92vh']
  noPadding?: boolean;
  hideCloseButton?: boolean;
}

export function Sheet({ isOpen, onClose, children, noPadding, hideCloseButton }: SheetProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2E2A26]/40 z-40"
          />
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[55vh] max-h-[92vh] bg-white rounded-t-3xl shadow-warm-lg z-50 flex flex-col"
          >
            <div className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing group">
              <div className="w-12 h-1.5 bg-stone-300 group-active:bg-stone-500 group-hover:bg-stone-400 rounded-full transition-colors" />
            </div>
            
            {!hideCloseButton && (
              <div className="absolute top-4 right-4">
                <button onClick={onClose} aria-label="Tutup" className="p-2 bg-cream text-text-muted hover:text-text-main rounded-full">
                  <Icon name="X" size={20} />
                </button>
              </div>
            )}
            
            <div className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-6'}`}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
