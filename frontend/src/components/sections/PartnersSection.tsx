import Image from 'next/image';
import { getDictionary } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import type { Partner } from '@/lib/catalogApi';

type Props = { locale: Locale; partners: Partner[] };

// Server component: the partner list is fetched once on the homepage and
// handed down, so this never needs its own client-side data fetch.
export function PartnersSection({ locale, partners }: Props) {
  if (!partners.length) return null;
  const t = getDictionary(locale);

  return (
    <section id="partners" className="bg-[#f8f6f1] py-20 dark:bg-[#0b1512] md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.25em] text-amber-600 dark:text-amber-300">{t.partnersSection.eyebrow}</p>
          <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-white md:text-4xl">{t.partnersSection.heading}</h2>
          <p className="mt-4 text-stone-500 dark:text-white/60">{t.partnersSection.subtitle}</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {partners.map((partner) => {
            const card = (
              <div className="group flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#111814]">
                <div className="relative h-14 w-full">
                  <Image
                    src={partner.logoUrl}
                    alt={partner.name}
                    fill
                    sizes="160px"
                    className="object-contain grayscale transition group-hover:grayscale-0"
                  />
                </div>
                <p className="text-sm font-semibold text-stone-700 dark:text-white/80">{partner.name}</p>
              </div>
            );
            return partner.websiteUrl ? (
              <a key={partner.id} href={partner.websiteUrl} target="_blank" rel="noreferrer" aria-label={partner.name}>
                {card}
              </a>
            ) : (
              <div key={partner.id}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
