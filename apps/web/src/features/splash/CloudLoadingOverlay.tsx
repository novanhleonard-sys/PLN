import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const CloudLobe = ({ className, color = 'bg-white' }: { className?: string, color?: string }) => (
  <div className={bsolute \ rounded-[45%] \} />
);

const CloudBlob = ({ className, color = 'bg-white', flipped = false }: { className?: string, color?: string, flipped?: boolean }) => (
  <div className={bsolute filter drop-shadow-[0_12px_24px_rgba(20,90,130,0.15)] \ \}>
    <CloudLobe color={color} className="w-[50%] h-[60%] top-[10%] left-[10%]" />
    <CloudLobe color={color} className="w-[60%] h-[80%] top-[0%] left-[20%]" />
    <CloudLobe color={color} className="w-[70%] h-[90%] top-[5%] left-[40%]" />
    <CloudLobe color={color} className="w-[55%] h-[70%] top-[15%] right-[10%]" />
    <CloudLobe color={color} className="w-[45%] h-[55%] top-[30%] right-[0%]" />
    <CloudLobe color={color} className="w-[60%] h-[70%] bottom-[10%] left-[15%]" />
    <CloudLobe color={color} className="w-[65%] h-[80%] bottom-[0%] left-[35%]" />
    <CloudLobe color={color} className="w-[55%] h-[65%] bottom-[5%] right-[15%]" />
    <div className={bsolute \ w-[80%] h-[70%] top-[15%] left-[10%] rounded-3xl} />
  </div>
);

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
      {/* Background fill fade out */}
      <motion.div 
         className="absolute inset-0 bg-[#e0f2fe]"
         animate={out ? { opacity: 0 } : { opacity: 1 }}
         transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Title */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
        initial={{ opacity: 1, scale: 1 }}
        animate={out ? { opacity: 0, scale: 0.97 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <h1 className="text-5xl md:text-7xl font-fredoka text-teal font-bold drop-shadow-md text-center px-4">
          Peta Legenda<br/>Nusantara
        </h1>
      </motion.div>

      {/* BACK LAYER (Light Blueish) */}
      <motion.div className="absolute -top-[15vh] -left-[15vw] w-[80vw] h-[80vh]" animate={out ? { x: '-120vw', y: '-80vh' } : { x: 0, y: 0 }} transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}>
         <CloudBlob className="w-full h-full" color="bg-[#e0f2fe]" />
      </motion.div>
      <motion.div className="absolute -top-[15vh] -right-[15vw] w-[80vw] h-[80vh]" animate={out ? { x: '120vw', y: '-80vh' } : { x: 0, y: 0 }} transition={{ duration: 1.45, ease: [0.4, 0, 0.2, 1] }}>
         <CloudBlob className="w-full h-full" color="bg-[#e0f2fe]" flipped />
      </motion.div>
      <motion.div className="absolute -bottom-[15vh] -left-[15vw] w-[80vw] h-[80vh]" animate={out ? { x: '-120vw', y: '80vh' } : { x: 0, y: 0 }} transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}>
         <CloudBlob className="w-full h-full" color="bg-[#e0f2fe]" flipped />
      </motion.div>
      <motion.div className="absolute -bottom-[15vh] -right-[15vw] w-[80vw] h-[80vh]" animate={out ? { x: '120vw', y: '80vh' } : { x: 0, y: 0 }} transition={{ duration: 1.55, ease: [0.4, 0, 0.2, 1] }}>
         <CloudBlob className="w-full h-full" color="bg-[#e0f2fe]" />
      </motion.div>

      {/* FRONT LAYER (White) */}
      
      {/* Top Left */}
      <motion.div className="absolute -top-[25vh] -left-[20vw] w-[75vw] h-[85vh]" animate={out ? { x: '-130vw', y: '-90vh' } : { x: 0, y: 0 }} transition={{ duration: 1.35, ease: [0.4, 0, 0.2, 1] }}>
         <CloudBlob className="w-full h-full" color="bg-white" />
      </motion.div>

      {/* Top Center */}
      <motion.div className="absolute -top-[35vh] left-[15vw] w-[70vw] h-[75vh]" animate={out ? { y: '-100vh' } : { y: 0 }} transition={{ duration: 1.25, ease: [0.4, 0, 0.2, 1] }}>
         <CloudBlob className="w-full h-full" color="bg-white" flipped />
      </motion.div>

      {/* Top Right */}
      <motion.div className="absolute -top-[25vh] -right-[20vw] w-[75vw] h-[85vh]" animate={out ? { x: '130vw', y: '-90vh' } : { x: 0, y: 0 }} transition={{ duration: 1.45, ease: [0.4, 0, 0.2, 1] }}>
         <CloudBlob className="w-full h-full" color="bg-white" flipped />
      </motion.div>

      {/* Middle Left */}
      <motion.div className="absolute top-[10vh] -left-[30vw] w-[70vw] h-[80vh]" animate={out ? { x: '-130vw' } : { x: 0 }} transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}>
         <CloudBlob className="w-full h-full" color="bg-white" flipped />
      </motion.div>

      {/* Middle Right */}
      <motion.div className="absolute top-[10vh] -right-[30vw] w-[70vw] h-[80vh]" animate={out ? { x: '130vw' } : { x: 0 }} transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}>
         <CloudBlob className="w-full h-full" color="bg-white" />
      </motion.div>

      {/* Bottom Left */}
      <motion.div className="absolute -bottom-[25vh] -left-[20vw] w-[75vw] h-[85vh]" animate={out ? { x: '-130vw', y: '90vh' } : { x: 0, y: 0 }} transition={{ duration: 1.45, ease: [0.4, 0, 0.2, 1] }}>
         <CloudBlob className="w-full h-full" color="bg-white" />
      </motion.div>

      {/* Bottom Center */}
      <motion.div className="absolute -bottom-[35vh] left-[15vw] w-[70vw] h-[75vh]" animate={out ? { y: '100vh' } : { y: 0 }} transition={{ duration: 1.25, ease: [0.4, 0, 0.2, 1] }} onAnimationComplete={() => { if (out) setIsUnmounted(true); }}>
         <CloudBlob className="w-full h-full" color="bg-white" flipped />
      </motion.div>

      {/* Bottom Right */}
      <motion.div className="absolute -bottom-[25vh] -right-[20vw] w-[75vw] h-[85vh]" animate={out ? { x: '130vw', y: '90vh' } : { x: 0, y: 0 }} transition={{ duration: 1.35, ease: [0.4, 0, 0.2, 1] }}>
         <CloudBlob className="w-full h-full" color="bg-white" flipped />
      </motion.div>
      
    </div>
  );
}


