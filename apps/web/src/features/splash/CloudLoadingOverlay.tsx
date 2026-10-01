import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

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

    // Timeout failsafe just in case map never loads
    const timeout = setTimeout(handleReady, 10000);

    return () => {
      window.removeEventListener('pln-map-ready', handleReady);
      clearTimeout(timeout);
    };
  }, []);

  if (isUnmounted) return null;

  const duration = prefersReduced ? 0.4 : 1.5;
  const ease: [number, number, number, number] = [0.4, 0.0, 0.2, 1];

  return (
    <motion.div
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      initial={{ opacity: 1 }}
      animate={isReady ? { opacity: prefersReduced ? 0 : 1 } : { opacity: 1 }}
      transition={{ duration }}
      onAnimationComplete={() => {
        if (isReady) setIsUnmounted(true);
      }}
    >
      {/* Background fill to ensure no gap in the middle before animation */}
      <motion.div 
        className="absolute inset-0 bg-[#e0f2fe]"
        initial={{ opacity: 1 }}
        animate={isReady ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: duration * 0.8, ease: 'easeOut' }}
      />

      {/* Typography */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center z-50"
        initial={{ opacity: 1, scale: 1 }}
        animate={isReady ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
        transition={{ duration: duration * 0.6, ease: 'easeOut' }}
      >
        <h1 className="text-5xl md:text-7xl font-fredoka text-teal font-bold drop-shadow-md text-center px-4">
          Peta Legenda<br/>Nusantara
        </h1>
      </motion.div>

      {/* Clouds Wrapper */}
      {!prefersReduced && (
        <>
          {/* Back Layer (Light blue tint) */}
          <motion.div 
            className="absolute top-0 bottom-0 left-0 w-[60vw] bg-[#e0f2fe]"
            initial={{ x: 0 }}
            animate={isReady ? { x: '-100%' } : { x: 0 }}
            transition={{ duration: duration * 0.9, ease }}
          >
            <img src="/assets/fluffy-edge-right-blue.svg" className="absolute top-0 -right-[15vw] w-[20vw] h-full drop-shadow-sm" style={{ fill: 'currentColor', objectFit: 'fill' }} />
          </motion.div>

          <motion.div 
            className="absolute top-0 bottom-0 right-0 w-[60vw] bg-[#e0f2fe]"
            initial={{ x: 0 }}
            animate={isReady ? { x: '100%' } : { x: 0 }}
            transition={{ duration: duration * 0.9, ease }}
          >
            <img src="/assets/fluffy-edge-left-blue.svg" className="absolute top-0 -left-[15vw] w-[20vw] h-full drop-shadow-sm" style={{ fill: 'currentColor', objectFit: 'fill' }} />
          </motion.div>

          {/* Front Layer (White) - moves slightly slower for parallax */}
          <motion.div 
            className="absolute -top-[10vh] -bottom-[10vh] left-0 w-[55vw] bg-white drop-shadow-xl"
            initial={{ x: 0, y: 0 }}
            animate={isReady ? { x: '-100%', y: '-2%' } : { x: 0, y: 0 }}
            transition={{ duration, ease }}
          >
            <img src="/assets/fluffy-edge-right-white.svg" className="absolute top-0 -right-[15vw] w-[20vw] h-full" style={{ fill: 'currentColor', objectFit: 'fill' }} />
          </motion.div>

          <motion.div 
            className="absolute -top-[10vh] -bottom-[10vh] right-0 w-[55vw] bg-white drop-shadow-xl"
            initial={{ x: 0, y: 0 }}
            animate={isReady ? { x: '100%', y: '2%' } : { x: 0, y: 0 }}
            transition={{ duration, ease }}
          >
            <img src="/assets/fluffy-edge-left-white.svg" className="absolute top-0 -left-[15vw] w-[20vw] h-full" style={{ fill: 'currentColor', objectFit: 'fill' }} />
          </motion.div>
          
          {/* Top and Bottom Cloud Accents */}
          <motion.div
             className="absolute top-0 left-0 right-0 h-[20vh] bg-white drop-shadow-md"
             initial={{ y: 0 }}
             animate={isReady ? { y: '-100%' } : { y: 0 }}
             transition={{ duration: duration * 1.1, ease }}
             style={{ borderRadius: '0 0 50% 50%' }}
          />
          <motion.div
             className="absolute bottom-0 left-0 right-0 h-[20vh] bg-white drop-shadow-md"
             initial={{ y: 0 }}
             animate={isReady ? { y: '100%' } : { y: 0 }}
             transition={{ duration: duration * 1.1, ease }}
             style={{ borderRadius: '50% 50% 0 0' }}
          />
        </>
      )}
    </motion.div>
  );
}
