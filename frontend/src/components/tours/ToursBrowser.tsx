'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock3, MapPin, Search } from 'lucide-react';
import { ResponsivePhoto } from '@/components/ResponsivePhoto';
import { TourCardPrice } from '@/components/tours/TourCardPrice';
import { useI18n } from '@/components/I18nProvider';
import { api } from '@/lib/api';
import { categoryLabel } from '@/lib/catalogApi';
import type { Tour, TourCategory } from '@/types';

const categoryKeys: (TourCategory | 'all')[] = ['all', 'BALLOON', 'DAILY_TOUR', 'ADVENTURE', 'TRANSFER'];

export function ToursBrowser() {
  const [category, setCategory] = useState<TourCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [catalog, setCatalog] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t, href, locale } = useI18n();

  useEffect(() => {
    setLoading(true); setError(false);
    api.get('/tours', { params: { locale } })
      .then((response) => setCatalog(response.data.data))
      .catch(() => { setCatalog([]); setError(true); })
      .finally(() => setLoading(false));
  }, [locale]);

  const tours = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(locale);
    return catalog.filter((tour) => (category === 'all' || tour.category === category) && (!query || `${tour.title} ${tour.shortDesc} ${tour.description}`.toLocaleLowerCase(locale).includes(query)));
  }, [catalog, category, search, locale]);

  const categoryText = (key: TourCategory | 'all') => {
    if (key === 'all') return t.toursPage.categories.all;
    return categoryLabel(key, locale);
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1] pb-24 dark:bg-dark">
      <section className="relative flex min-h-[490px] items-end overflow-hidden bg-stone-900 pb-14 pt-20 text-white"><ResponsivePhoto src="/images/cappadocia-tours-hero.webp" alt={t.toursPage.heroAlt} priority /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/25" /><div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.25em] text-amber-300">{t.toursPage.eyebrow}</p><h1 className="mt-3 font-display text-5xl font-bold md:text-7xl">{t.toursPage.heading}</h1><p className="mt-4 max-w-2xl text-lg text-white/70">{t.toursPage.subtitle}</p></div></section>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-col gap-4 rounded-2xl border bg-white p-4 dark:border-white/10 dark:bg-white/5 md:flex-row md:justify-between"><div className="flex flex-wrap gap-2">{categoryKeys.map((key) => <button key={key} onClick={() => setCategory(key)} className={`rounded-full px-4 py-2 text-sm font-bold ${category === key ? 'bg-[#123f35] text-white' : 'bg-stone-100 text-stone-600 dark:bg-white/5 dark:text-white/60'}`}>{categoryText(key)}</button>)}</div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.toursPage.searchPlaceholder} className="w-full rounded-xl border bg-transparent py-2.5 pl-10 pr-4 outline-none dark:border-white/10 md:w-64" /></div></div>
        {loading && <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[420px] animate-pulse rounded-3xl bg-stone-200 dark:bg-white/5" />)}</div>}
        {!loading && error && <div className="rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center text-amber-900">The live tour catalog is temporarily unavailable. No stale prices are being shown.</div>}
        {!loading && !error && <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{tours.map((tour) => <article key={tour.id} className="overflow-hidden rounded-3xl border bg-white shadow-sm dark:border-white/10 dark:bg-white/5"><div className="relative h-56">{tour.image ? <ResponsivePhoto src={tour.image} alt={tour.media?.[0]?.altText || tour.title} /> : <div className="absolute inset-0 bg-stone-200" />}<span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-stone-800">{categoryLabel(tour.category, locale)}</span></div><div className="p-6"><h2 className="font-body text-2xl font-extrabold leading-8 text-stone-900 dark:text-white">{tour.title}</h2><p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600 dark:text-white/55">{tour.shortDesc}</p><div className="mt-4 flex gap-5 text-xs text-stone-500"><span className="flex gap-1"><Clock3 className="h-4 w-4" />{tour.duration}</span><span className="flex gap-1"><MapPin className="h-4 w-4" />{t.toursPage.pickupAvailable}</span></div><div className="mt-6 flex items-end justify-between border-t pt-5 dark:border-white/10"><TourCardPrice tour={tour} fromLabel={t.toursPage.from} /><Link href={href(`/tours/${tour.slug}`)} className="rounded-xl bg-[#123f35] px-5 py-3 text-sm font-extrabold text-white">{t.toursPage.viewDetails}</Link></div></div></article>)}</div>}
        {!loading && !error && tours.length === 0 && <p className="py-20 text-center text-stone-500">{t.toursPage.empty}</p>}
      </div>
    </div>
  );
}
