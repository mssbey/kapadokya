'use client';

import Link from 'next/link';
import { CalendarDays, Check, MessageCircle, ShieldCheck } from 'lucide-react';
import { CatalogTour, whatsappUrl } from '@/lib/site';
import { useSitePreferences } from '@/components/SitePreferences';

export function TourBookingCard({ tour }: { tour: CatalogTour }) {
  const { price } = useSitePreferences();
  return (
    <>
      <aside className="sticky top-28 hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#111814] lg:block">
        <p className="text-sm text-stone-500 dark:text-white/50">From</p>
        <div className="flex items-end gap-2"><p className="text-4xl font-extrabold text-stone-900 dark:text-white">{price(tour.price)}</p><span className="pb-1 text-sm text-stone-400">per person</span></div>
        <p className="mt-2 text-xs text-stone-400">Final availability and total are confirmed before payment.</p>
        <Link href={`/booking?tour=${tour.slug}`} data-event="check_availability" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#123f35] px-5 py-4 font-extrabold text-white hover:bg-emerald-700"><CalendarDays className="h-5 w-5" /> Check availability</Link>
        <a href={whatsappUrl(`Hello, I would like information about ${tour.title}.`)} target="_blank" rel="noreferrer" data-event="whatsapp_click" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-5 py-4 font-bold text-stone-700 dark:border-white/15 dark:text-white"><MessageCircle className="h-5 w-5 text-[#25D366]" /> Ask on WhatsApp</a>
        <div className="mt-6 space-y-3 border-t border-stone-100 pt-5 text-sm text-stone-600 dark:border-white/10 dark:text-white/60"><p className="flex gap-2"><Check className="h-4 w-4 text-emerald-500" /> Free cancellation where stated</p><p className="flex gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure checkout</p></div>
      </aside>
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t border-stone-200 bg-white/95 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1311]/95 lg:hidden">
        <div className="min-w-20"><p className="text-[10px] text-stone-400">From</p><p className="text-xl font-extrabold">{price(tour.price)}</p></div>
        <Link href={`/booking?tour=${tour.slug}`} data-event="check_availability" className="flex-1 rounded-xl bg-[#123f35] px-4 py-3.5 text-center text-sm font-extrabold text-white">BOOK NOW</Link>
        <a href={whatsappUrl(`Hello, I would like information about ${tour.title}.`)} target="_blank" rel="noreferrer" data-event="whatsapp_click" aria-label="Ask on WhatsApp" className="grid h-12 w-12 place-items-center rounded-xl bg-[#25D366] text-white"><MessageCircle className="h-6 w-6" /></a>
      </div>
    </>
  );
}

