'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Loader2, MapPin } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { CATALOG } from '@/lib/site';
import type { Tour, TourCategory } from '@/types';

const fallbackTours: Tour[] = CATALOG.map((tour, index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  title: tour.title, slug: tour.slug, description: tour.description, shortDesc: tour.description,
  category: (tour.category === 'Balloon' ? 'BALLOON' : tour.category === 'Daily Tour' ? 'DAILY_TOUR' : tour.category === 'Transfer' ? 'TRANSFER' : 'ADVENTURE') as TourCategory,
  basePrice: tour.price, currency: 'EUR', duration: tour.duration, maxCapacity: 20,
  images: [tour.image], highlights: tour.highlights, includes: tour.included, excludes: tour.notIncluded,
  isActive: true, sortOrder: index + 1, upsells: [],
}));

const aliases: Record<string, string> = {
  'cappadocia-hot-air-balloon': 'hot-air-balloon-flight',
  'cappadocia-sunset-atv-tour': 'atv-quad-safari',
  'cappadocia-airport-transfer': 'private-transfer',
};

export function StepSelectTour() {
  const query = useSearchParams().get('tour');
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const autoSelected = useRef(false);
  const { setTour, nextStep, selectedTour } = useBookingStore();

  useEffect(() => {
    api.get('/tours').then((res) => setTours(res.data.data)).catch(() => setTours(fallbackTours)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !query || autoSelected.current) return;
    const expected = aliases[query] || query;
    const match = tours.find((tour) => tour.slug === expected || tour.slug === query || tour.id === query);
    if (match) { autoSelected.current = true; setTour(match); nextStep(); }
  }, [loading, nextStep, query, setTour, tours]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="mb-6 font-display text-2xl font-bold">Choose your experience</h2>
      {tours.map((tour, index) => (
        <motion.button key={tour.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }} onClick={() => { window.dataLayer?.push({ event: 'add_to_cart', tour_name: tour.title }); setTour(tour); nextStep(); }} className={`group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-emerald-500 dark:bg-white/5 md:p-5 ${selectedTour?.id === tour.id ? 'border-emerald-500' : 'border-stone-200 dark:border-white/10'}`}>
          <div className="hidden h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:block"><img src={tour.images[0] || '/images/cappadocia-routes-aerial.png'} alt="" className="h-full w-full object-cover" /></div>
          <div className="min-w-0 flex-1"><h3 className="font-display text-lg font-bold group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{tour.title}</h3><p className="mt-1 line-clamp-1 text-sm text-stone-500 dark:text-white/50">{tour.shortDesc}</p><div className="mt-2 flex gap-4 text-xs text-stone-400"><span className="flex gap-1"><Clock className="h-3.5 w-3.5" />{tour.duration}</span><span className="flex gap-1"><MapPin className="h-3.5 w-3.5" />Pickup available</span></div></div>
          <div className="shrink-0 text-right"><p className="text-xs text-stone-400">From</p><p className="text-xl font-extrabold">{formatPrice(tour.basePrice, tour.currency || 'EUR')}</p></div>
          <ArrowRight className="hidden h-5 w-5 text-stone-300 sm:block" />
        </motion.button>
      ))}
      <p className="pt-2 text-xs text-stone-400">Availability is confirmed from the booking system before payment.</p>
    </div>
  );
}
