'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { api } from '@/lib/api';
import { prefetchAvailability } from '@/lib/availabilityCache';
import { formatPrice } from '@/lib/utils';
import { useI18n } from '@/components/I18nProvider';
import type { Tour } from '@/types';

// The calendar step (StepSelectDate) reads from the same cache keyed by
// tourId/month/year — kicking this off the moment a tour is picked means
// the availability round trip happens during the step transition instead
// of after it, so the calendar renders instantly instead of showing its
// own loading/error state.
function prefetchTourAvailability(tour: Tour) {
  const now = new Date();
  prefetchAvailability(tour.id, now.getMonth() + 1, now.getFullYear());
}

export function StepSelectTour() {
  const query = useSearchParams().get('tour');
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const autoSelected = useRef(false);
  const { setTour, nextStep, selectedTour } = useBookingStore();
  const { t, tag, locale } = useI18n();

  function load() {
    setLoading(true); setError(false);
    api.get('/tours', { params: { locale } }).then((response) => setTours(response.data.data)).catch(() => { setTours([]); setError(true); }).finally(() => setLoading(false));
  }
  useEffect(load, [locale]);
  useEffect(() => {
    if (loading || !query || autoSelected.current) return;
    const match = tours.find((tour) => tour.slug === query || tour.id === query);
    if (match) { autoSelected.current = true; prefetchTourAvailability(match); setTour(match); nextStep(); }
  }, [loading, nextStep, query, setTour, tours]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;
  if (error) return <div className="glass-card p-10 text-center"><p className="text-amber-700">Live availability could not be loaded. Stale fallback prices are disabled.</p><button onClick={load} className="btn-primary mt-5 inline-flex items-center gap-2"><RefreshCw className="h-4 w-4" />Retry</button></div>;

  return <div className="space-y-4"><h2 className="mb-6 font-display text-2xl font-bold">{t.booking.selectTour.heading}</h2>{tours.map((tour, index) => <motion.button key={tour.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }} onClick={() => { window.dataLayer?.push({ event: 'add_to_cart', tour_name: tour.title }); prefetchTourAvailability(tour); setTour(tour); nextStep(); }} className={`group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm hover:border-emerald-500 dark:bg-white/5 md:p-5 ${selectedTour?.id === tour.id ? 'border-emerald-500' : 'border-stone-200 dark:border-white/10'}`}><div className="hidden h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:block"><img src={tour.image || tour.images[0]} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><h3 className="font-display text-lg font-bold">{tour.title}</h3><p className="mt-1 line-clamp-1 text-sm text-stone-500">{tour.shortDesc}</p><div className="mt-2 flex gap-4 text-xs text-stone-400"><span className="flex gap-1"><Clock className="h-3.5 w-3.5" />{tour.duration}</span><span className="flex gap-1"><MapPin className="h-3.5 w-3.5" />{t.booking.selectTour.pickupAvailable}</span></div></div><div className="shrink-0 text-right"><p className="text-xs text-stone-400">{t.booking.selectTour.from}</p><p className="text-xl font-extrabold">{formatPrice(tour.basePrice, tour.currency, tag)}</p></div><ArrowRight className="hidden h-5 w-5 text-stone-300 sm:block" /></motion.button>)}{tours.length === 0 && <p className="glass-card p-10 text-center text-stone-500">No tours are currently open for booking.</p>}</div>;
}
