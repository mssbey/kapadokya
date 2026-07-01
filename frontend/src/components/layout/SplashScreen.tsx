'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'splash' | 'reveal' | 'done'>('loading');

  useEffect(() => {
    setMounted(true);

    // Check if already shown this session
    try {
      if (sessionStorage.getItem('dc_splash_shown')) {
        setPhase('done');
        return;
      }
    } catch {
      // SSR or restricted access
    }

    // Start splash
    setPhase('splash');

    // Logo animation plays, then reveal
    const revealTimer = setTimeout(() => setPhase('reveal'), 2400);
    const doneTimer = setTimeout(() => {
      setPhase('done');
      try { sessionStorage.setItem('dc_splash_shown', '1'); } catch {}
    }, 3200);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  // SSR and initial render — show nothing briefly
  if (!mounted) return null;

  if (phase === 'done' || phase === 'loading') return <>{children}</>;

  return (
    <>
      {/* Main content hidden behind splash */}
      <div className="opacity-0 pointer-events-none" aria-hidden>
        {children}
      </div>

      {/* Splash Overlay */}
      <AnimatePresence>
        {(phase === 'splash' || phase === 'reveal') && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-[#050505]" />

            {/* Ambient glow orbs */}
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full blur-[150px]"
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full blur-[120px] -translate-x-40 translate-y-20"
              style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)' }}
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Particle ring */}
            <div className="absolute">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-emerald-400/40"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i / 12) * Math.PI * 2) * 140,
                    y: Math.sin((i / 12) * Math.PI * 2) * 140,
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.8 + i * 0.08,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>

            {/* Center content */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Logo glow ring */}
              <motion.div
                className="absolute inset-0 -m-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 60%)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2.5, 2], opacity: [0, 0.8, 0.3] }}
                transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
              />

              {/* Logo container */}
              <motion.div
                initial={{ scale: 0.3, opacity: 0, filter: 'blur(20px)' }}
                animate={{
                  scale: phase === 'reveal' ? [1, 1.1] : [0.3, 0.8, 1],
                  opacity: phase === 'reveal' ? [1, 0] : [0, 1, 1],
                  filter: phase === 'reveal' ? 'blur(0px)' : ['blur(20px)', 'blur(0px)', 'blur(0px)'],
                }}
                transition={{
                  duration: phase === 'reveal' ? 0.6 : 1.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative"
              >
                {/* Shine sweep */}
                <motion.div
                  className="absolute inset-0 z-20 overflow-hidden rounded-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <motion.div
                    className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    initial={{ x: -200 }}
                    animate={{ x: 400 }}
                    transition={{ delay: 1.4, duration: 0.8, ease: 'easeInOut' }}
                  />
                </motion.div>

                <Image
                  src="/logo.png"
                  alt="Discovery Cappadocia"
                  width={280}
                  height={80}
                  className="relative z-10 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                  priority
                />
              </motion.div>

              {/* Tagline */}
              <motion.p
                className="mt-8 text-white/40 text-sm tracking-[0.35em] uppercase font-light"
                initial={{ opacity: 0, y: 15, letterSpacing: '0.1em' }}
                animate={{
                  opacity: phase === 'reveal' ? 0 : [0, 1],
                  y: phase === 'reveal' ? -10 : [15, 0],
                  letterSpacing: '0.35em',
                }}
                transition={{ delay: phase === 'reveal' ? 0 : 1.6, duration: 0.8, ease: 'easeOut' }}
              >
                Experience the sky
              </motion.p>

              {/* Loading bar */}
              <motion.div
                className="mt-6 h-[2px] rounded-full bg-white/10 overflow-hidden"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 120, opacity: phase === 'reveal' ? 0 : 1 }}
                transition={{ delay: 1.8, duration: 0.3 }}
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1.9, duration: 0.5, ease: 'easeInOut' }}
                />
              </motion.div>
            </div>

            {/* Curtain reveal - two halves split apart */}
            {phase === 'reveal' && (
              <>
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1/2 bg-[#050505] z-30"
                  initial={{ y: 0 }}
                  animate={{ y: '-100%' }}
                  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#050505] z-30"
                  initial={{ y: 0 }}
                  animate={{ y: '100%' }}
                  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
