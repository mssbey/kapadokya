'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ResponsivePhoto } from '@/components/ResponsivePhoto';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarCheck, MessageCircle, ShieldCheck } from 'lucide-react';
import { SITE, whatsappUrl } from '@/lib/site';
import { useI18n } from '@/components/I18nProvider';

export function HeroSection() {
  const { t, href, fill } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      videoRef.current?.pause();
    }
  }, []);

  return (
    <section className="relative flex min-h-[780px] items-center overflow-hidden bg-[#07100f] pt-24 text-white lg:min-h-[860px]">
      <div className="absolute inset-0">
        {/* The poster doubles as the LCP paint: the preload scanner reads a
            <video poster> attribute just like an <img src>, so the frame is
            visible immediately while the clip itself streams in behind it.
            Two encodes (1920w desktop, 960w mobile) picked via <source media>
            keep phones off the heavier file. The plain <img> fallback only
            renders in browsers that can't play <video> at all. */}
        <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 10 }} className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/hero-banner-poster.jpg"
            className="absolute inset-0 h-full w-full object-cover object-[60%_center] md:object-center"
          >
            <source media="(max-width: 767px)" src="/videos/hero-banner-mobile.mp4" type="video/mp4" />
            <source src="/videos/hero-banner.mp4" type="video/mp4" />
            <ResponsivePhoto
              src="/images/cappadocia-hero-signature.webp"
              alt=""
              positionClassName="object-[60%_center] md:object-center"
            />
          </video>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#07100f]/95 via-[#07100f]/68 to-[#07100f]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07100f] via-transparent to-black/30" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-sm backdrop-blur-xl">
            <BadgeCheck className="h-4 w-4 text-amber-300" /> {t.hero.badge}
          </div>
          <h1 className="text-balance font-display text-5xl font-bold leading-[.98] tracking-tight sm:text-6xl lg:text-8xl">{t.hero.titleLead} <span className="text-amber-300">{t.hero.titleAccent}</span></h1>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={href('/#experiences')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-7 py-4 font-extrabold text-stone-900 transition hover:bg-amber-200">{t.hero.exploreCta} <ArrowRight className="h-5 w-5" /></Link>
            <a href={whatsappUrl(t.whatsapp.defaultMessage)} target="_blank" rel="noreferrer" data-event="whatsapp_click" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-xl transition hover:bg-white/20"><MessageCircle className="h-5 w-5" /> {t.hero.whatsappCta}</a>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/70">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> {t.hero.securePayment}</span>
            <span className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-emerald-300" /> {t.hero.fastConfirmation}</span>
            <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-emerald-300" /> {t.hero.humanSupport}</span>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/25 py-3 backdrop-blur-lg">
        <p className="mx-auto max-w-7xl px-4 text-center text-xs font-semibold tracking-wide text-white/65 sm:px-6 lg:px-8">{fill(t.hero.helpBar, { phone: SITE.phoneDisplay })}</p>
      </div>
    </section>
  );
}
