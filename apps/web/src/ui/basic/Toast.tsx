import { cn } from '../../utils/cn';
import { Icon } from './Icon';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', visible, onClose }: ToastProps) {
  const icons = {
    success: 'CircleCheck',
    error: 'CircleAlert',
    info: 'Info'
  } as const;

  const colors = {
    success: 'bg-feedback-success text-white',
    error: 'bg-feedback-error text-white',
    info: 'bg-text-main text-white'
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-warm-lg z-50 min-w-[280px]",
            colors[type]
          )}
        >
          <Icon name={icons[type]} size={20} />
          <span className="text-sm font-nunito flex-1">{message}</span>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <Icon name="X" size={16} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
