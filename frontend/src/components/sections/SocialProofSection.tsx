'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircle, Star } from 'lucide-react';
import { whatsappUrl } from '@/lib/site';
import { useI18n } from '@/components/I18nProvider';

export function SocialProofSection() {
  const [active, setActive] = useState(0);
  const { t } = useI18n();

  return (
    <section id="faq" className="relative overflow-hidden bg-[#0d241f] py-20 text-white md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(217,170,82,.14),transparent_32%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.25em] text-amber-300">{t.faqSection.eyebrow}</p>
          <h2 className="font-display text-4xl font-bold md:text-5xl">{t.faqSection.heading}</h2>
          <p className="mt-5 max-w-md leading-relaxed text-white/65">{t.faqSection.subtitle}</p>
          <a href={whatsappUrl(t.faqSection.whatsappMessage)} target="_blank" rel="noreferrer" data-event="whatsapp_click" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 font-bold"><MessageCircle className="h-5 w-5" /> {t.faqSection.whatsappCta}</a>
          <div className="mt-10 flex gap-3 text-sm text-white/55"><Star className="h-5 w-5 text-amber-300" /><p>{t.faqSection.reviewNote}</p></div>
        </div>
        <div className="divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/5 px-6 backdrop-blur-sm sm:px-8">
          {t.faqSection.items.map(([question, answer], index) => (
            <div key={question}>
              <button onClick={() => setActive(active === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 py-6 text-left font-bold"><span>{question}</span><ChevronDown className={`h-5 w-5 shrink-0 transition ${active === index ? 'rotate-180 text-amber-300' : 'text-white/40'}`} /></button>
              {active === index && <p className="pb-6 pr-8 text-sm leading-7 text-white/62">{answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
