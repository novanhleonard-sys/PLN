import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const WatercolorCloud = ({ variant = 1, className, flipped = false }: { variant?: 1 | 2 | 3, className?: string, flipped?: boolean }) => {
  const positions = {
    1: '0 0',
    2: '0 50%',
    3: '0 100%'
  };

  return (
    <div 
      className={`absolute ${className} ${flipped ? '-scale-x-100' : ''}`}
      style={{
        backgroundImage: 'url(/assets/clouds_watercolor.png)',
        backgroundSize: '100% 300%',
        backgroundPosition: positions[variant],
        backgroundRepeat: 'no-repeat',
        filter: 'drop-shadow(0 25px 45px rgba(20,80,120,0.35))'
      }}
    />
  );
};

export function CloudLoadingOverlay() {
  const [isReady, setIsReady] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const path = window.location.pathname;
    if (path !== '/' && !path.startsWith('/cerita/')) {
      setIsReady(true);
      setIsUnmounted(true);
      return;
    }

    const handleReady = () => setIsReady(true);
    window.addEventListener('pln-map-ready', handleReady);
    const timeout = setTimeout(handleReady, 10000);

    return () => {
      window.removeEventListener('pln-map-ready', handleReady);
      clearTimeout(timeout);
    };
  }, []);

  if (isUnmounted) return null;

  if (prefersReduced) {
    return (
      <motion.div
        className="fixed inset-0 z-[9999] bg-[#e0f2fe] flex items-center justify-center pointer-events-auto"
        initial={{ opacity: 1 }}
        animate={isReady ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.4 }}
        onAnimationComplete={() => { if (isReady) setIsUnmounted(true); }}
      >
        <h1 className="text-4xl md:text-6xl font-fredoka text-teal font-bold drop-shadow-md text-center px-4">
          Peta Legenda<br/>Nusantara
        </h1>
      </motion.div>
    );
  }

  const out = isReady;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-auto">
      {/* 
        Solid background fallback to absolutely prevent the map from peeking 
        through if viewport is extremely tall/wide and clouds have micro-gaps.
        It fades out before the clouds finish sliding.
      */}
      <motion.div 
         className="absolute inset-0 bg-[#e0f2fe]"
         animate={out ? { opacity: 0 } : { opacity: 1 }}
         transition={{ duration: 0.7, ease: 'easeOut' }}
      />

      {/* Title */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
        initial={{ opacity: 1, scale: 1 }}
        animate={out ? { opacity: 0, scale: 0.96 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <h1 className="text-5xl md:text-7xl font-fredoka text-teal font-bold drop-shadow-md text-center px-4">
          Peta Legenda<br/>Nusantara
        </h1>
      </motion.div>

      {/* CLOUDS LAYER 1 (Background - slightly larger to cover everything) */}
      <motion.div className="absolute -top-[15vh] -left-[15vw] w-[85vw] h-[85vh]" animate={out ? { x: '-120vw', y: '-80vh' } : { x: 0, y: 0 }} transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}>
         <WatercolorCloud variant={3} className="w-full h-full opacity-60 mix-blend-multiply" />
      </motion.div>
      <motion.div className="absolute -top-[15vh] -right-[15vw] w-[85vw] h-[85vh]" animate={out ? { x: '120vw', y: '-80vh' } : { x: 0, y: 0 }} transition={{ duration: 1.45, ease: [0.4, 0, 0.2, 1] }}>
         <WatercolorCloud variant={2} className="w-full h-full opacity-60 mix-blend-multiply" flipped />
      </motion.div>
      <motion.div className="absolute -bottom-[15vh] -left-[15vw] w-[85vw] h-[85vh]" animate={out ? { x: '-120vw', y: '80vh' } : { x: 0, y: 0 }} transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}>
         <WatercolorCloud variant={1} className="w-full h-full opacity-60 mix-blend-multiply" flipped />
      </motion.div>
      <motion.div className="absolute -bottom-[15vh] -right-[15vw] w-[85vw] h-[85vh]" animate={out ? { x: '120vw', y: '80vh' } : { x: 0, y: 0 }} transition={{ duration: 1.55, ease: [0.4, 0, 0.2, 1] }}>
         <WatercolorCloud variant={3} className="w-full h-full opacity-60 mix-blend-multiply" />
      </motion.div>

      {/* CLOUDS LAYER 2 (Foreground - primary visibility) */}
      
      {/* Top Left */}
      <motion.div className="absolute -top-[25vh] -left-[20vw] w-[85vw] h-[85vh]" animate={out ? { x: '-130vw', y: '-90vh' } : { x: 0, y: 0 }} transition={{ duration: 1.35, ease: [0.4, 0, 0.2, 1] }}>
         <WatercolorCloud variant={1} className="w-full h-full" />
      </motion.div>

      {/* Top Center */}
      <motion.div className="absolute -top-[35vh] left-[5vw] w-[90vw] h-[75vh]" animate={out ? { y: '-100vh' } : { y: 0 }} transition={{ duration: 1.25, ease: [0.4, 0, 0.2, 1] }}>
         <WatercolorCloud variant={2} className="w-full h-full" flipped />
      </motion.div>

      {/* Top Right */}
      <motion.div className="absolute -top-[25vh] -right-[20vw] w-[85vw] h-[85vh]" animate={out ? { x: '130vw', y: '-90vh' } : { x: 0, y: 0 }} transition={{ duration: 1.45, ease: [0.4, 0, 0.2, 1] }}>
         <WatercolorCloud variant={3} className="w-full h-full" flipped />
      </motion.div>

      {/* Middle Left */}
      <motion.div className="absolute top-[10vh] -left-[30vw] w-[80vw] h-[80vh]" animate={out ? { x: '-130vw' } : { x: 0 }} transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}>
         <WatercolorCloud variant={2} className="w-full h-full" />
      </motion.div>

      {/* Middle Right */}
      <motion.div className="absolute top-[10vh] -right-[30vw] w-[80vw] h-[80vh]" animate={out ? { x: '130vw' } : { x: 0 }} transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}>
         <WatercolorCloud variant={1} className="w-full h-full" flipped />
      </motion.div>

      {/* Bottom Left */}
      <motion.div className="absolute -bottom-[25vh] -left-[20vw] w-[85vw] h-[85vh]" animate={out ? { x: '-130vw', y: '90vh' } : { x: 0, y: 0 }} transition={{ duration: 1.45, ease: [0.4, 0, 0.2, 1] }}>
         <WatercolorCloud variant={3} className="w-full h-full" />
      </motion.div>

      {/* Bottom Center */}
      <motion.div className="absolute -bottom-[35vh] left-[5vw] w-[90vw] h-[75vh]" animate={out ? { y: '100vh' } : { y: 0 }} transition={{ duration: 1.25, ease: [0.4, 0, 0.2, 1] }} onAnimationComplete={() => { if (out) setIsUnmounted(true); }}>
         <WatercolorCloud variant={1} className="w-full h-full" flipped />
      </motion.div>

      {/* Bottom Right */}
      <motion.div className="absolute -bottom-[25vh] -right-[20vw] w-[85vw] h-[85vh]" animate={out ? { x: '130vw', y: '90vh' } : { x: 0, y: 0 }} transition={{ duration: 1.35, ease: [0.4, 0, 0.2, 1] }}>
         <WatercolorCloud variant={2} className="w-full h-full" flipped />
      </motion.div>
      
    </div>
  );
}

