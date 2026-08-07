'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarCheck, MessageCircle, ShieldCheck } from 'lucide-react';
import { SITE, whatsappUrl } from '@/lib/site';

export function HeroSection() {
  return (
    <section className="relative flex min-h-[780px] items-center overflow-hidden bg-[#07100f] pt-24 text-white lg:min-h-[860px]">
      <div className="absolute inset-0">
        <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 10 }} className="absolute inset-0 bg-cover bg-[60%_center] md:bg-center" style={{ backgroundImage: "url('/images/cappadocia-hero-signature.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07100f]/95 via-[#07100f]/68 to-[#07100f]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07100f] via-transparent to-black/30" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="max-w-3xl">
          <Image
            src="/logo.png"
            width={640}
            height={246}
            alt="Discovery Cappadocia"
            priority
            className="mb-7 h-auto w-[260px] drop-shadow-[0_10px_40px_rgba(0,0,0,.55)] sm:w-[330px] lg:w-[400px]"
          />
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-sm backdrop-blur-xl">
            <BadgeCheck className="h-4 w-4 text-amber-300" /> Licensed local travel agency · Cappadocia
          </div>
          <h1 className="text-balance font-display text-5xl font-bold leading-[.98] tracking-tight sm:text-6xl lg:text-8xl">Discover the Magic of <span className="text-amber-300">Cappadocia</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/78 md:text-xl">Book unforgettable Cappadocia experiences with a licensed local travel agency. Hot air balloons, daily tours, ATV, horse riding, Jeep safari, airport transfers and more.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/#experiences" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-7 py-4 font-extrabold text-stone-900 transition hover:bg-amber-200">Explore tours <ArrowRight className="h-5 w-5" /></Link>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer" data-event="whatsapp_click" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-xl transition hover:bg-white/20"><MessageCircle className="h-5 w-5" /> WhatsApp us</a>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/70">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Secure payment</span>
            <span className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-emerald-300" /> Fast confirmation</span>
            <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-emerald-300" /> Real human support</span>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/25 py-3 backdrop-blur-lg">
        <p className="mx-auto max-w-7xl px-4 text-center text-xs font-semibold tracking-wide text-white/65 sm:px-6 lg:px-8">Need help choosing? Message our local team at {SITE.phoneDisplay}</p>
      </div>
    </section>
  );
}

