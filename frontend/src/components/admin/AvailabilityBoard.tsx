'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, CalendarDays, Loader2, RefreshCw, Save, Wand2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatPrice } from '@/lib/utils';

type DayStatus = 'missing' | 'blocked' | 'soldOut' | 'low' | 'open';

type Day = {
  date: string;
  status: DayStatus;
  seatsAvailable: number | null;
  seatsTotal: number | null;
  priceOverride: number | null;
  isBlocked: boolean;
  bookings: number;
  guests: number;
};

type TourSummary = {
  id: string;
  title: string;
  basePrice: number;
  currency: string;
  maxCapacity: number;
  isActive: boolean;
};

type BoardData = {
  tour: TourSummary;
  from: string;
  to: string;
  days: Day[];
  summary: Record<DayStatus, number>;
};

const STATUS_META: Record<DayStatus, { label: string; cell: string; dot: string }> = {
  open: {
    label: 'Open',
    cell: 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/25 dark:bg-emerald-500/10',
    dot: 'bg-emerald-500',
  },
  low: {
    label: 'Low seats',
    cell: 'border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10',
    dot: 'bg-amber-500',
  },
  soldOut: {
    label: 'Sold out',
    cell: 'border-red-200 bg-red-50 dark:border-red-500/25 dark:bg-red-500/10',
    dot: 'bg-red-500',
  },
  blocked: {
    label: 'Blocked',
    cell: 'border-slate-300 bg-slate-100 dark:border-white/15 dark:bg-white/10',
    dot: 'bg-slate-400',
  },
  missing: {
    label: 'No availability set',
    cell: 'border-dashed border-gray-300 bg-transparent dark:border-white/20',
    dot: 'bg-gray-300 dark:bg-white/30',
  },
};

const STATUS_ORDER: DayStatus[] = ['open', 'low', 'soldOut', 'blocked', 'missing'];

/** Monday-first weekday index, so the grid matches how Turkish calendars read. */
function weekdayIndex(iso: string): number {
  return (new Date(`${iso}T00:00:00.000Z`).getUTCDay() + 6) % 7;
}

function monthLabel(iso: string): string {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function dayOfMonth(iso: string): number {
  return new Date(`${iso}T00:00:00.000Z`).getUTCDate();
}

function groupByMonth(days: Day[]): { key: string; label: string; days: Day[] }[] {
  const months = new Map<string, Day[]>();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(day);
  }
  return Array.from(months.entries()).map(([key, monthDays]) => ({
    key,
    label: monthLabel(monthDays[0].date),
    days: monthDays,
  }));
}

function extractError(err: any, fallback: string): string {
  return err?.response?.data?.message || fallback;
}

