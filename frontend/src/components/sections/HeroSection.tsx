'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, Play } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative h-screen min-h-[760px] w-full overflow-hidden bg-[#07100f] isolate">
      {/* Signature Hero Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/cappadocia-hero-signature.png')" }}
        />

        {/* Cinematic light shaping */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020706]/75 via-[#06100d]/28 to-[#020504]/92" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,8,7,0.28)_0%,rgba(2,8,7,0.08)_36%,rgba(1,4,3,0.62)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-black/20" />
        <div className="absolute -right-24 top-0 h-[70%] w-[48%] bg-amber-300/10 blur-[110px] mix-blend-screen" />
        <div className="absolute left-1/2 top-[44%] h-[30rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-950/20 blur-[100px]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white dark:from-dark to-transparent" />

        {/* Fine cinematic grain */}
        <div className="absolute inset-0 opacity-[0.045] mix-blend-soft-light bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNDAiIGhlaWdodD0iMjQwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii45IiBudW1PY3RhdmVzPSI0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIiBvcGFjaXR5PSIuOCIvPjwvc3ZnPg==')]" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-7"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/25 backdrop-blur-xl border border-white/20 text-sm text-white/90 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Now Booking for 2026 Season
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[7.25rem] font-bold text-white mb-6 leading-[0.95] tracking-[-0.035em] drop-shadow-[0_8px_35px_rgba(0,0,0,0.65)]"
        >
          Discovery{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 via-emerald-400 to-amber-300">
            Cappadocia
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="text-xl md:text-2xl text-white/80 font-light max-w-2xl mb-10 leading-relaxed drop-shadow-[0_4px_18px_rgba(0,0,0,0.8)]"
        >
          Experience the sky like never before
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/booking" className="btn-primary text-lg px-10 py-5 flex items-center gap-2 shadow-[0_18px_45px_-12px_rgba(16,185,129,0.75)] hover:shadow-[0_22px_55px_-12px_rgba(16,185,129,0.9)]">
            Book Now
            <span className="ml-1">→</span>
          </Link>
          <Link href="/#experiences" className="bg-black/20 backdrop-blur-xl border border-white/35 text-white font-semibold rounded-xl text-lg px-10 py-5 flex items-center gap-2 transition-all duration-300 hover:bg-white/15 hover:border-white/60 active:scale-95 shadow-[0_18px_45px_-20px_rgba(0,0,0,0.8)]">
            <Play className="w-5 h-5" />
            Explore Tours
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-3 md:gap-5 text-white/80 text-sm rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl px-5 py-3 shadow-2xl"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-dark/30 dark:border-dark flex items-center justify-center text-xs font-bold text-white"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span>10,000+ Happy Travelers</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-gold">★</span>
            ))}
            <span className="ml-1">4.9/5 Rating</span>
          </div>
          <div>🏆 #1 Rated in Cappadocia</div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/30 text-xs uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
