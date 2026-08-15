import { Star } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import type { Testimonial } from '@/lib/catalogApi';

type Props = { locale: Locale; testimonials: Testimonial[] };

// Server component: the testimonial list is fetched once on the homepage and
// handed down, so this never needs its own client-side data fetch.
export function TestimonialsSection({ locale, testimonials }: Props) {
  if (!testimonials.length) return null;
  const t = getDictionary(locale);

  return (
    <section id="reviews" className="bg-white py-20 dark:bg-[#0d1512] md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.25em] text-amber-600 dark:text-amber-300">{t.testimonialsSection.eyebrow}</p>
          <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-white md:text-4xl">{t.testimonialsSection.heading}</h2>
          <p className="mt-4 text-stone-500 dark:text-white/60">{t.testimonialsSection.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.id} className="flex flex-col rounded-2xl border border-stone-200 bg-stone-50 p-6 dark:border-white/10 dark:bg-[#111814]">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-white/20'}`} />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-stone-700 dark:text-white/75">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-5 border-t border-stone-200 pt-4 dark:border-white/10">
                <p className="text-sm font-semibold text-stone-900 dark:text-white">{item.authorName}</p>
                <p className="mt-0.5 text-xs text-stone-400 dark:text-white/40">
                  {[item.authorLocation, item.tourName].filter(Boolean).join(' · ')}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