export function AvailabilityBoard() {
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [tourId, setTourId] = useState('');
  const [windowDays, setWindowDays] = useState(60);
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Day | null>(null);
  const [filling, setFilling] = useState(false);

  useEffect(() => {
    api
      .get('/admin/tours')
      .then((res) => {
        const list: TourSummary[] = res.data.data;
        setTours(list);
        // Land on something sellable — retired tours sort alongside live ones
        // and are the last thing you want to open the calendar on.
        setTourId((current) => current || list.find((tour) => tour.isActive)?.id || list[0]?.id || '');
      })
      .catch((err) => setError(extractError(err, 'Failed to load tours.')));
  }, []);

  const loadBoard = useCallback(async () => {
    if (!tourId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/availability', { params: { tourId, days: windowDays } });
      setBoard(res.data.data);
    } catch (err: any) {
      setError(extractError(err, 'Failed to load availability.'));
    } finally {
      setLoading(false);
    }
  }, [tourId, windowDays]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const months = useMemo(() => (board ? groupByMonth(board.days) : []), [board]);
  const missingCount = board?.summary.missing ?? 0;

  /** Creates rows for every day that has none, at the tour's default capacity. */
  async function fillMissingDays() {
    if (!board) return;
    const missing = board.days.filter((day) => day.status === 'missing');
    if (missing.length === 0) return;
    if (!window.confirm(`Open ${missing.length} unset day${missing.length === 1 ? '' : 's'} at ${board.tour.maxCapacity} seats each?`)) return;

    setFilling(true);
    try {
      // Chunked rather than all at once: 90 parallel upserts on one tour is a
      // needless burst of write contention on the same rows' index.
      for (let i = 0; i < missing.length; i += 8) {
        await Promise.all(
          missing.slice(i, i + 8).map((day) =>
            api.post('/admin/availability', {
              tourId: board.tour.id,
              date: day.date,
              seatsAvailable: board.tour.maxCapacity,
              seatsTotal: board.tour.maxCapacity,
              isBlocked: false,
            }),
          ),
        );
      }
      toast.success(`Opened ${missing.length} day${missing.length === 1 ? '' : 's'}`);
      loadBoard();
    } catch (err: any) {
      toast.error(extractError(err, 'Failed to fill the missing days.'));
    } finally {
      setFilling(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Availability</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
            Every day a tour cannot be sold — unset, blocked or sold out — shown before a customer finds it.
          </p>
        </div>
        <button
          onClick={loadBoard}
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      <div className="glass-card mb-6 flex flex-wrap items-end gap-4 p-5">
        <div className="min-w-56 flex-1">
          <label htmlFor="availability-tour" className="mb-1.5 block text-xs text-gray-500 dark:text-white/50">
            Tour
          </label>
          <select
            id="availability-tour"
            className="input-glass"
            value={tourId}
            onChange={(e) => {
              setTourId(e.target.value);
              setSelected(null);
            }}
          >
            <optgroup label="Active">
              {tours
                .filter((tour) => tour.isActive)
                .map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.title}
                  </option>
                ))}
            </optgroup>
            {tours.some((tour) => !tour.isActive) && (
              <optgroup label="Inactive">
                {tours
                  .filter((tour) => !tour.isActive)
                  .map((tour) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.title}
                    </option>
                  ))}
              </optgroup>
            )}
          </select>
        </div>
        <div>
          <span className="mb-1.5 block text-xs text-gray-500 dark:text-white/50">Window</span>
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white/5">
            {[30, 60, 90].map((value) => (
              <button
                key={value}
                onClick={() => setWindowDays(value)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  windowDays === value
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-white/15 dark:text-white'
                    : 'text-gray-500 dark:text-white/50',
                )}
              >
                {value}d
              </button>
            ))}
          </div>
        </div>
        {missingCount > 0 && (
          <button
            onClick={fillMissingDays}
            disabled={filling}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
          >
            {filling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Open {missingCount} unset day{missingCount === 1 ? '' : 's'}
          </button>
        )}
      </div>

      {error ? (
        <div className="glass-card flex flex-col items-center gap-3 p-12 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p className="max-w-sm text-sm text-gray-500 dark:text-white/60">{error}</p>
          <button onClick={loadBoard} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium dark:bg-white/5">
            Retry
          </button>
        </div>
      ) : loading || !board ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="glass-card p-4">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_META[status].dot)} />
                  <span className="text-xs text-gray-500 dark:text-white/50">{STATUS_META[status].label}</span>
                </div>
                <p
                  className={cn(
                    'mt-2 text-2xl font-bold',
                    status === 'missing' && board.summary.missing > 0
                      ? 'text-red-500'
                      : 'text-gray-900 dark:text-white',
                  )}
                >
                  {board.summary[status]}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            {months.map((month) => (
              <section key={month.key}>
                <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  {month.label}
                </h2>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
                    <div key={label} className="pb-1 text-center text-[11px] font-medium text-gray-400 dark:text-white/35">
                      {label}
                    </div>
                  ))}
                  {/* Pad so the first day of the range lands on its weekday. */}
                  {Array.from({ length: weekdayIndex(month.days[0].date) }).map((_, index) => (
                    <div key={`pad-${index}`} />
                  ))}
                  {month.days.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelected(day)}
                      className={cn(
                        'flex min-h-[4.5rem] flex-col items-start rounded-xl border p-2 text-left transition-all hover:ring-2 hover:ring-emerald-500/40',
                        STATUS_META[day.status].cell,
                        selected?.date === day.date && 'ring-2 ring-emerald-500',
                      )}
                      title={`${day.date} — ${STATUS_META[day.status].label}`}
                    >
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{dayOfMonth(day.date)}</span>
                      <span className="mt-auto text-[11px] leading-tight text-gray-600 dark:text-white/60">
                        {day.status === 'missing' ? '—' : `${day.seatsAvailable}/${day.seatsTotal}`}
                      </span>
                      {day.priceOverride != null && (
                        <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                          {formatPrice(day.priceOverride, board.tour.currency)}
                        </span>
                      )}
                      {day.bookings > 0 && (
                        <span className="text-[10px] text-gray-500 dark:text-white/40">{day.bookings} bkg</span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {board && <BulkFill tour={board.tour} onDone={loadBoard} />}

      {selected && board && (
        <DayEditor
          key={selected.date}
          day={selected}
          tour={board.tour}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            loadBoard();
          }}
        />
      )}
    </div>
  );
}

