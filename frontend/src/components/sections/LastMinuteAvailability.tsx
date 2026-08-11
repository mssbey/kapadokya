'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useI18n } from '@/components/I18nProvider';

type Row = { id: string; date: string; seatsAvailable: number; priceOverride: number | null; tour: { title: string; slug: string; basePrice: number; currency: string } };

export function LastMinuteAvailability() {
  const { t, tag, href, fill } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => { api.get('/availability/last-minute/list').then((response) => setRows(response.data.data)).catch(() => setRows([])); }, []);
  if (!rows.length) return null;

  return (
    <section className="bg-amber-50 py-14 dark:bg-amber-300/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Flame className="h-7 w-7 text-orange-500" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-orange-600">{t.lastMinute.eyebrow}</p>
            <h2 className="font-display text-3xl font-bold">{t.lastMinute.heading}</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <Link key={row.id} href={href(`/booking?tour=${row.tour.slug}`)} className="flex items-center justify-between rounded-2xl border border-amber-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 dark:border-amber-300/10 dark:bg-white/5">
              <div>
                <p className="font-bold">{row.tour.title}</p>
                <p className="mt-1 text-sm text-stone-500 dark:text-white/50">
                  {new Date(row.date).toLocaleDateString(tag, { weekday: 'long', month: 'short', day: 'numeric' })} · {fill(t.lastMinute.seatsAvailable, { count: row.seatsAvailable })}
                </p>
              </div>
              <p className="ml-3 font-extrabold">{formatPrice(row.priceOverride || row.tour.basePrice, row.tour.currency, tag)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
