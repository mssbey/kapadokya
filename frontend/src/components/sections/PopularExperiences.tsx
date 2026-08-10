'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock3, Heart, MapPin, Star } from 'lucide-react';
import { getFeatured } from '@/lib/site';
import { useSitePreferences } from '@/components/SitePreferences';
import { useI18n } from '@/components/I18nProvider';

export function PopularExperiences() {
  const { price } = useSitePreferences();
  const { t, href } = useI18n();
  const [saved, setSaved] = useState<string[]>([]);
  // Only the flagged headline products — the full catalogue lives on /tours.
  const catalog = getFeatured(t);

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem('dc_wishlist') || '[]')); } catch { setSaved([]); }
  }, []);

  function toggle(slug: string) {
    const next = saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug];
    setSaved(next);
    localStorage.setItem('dc_wishlist', JSON.stringify(next));
  }

  return (
    <section id="experiences" className="bg-[#f7f4ee] py-20 dark:bg-[#0d100f] md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.25em] text-emerald-700 dark:text-emerald-400">{t.popular.eyebrow}</p>
            <h2 className="font-display text-4xl font-bold text-stone-900 dark:text-white md:text-5xl">{t.popular.heading}</h2>
          </div>
          <Link href={href('/tours')} className="font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400">{t.popular.viewAll}</Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {catalog.map((tour) => (
            <article key={tour.slug} className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
              <div className="relative h-52 overflow-hidden">
                <Image src={tour.image} alt={tour.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                {tour.badge && <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-stone-800">{tour.badge}</span>}
                <button onClick={() => toggle(tour.slug)} aria-label={saved.includes(tour.slug) ? t.popular.removeWishlist : t.popular.addWishlist} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-stone-700 shadow">
                  <Heart className={`h-5 w-5 ${saved.includes(tour.slug) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
                <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">{tour.category}</p>
              </div>
              <div className="p-5">
                <h3 className="min-h-14 font-display text-xl font-bold text-stone-900 dark:text-white">{tour.title}</h3>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-500 dark:text-white/55">
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {t.popular.newListing}</span>
                  <span className="flex items-center gap-1"><Clock3 className="h-4 w-4" /> {tour.duration}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {t.popular.hotelPickup}</span>
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-stone-100 pt-4 dark:border-white/10">
                  <div><p className="text-xs text-stone-400">{t.popular.from}</p><p className="text-2xl font-extrabold text-stone-900 dark:text-white">{price(tour.price)}</p></div>
                  <Link href={href(`/tours/${tour.slug}`)} className="rounded-xl bg-[#123f35] px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">{t.popular.viewAndBook}</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs text-stone-500 dark:text-white/40">{t.popular.currencyNote}</p>
      </div>
    </section>
  );
}
