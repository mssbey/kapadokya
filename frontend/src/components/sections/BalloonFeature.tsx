'use client';

import { ResponsivePhoto } from '@/components/ResponsivePhoto';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Instagram, Sunrise } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { useEffect, useState } from 'react';
import { getPublicTours, getSiteSettings } from '@/lib/catalogApi';

export function BalloonFeature() {
  const { t, href, locale } = useI18n();
  const [bookingSlug, setBookingSlug] = useState<string>();
  const [instagramUrl, setInstagramUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getPublicTours(locale, { category: 'hot-air-balloon', featured: true })
      .then((tours) => { if (active) setBookingSlug(tours[0]?.slug); })
      .catch(() => { if (active) setBookingSlug(undefined); });
    return () => { active = false; };
  }, [locale]);

  useEffect(() => {
    let active = true;
    getSiteSettings()
      .then((settings) => { if (active) setInstagramUrl(settings.instagramUrl); })
      .catch(() => { if (active) setInstagramUrl(null); });
    return () => { active = false; };
  }, []);

  return (
    <section className="bg-white py-20 dark:bg-dark md:py-28">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-[#112f2a] text-white shadow-2xl lg:grid-cols-2">
        <div className="relative min-h-[420px]">
          <ResponsivePhoto src="/images/cappadocia-sunrise-section.webp" alt={t.balloon.imageAlt} />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#112f2a]/30" />
          <span className="absolute left-6 top-6 rounded-full bg-amber-300 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-stone-900">{t.balloon.badge}</span>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.balloon.instagramCta}
              title={t.balloon.instagramCta}
              className="absolute right-6 top-6 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-stone-800 shadow transition hover:scale-105"
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
        </div>
        <div className="p-7 sm:p-10 lg:p-14">
          <Sunrise className="mb-6 h-10 w-10 text-amber-300" />
          <h2 className="font-display text-4xl font-bold md:text-5xl">{t.balloon.heading}</h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">{t.balloon.subtitle}</p>
          <div className="mt-7 space-y-3">
            {t.balloon.options.map((option) => (
              <div key={option.name} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div><p className="font-bold">{option.name}</p><p className="mt-1 text-sm text-white/55">{option.detail}</p></div>
              </div>
            ))}
          </div>
          <Link href={href(bookingSlug ? `/booking?tour=${encodeURIComponent(bookingSlug)}` : '/tours')} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-300 px-6 py-4 font-extrabold text-stone-900 transition hover:bg-amber-200">{t.balloon.cta} <ArrowUpRight className="h-5 w-5" /></Link>
        </div>
      </div>
    </section>
  );
}