/** Season-level changes: set capacity and price across a whole date range. */
function BulkFill({ tour, onDone }: { tour: TourSummary; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [seatsTotal, setSeatsTotal] = useState(String(tour.maxCapacity));
  const [priceOverride, setPriceOverride] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!startDate || !endDate) return toast.error('Pick a start and end date.');
    if (endDate < startDate) return toast.error('End date must be on or after the start date.');

    setSaving(true);
    try {
      const res = await api.post('/admin/availability/bulk', {
        tourId: tour.id,
        startDate,
        endDate,
        seatsTotal: Number(seatsTotal),
        priceOverride: priceOverride === '' ? undefined : Number(priceOverride),
      });
      toast.success(`Updated ${res.data.count} day${res.data.count === 1 ? '' : 's'}`);
      onDone();
    } catch (err: any) {
      toast.error(extractError(err, 'Bulk update failed.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glass-card mt-8 p-5">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-semibold text-gray-900 dark:text-white">Bulk set a date range</span>
        <span className="text-sm text-gray-400">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="bulk-start" className="mb-1.5 block text-xs text-gray-500 dark:text-white/50">
              Start date
            </label>
            <input id="bulk-start" type="date" className="input-glass" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="bulk-end" className="mb-1.5 block text-xs text-gray-500 dark:text-white/50">
              End date
            </label>
            <input id="bulk-end" type="date" className="input-glass" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="bulk-seats" className="mb-1.5 block text-xs text-gray-500 dark:text-white/50">
              Seats per day
            </label>
            <input id="bulk-seats" type="number" min={1} className="input-glass" value={seatsTotal} onChange={(e) => setSeatsTotal(e.target.value)} />
          </div>
          <div>
            <label htmlFor="bulk-price" className="mb-1.5 block text-xs text-gray-500 dark:text-white/50">
              Price (optional)
            </label>
            <input
              id="bulk-price"
              type="number"
              min={0}
              step="0.01"
              className="input-glass"
              placeholder={String(tour.basePrice)}
              value={priceOverride}
              onChange={(e) => setPriceOverride(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Apply
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-white/35 lg:col-span-5">
            Existing days keep their remaining seats — only capacity and price are rewritten, so bookings already taken are
            never wiped.
          </p>
        </form>
      )}
    </div>
  );
}

function DayEditor({
  day,
  tour,
  onClose,
  onSaved,
}: {
  day: Day;
  tour: TourSummary;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [seatsTotal, setSeatsTotal] = useState(String(day.seatsTotal ?? tour.maxCapacity));
  const [seatsAvailable, setSeatsAvailable] = useState(String(day.seatsAvailable ?? tour.maxCapacity));
  const [priceOverride, setPriceOverride] = useState(day.priceOverride != null ? String(day.priceOverride) : '');
  const [isBlocked, setIsBlocked] = useState(day.isBlocked);
  const [saving, setSaving] = useState(false);

  async function save() {
    const total = Number(seatsTotal);
    const available = Number(seatsAvailable);
    if (!Number.isInteger(total) || total < 1) return toast.error('Total seats must be at least 1.');
    if (!Number.isInteger(available) || available < 0) return toast.error('Seats left cannot be negative.');
    if (available > total) return toast.error('Seats left cannot exceed total seats.');

    setSaving(true);
    try {
      await api.post('/admin/availability', {
        tourId: tour.id,
        date: day.date,
        seatsTotal: total,
        seatsAvailable: available,
        priceOverride: priceOverride === '' ? null : Number(priceOverride),
        isBlocked,
      });
      toast.success(`${day.date} updated`);
      onSaved();
    } catch (err: any) {
      toast.error(extractError(err, 'Failed to save this day.'));
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-dark-50 sm:rounded-3xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{day.date}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{tour.title}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/5">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {day.bookings > 0 && (
          <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            {day.bookings} booking{day.bookings === 1 ? '' : 's'} ({day.guests} guest{day.guests === 1 ? '' : 's'}) already
            on this date. Blocking it does not cancel them.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="day-total" className="mb-1.5 block text-xs text-gray-500 dark:text-white/50">
              Total seats
            </label>
            <input
              id="day-total"
              type="number"
              min={1}
              className="input-glass"
              value={seatsTotal}
              onChange={(e) => setSeatsTotal(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="day-available" className="mb-1.5 block text-xs text-gray-500 dark:text-white/50">
              Seats left
            </label>
            <input
              id="day-available"
              type="number"
              min={0}
              className="input-glass"
              value={seatsAvailable}
              onChange={(e) => setSeatsAvailable(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="day-price" className="mb-1.5 block text-xs text-gray-500 dark:text-white/50">
              Price for this day — leave empty to use the base price ({formatPrice(tour.basePrice, tour.currency)})
            </label>
            <input
              id="day-price"
              type="number"
              min={0}
              step="0.01"
              className="input-glass"
              placeholder={String(tour.basePrice)}
              value={priceOverride}
              onChange={(e) => setPriceOverride(e.target.value)}
            />
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-white/10">
          <input
            type="checkbox"
            checked={isBlocked}
            onChange={(e) => setIsBlocked(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          <span className="text-sm text-gray-700 dark:text-white/70">
            Block this date — hides it from booking regardless of seats
          </span>
        </label>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 dark:border-white/10 dark:text-white/70"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
