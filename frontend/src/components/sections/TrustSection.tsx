'use client';

import { BadgeCheck, CalendarCheck, CircleDollarSign, Clock3, Headphones, MapPin, ShieldCheck, Undo2 } from 'lucide-react';
import { SITE } from '@/lib/site';
import { useI18n } from '@/components/I18nProvider';

// Icons stay in fixed order alongside `trust.reasons` in the dictionaries.
const icons = [BadgeCheck, ShieldCheck, CalendarCheck, MapPin, Headphones, CircleDollarSign, Clock3, Undo2];

export function TrustSection() {
  const { t, fill } = useI18n();

  return (
    <section id="about" className="relative z-10 -mt-12 pb-20" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_28px_80px_-38px_rgba(35,28,20,.35)] dark:border-white/10 dark:bg-[#111814]">
          <div className="grid lg:grid-cols-[.85fr_2fr]">
            <div className="bg-[#123f35] p-7 text-white md:p-9">
              <p className="mb-3 text-xs font-bold uppercase tracking-[.22em] text-amber-300">{t.trust.eyebrow}</p>
              <h2 id="trust-heading" className="font-display text-3xl font-bold">{t.trust.heading}</h2>
              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4">
                <ShieldCheck className="h-10 w-10 shrink-0 text-amber-300" />
                <div>
                  <p className="font-semibold">{SITE.legalName}</p>
                  <p className="mt-1 text-sm text-white/80">{t.trust.licensedAgency}</p>
                  <p className="mt-1 text-sm text-white/70">{fill(t.trust.tursab, { number: SITE.tursabNumber })}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-stone-200 sm:grid-cols-4 dark:bg-white/10">
              {t.trust.reasons.map((label, index) => {
                const Icon = icons[index] ?? BadgeCheck;
                return (
                  <div key={label} className="flex min-h-32 flex-col justify-center bg-white p-5 dark:bg-[#111814]">
                    <Icon className="mb-3 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-semibold leading-snug text-stone-800 dark:text-white/85">{label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
