'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { getCategoryLabel } from '@/lib/utils';

type TourGaps = {
  id: string;
  title: string;
  category: string;
  missing: number;
  blocked: number;
  soldOut: number;
  open: number;
  low: number;
  firstGap: string | null;
  unsellable: number;
};

/**
 * The dashboard's operational alarm: which live tours have days a customer
 * cannot book in the next month, worst first. Without this the only way to
 * notice an empty calendar is a customer failing to book.
 */
export function GapsPanel({ onOpenAvailability }: { onOpenAvailability: () => void }) {
  const [data, setData] = useState<{ totalDays: number; tours: TourGaps[]; toursWithGaps: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/availability/gaps', { params: { days: 30 } });
      setData(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load the availability report.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="glass-card flex items-center justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6">
        <p className="text-sm text-gray-500 dark:text-white/60">{error}</p>
        <button onClick={load} className="mt-3 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium dark:bg-white/5">
          Retry
        </button>
      </div>
    );
  }

  const problems = data?.tours.filter((tour) => tour.unsellable > 0) ?? [];

  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Availability gaps — next {data?.totalDays} days</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
            Days that are unset, blocked or sold out on an active tour.
          </p>
        </div>
        <button
          onClick={onOpenAvailability}
          className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
        >
          Open calendar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {problems.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-4 dark:bg-emerald-500/10">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Every active tour is bookable on all {data?.totalDays} days.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {problems.slice(0, 8).map((tour) => (
            <div
              key={tour.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-gray-100 px-4 py-3 dark:border-white/5"
            >
              <AlertTriangle
                className={`h-4 w-4 shrink-0 ${tour.unsellable > (data?.totalDays ?? 30) / 2 ? 'text-red-500' : 'text-amber-500'}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{tour.title}</p>
                <p className="text-xs text-gray-400 dark:text-white/40">{getCategoryLabel(tour.category)}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white/50">
                {tour.missing > 0 && <span className="whitespace-nowrap">{tour.missing} unset</span>}
                {tour.blocked > 0 && <span className="whitespace-nowrap">{tour.blocked} blocked</span>}
                {tour.soldOut > 0 && <span className="whitespace-nowrap">{tour.soldOut} sold out</span>}
              </div>
              <span className="whitespace-nowrap text-xs font-semibold text-gray-900 dark:text-white">
                {tour.unsellable}/{data?.totalDays}
              </span>
            </div>
          ))}
          {problems.length > 8 && (
            <p className="pt-1 text-xs text-gray-400 dark:text-white/35">
              …and {problems.length - 8} more tour{problems.length - 8 === 1 ? '' : 's'}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
