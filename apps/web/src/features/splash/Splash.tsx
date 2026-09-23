import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function Splash({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setIsVisible(false);
      onComplete();
    }
  }, [onComplete]);

  const handleComplete = () => {
    setIsVisible(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#d1f4f9] overflow-hidden cursor-pointer"
      onClick={handleComplete}
      initial={{ opacity: 1 }}
      animate={{ opacity: prefersReducedMotion ? 0 : 1 }}
      transition={{ delay: 2, duration: 1 }}
      onAnimationComplete={(definition) => {
        if (prefersReducedMotion && (definition as any).opacity === 0) {
          handleComplete();
        }
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-fredoka text-teal font-bold z-10 drop-shadow-md">
          Peta Legenda Nusantara
        </h1>
      </div>

      {!prefersReducedMotion && (
        <>
          {/* Awan Kiri */}
          <motion.div
            className="absolute left-0 h-full w-[150vw] md:w-[60vw] flex items-center justify-end -translate-x-[20%]"
            initial={{ x: 0 }}
            animate={{ x: '-100%' }}
            transition={{ delay: 1.5, duration: 1.5, ease: 'easeInOut' }}
            onAnimationComplete={handleComplete}
          >
            <svg viewBox="0 0 200 200" className="h-[150vh] w-auto fill-white drop-shadow-xl" preserveAspectRatio="none">
              <path d="M200,0 C150,20 120,60 140,100 C110,130 130,170 200,200 L0,200 L0,0 Z" />
            </svg>
          </motion.div>

          {/* Awan Kanan */}
          <motion.div
            className="absolute right-0 h-full w-[150vw] md:w-[60vw] flex items-center justify-start translate-x-[20%]"
            initial={{ x: 0 }}
            animate={{ x: '100%' }}
            transition={{ delay: 1.5, duration: 1.5, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 200 200" className="h-[150vh] w-auto fill-white drop-shadow-xl" preserveAspectRatio="none">
              <path d="M0,0 C50,20 80,60 60,100 C90,130 70,170 0,200 L200,200 L200,0 Z" />
            </svg>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
