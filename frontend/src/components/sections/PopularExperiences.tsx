'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock3, Heart, MapPin, Star } from 'lucide-react';
import { ResponsivePhoto } from '@/components/ResponsivePhoto';
import { TourCardPrice } from '@/components/tours/TourCardPrice';
import { useI18n } from '@/components/I18nProvider';
import { api } from '@/lib/api';
import { categoryLabel } from '@/lib/catalogApi';
import type { Tour } from '@/types';

export function PopularExperiences() {
  const { t, href, locale } = useI18n();
  const [saved, setSaved] = useState<string[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem('dc_wishlist') || '[]')); } catch { setSaved([]); }
  }, []);
  useEffect(() => {
    setLoading(true); setError(false);
    api.get('/tours', { params: { locale, featured: 'true' } })
      .then((response) => setTours(response.data.data))
      .catch(() => { setTours([]); setError(true); })
      .finally(() => setLoading(false));
  }, [locale]);

  function toggle(slug: string) {
    const next = saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug];
    setSaved(next); localStorage.setItem('dc_wishlist', JSON.stringify(next));
  }

  return (
    <section id="experiences" className="bg-[#f7f4ee] py-20 dark:bg-[#0d100f] md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="mb-3 text-xs font-bold uppercase tracking-[.25em] text-emerald-700 dark:text-emerald-400">{t.popular.eyebrow}</p><h2 className="font-display text-4xl font-bold md:text-5xl">{t.popular.heading}</h2></div>
          <Link href={href('/tours')} className="font-semibold text-emerald-700 dark:text-emerald-400">{t.popular.viewAll}</Link>
        </div>
        {loading && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-96 animate-pulse rounded-3xl bg-stone-200 dark:bg-white/5" />)}</div>}
        {!loading && error && <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-900">Tours are temporarily unavailable. Please try again shortly.</div>}
        {!loading && !error && tours.length === 0 && <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-stone-500">No featured tours are currently published.</div>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tours.map((tour) => (
            <article key={tour.id} className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
              <div className="relative h-52 overflow-hidden">
                {tour.image ? <ResponsivePhoto src={tour.image} alt={tour.media?.[0]?.altText || tour.title} className="transition duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-stone-200 dark:bg-white/10" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                <button onClick={() => toggle(tour.slug)} aria-label={saved.includes(tour.slug) ? t.popular.removeWishlist : t.popular.addWishlist} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-stone-700 shadow"><Heart className={`h-5 w-5 ${saved.includes(tour.slug) ? 'fill-rose-500 text-rose-500' : ''}`} /></button>
                <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">{categoryLabel(tour.category, locale)}</p>
              </div>
              <div className="p-5"><h3 className="min-h-14 font-body text-xl font-extrabold leading-7 text-stone-900 dark:text-white">{tour.title}</h3><div className="mt-3 flex flex-wrap gap-4 text-xs text-stone-500"><span className="flex gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{t.popular.newListing}</span><span className="flex gap-1"><Clock3 className="h-4 w-4" />{tour.duration}</span><span className="flex gap-1"><MapPin className="h-4 w-4" />{t.popular.hotelPickup}</span></div><div className="mt-5 flex items-end justify-between border-t pt-4 dark:border-white/10"><TourCardPrice tour={tour} fromLabel={t.popular.from} /><Link href={href(`/tours/${tour.slug}`)} className="rounded-xl bg-[#123f35] px-4 py-2.5 text-sm font-bold text-white">{t.popular.viewAndBook}</Link></div></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
