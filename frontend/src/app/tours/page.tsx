'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock3, MapPin, Search } from 'lucide-react';
import { CATALOG } from '@/lib/site';
import { useSitePreferences } from '@/components/SitePreferences';

const categories = ['All', 'Balloon', 'Adventure', 'Daily Tour', 'Transfer'];

export default function ToursPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const { price } = useSitePreferences();
  const tours = useMemo(() => CATALOG.filter((tour) => (category === 'All' || tour.category === category) && tour.title.toLowerCase().includes(search.toLowerCase())), [category, search]);

  return (
    <div className="min-h-screen bg-[#f8f6f1] pb-24 pt-20 dark:bg-dark">
      <section className="relative flex min-h-[410px] items-end overflow-hidden bg-stone-900 pb-14 text-white">
        <Image src="/images/cappadocia-tours-hero.png" alt="Cappadocia tours landscape" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/25" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.25em] text-amber-300">Local experiences</p><h1 className="mt-3 font-display text-5xl font-bold md:text-7xl">Explore Cappadocia</h1><p className="mt-4 max-w-2xl text-lg text-white/70">Compare balloon flights, guided day tours, outdoor adventures and airport transfers.</p></div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${category === item ? 'bg-[#123f35] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-white/5 dark:text-white/60'}`}>{item}</button>)}</div>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search experiences" className="w-full rounded-xl border border-stone-200 bg-transparent py-2.5 pl-10 pr-4 outline-none focus:border-emerald-500 dark:border-white/10 md:w-64" /></div>
        </div>
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => <article key={tour.slug} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5"><div className="relative h-56"><Image src={tour.image} alt={`${tour.title} in Cappadocia`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-stone-800">{tour.category}</span></div><div className="p-6"><h2 className="font-display text-2xl font-bold">{tour.title}</h2><p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600 dark:text-white/55">{tour.description}</p><div className="mt-4 flex gap-5 text-xs text-stone-500 dark:text-white/50"><span className="flex gap-1"><Clock3 className="h-4 w-4" />{tour.duration}</span><span className="flex gap-1"><MapPin className="h-4 w-4" />Pickup available</span></div><div className="mt-6 flex items-end justify-between border-t border-stone-100 pt-5 dark:border-white/10"><div><p className="text-xs text-stone-400">From</p><p className="text-2xl font-extrabold">{price(tour.price)}</p></div><Link href={`/tours/${tour.slug}`} className="rounded-xl bg-[#123f35] px-5 py-3 text-sm font-extrabold text-white">View details</Link></div></div></article>)}
        </div>
        {tours.length === 0 && <p className="py-20 text-center text-stone-500">No matching experiences found.</p>}
      </div>
    </div>
  );
}

