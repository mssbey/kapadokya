'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, RotateCcw, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { cn, formatPrice } from '@/lib/utils';

type TourSummary = {
  id: string;
  title: string;
  basePrice: number;
  currency: string;
};

type ScheduledPrice = { date: string; price: number };

const WEEKDAYS = [
  { value: 1, short: 'Pzt' },
  { value: 2, short: 'Sal' },
  { value: 3, short: 'Çar' },
  { value: 4, short: 'Per' },
  { value: 5, short: 'Cum' },
  { value: 6, short: 'Cmt' },
  { value: 0, short: 'Paz' },
];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function todayKey() {
  return dateKey(new Date());
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthEndKey(date: Date) {
  return dateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function extractError(error: any, fallback: string) {
  return error?.response?.data?.message || fallback;
}

export function TourPriceCalendar({ tour }: { tour: TourSummary }) {
  const currentMonth = useMemo(() => monthStart(new Date()), []);
  const [month, setMonth] = useState(currentMonth);
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [selectedPrice, setSelectedPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [startDate, setStartDate] = useState(todayKey());
  const [endDate, setEndDate] = useState(dateKey(addDays(new Date(), 90)));
  const [bulkPrice, setBulkPrice] = useState('');
  const [weekdays, setWeekdays] = useState<number[]>(WEEKDAYS.map((day) => day.value));

  const from = dateKey(month);
  const to = monthEndKey(month);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/tours/${tour.id}/scheduled-prices`, { params: { from, to } });
      setPrices(new Map((response.data.data as ScheduledPrice[]).map((item) => [item.date, item.price])));
    } catch (error: any) {
      toast.error(extractError(error, 'Planlanmış fiyatlar yüklenemedi.'));
    } finally {
      setLoading(false);
    }
  }, [from, to, tour.id]);

  useEffect(() => { load(); }, [load]);

  const days = useMemo(() => {
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const firstWeekday = (month.getDay() + 6) % 7;
    return [...Array.from({ length: firstWeekday }, () => null), ...Array.from({ length: lastDay }, (_, index) => index + 1)];
  }, [month]);

  function selectDay(day: number) {
    const key = `${month.getFullYear()}-${pad(month.getMonth() + 1)}-${pad(day)}`;
    if (key < todayKey()) return;
    setSelectedDate(key);
    setSelectedPrice(prices.has(key) ? String(prices.get(key)) : '');
  }

  async function saveDay() {
    const price = Number(selectedPrice);
    if (!Number.isFinite(price) || price <= 0) return toast.error('Fiyat sıfırdan büyük olmalı.');
    setSaving(true);
    try {
      await api.put(`/admin/tours/${tour.id}/scheduled-prices/${selectedDate}`, { price });
      toast.success(`${selectedDate} fiyatı kaydedildi.`);
      await load();
    } catch (error: any) {
      toast.error(extractError(error, 'Fiyat kaydedilemedi.'));
    } finally {
      setSaving(false);
    }
  }

  async function resetDay() {
    setSaving(true);
    try {
      await api.delete(`/admin/tours/${tour.id}/scheduled-prices/${selectedDate}`);
      setSelectedPrice('');
      toast.success(`${selectedDate} temel fiyata döndürüldü.`);
      await load();
    } catch (error: any) {
      toast.error(extractError(error, 'Planlanmış fiyat kaldırılamadı.'));
    } finally {
      setSaving(false);
    }
  }

  async function applyBulk() {
    const price = Number(bulkPrice);
    if (!startDate || !endDate || endDate < startDate) return toast.error('Geçerli bir tarih aralığı seçin.');
    if (!Number.isFinite(price) || price <= 0) return toast.error('Fiyat sıfırdan büyük olmalı.');
    if (weekdays.length === 0) return toast.error('En az bir gün seçin.');
    setSaving(true);
    try {
      const response = await api.post(`/admin/tours/${tour.id}/scheduled-prices/bulk`, { startDate, endDate, price, weekdays });
      toast.success(`${response.data.data.count} gün için fiyat planlandı.`);
      await load();
    } catch (error: any) {
      toast.error(extractError(error, 'Toplu fiyat kaydedilemedi.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border p-5 dark:border-white/10">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-bold"><CalendarDays className="h-5 w-5 text-emerald-600" /> Gelecek fiyatları</h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">Buradaki fiyatlar doluluk takviminden bağımsızdır. Tarih geldiğinde tur kartlarında otomatik yayınlanır.</p>
        </div>
        <button type="button" onClick={() => setBulkOpen((value) => !value)} className="rounded-lg border px-3 py-2 text-xs font-semibold dark:border-white/10">
          {bulkOpen ? 'Toplu işlemi kapat' : 'Günlere toplu fiyat ver'}
        </button>
      </div>

      {bulkOpen && (
        <div className="mb-6 rounded-xl bg-gray-50 p-4 dark:bg-white/5">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-gray-500">Başlangıç<input type="date" min={todayKey()} value={startDate} onChange={(event) => setStartDate(event.target.value)} className="input-glass mt-1" /></label>
            <label className="text-xs text-gray-500">Bitiş<input type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} className="input-glass mt-1" /></label>
            <label className="text-xs text-gray-500">Fiyat ({tour.currency})<input type="number" min="0.01" step="0.01" value={bulkPrice} onChange={(event) => setBulkPrice(event.target.value)} placeholder={String(tour.basePrice)} className="input-glass mt-1" /></label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {WEEKDAYS.map((day) => {
                const active = weekdays.includes(day.value);
                return <button type="button" key={day.value} onClick={() => setWeekdays((current) => active ? current.filter((value) => value !== day.value) : [...current, day.value])} className={cn('h-9 min-w-10 rounded-lg border px-2 text-xs font-bold', active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-200 text-gray-500 dark:border-white/10')}>{day.short}</button>;
              })}
            </div>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => setWeekdays([1, 2, 3, 4, 5])} className="font-semibold text-emerald-700 dark:text-emerald-400">Hafta içi</button>
              <button type="button" onClick={() => setWeekdays([6, 0])} className="font-semibold text-emerald-700 dark:text-emerald-400">Hafta sonu</button>
              <button type="button" onClick={applyBulk} disabled={saving} className="rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white disabled:opacity-50">Uygula</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <button type="button" aria-label="Önceki ay" disabled={month <= currentMonth} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-lg border p-2 disabled:opacity-30 dark:border-white/10"><ChevronLeft className="h-4 w-4" /></button>
            <p className="font-semibold capitalize">{month.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</p>
            <button type="button" aria-label="Sonraki ay" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-lg border p-2 dark:border-white/10"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((day) => <div key={day.value} className="pb-1 text-center text-[10px] font-semibold text-gray-400">{day.short}</div>)}
            {days.map((day, index) => {
              if (day == null) return <div key={`empty-${index}`} />;
              const key = `${month.getFullYear()}-${pad(month.getMonth() + 1)}-${pad(day)}`;
              const scheduled = prices.get(key);
              const past = key < todayKey();
              return (
                <button type="button" key={key} disabled={past} onClick={() => selectDay(day)} className={cn('flex min-h-16 flex-col rounded-lg border p-2 text-left transition-colors disabled:opacity-30', selectedDate === key ? 'border-emerald-600 ring-1 ring-emerald-600' : scheduled != null ? 'border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10' : 'border-gray-200 hover:border-emerald-400 dark:border-white/10')}>
                  <span className="text-xs font-bold">{day}</span>
                  <span className={cn('mt-auto text-[10px] font-semibold', scheduled != null ? 'text-amber-700 dark:text-amber-300' : 'text-gray-400')}>{formatPrice(scheduled ?? tour.basePrice, tour.currency)}</span>
                </button>
              );
            })}
          </div>
          {loading && <div className="mt-3 flex items-center gap-2 text-xs text-gray-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Fiyatlar yükleniyor</div>}
        </div>

        <div className="rounded-xl border p-4 dark:border-white/10">
          <p className="text-xs text-gray-500">Seçili gün</p>
          <p className="mt-1 font-bold">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}</p>
          <label className="mt-4 block text-xs text-gray-500">Özel fiyat ({tour.currency})<input type="number" min="0.01" step="0.01" value={selectedPrice} onChange={(event) => setSelectedPrice(event.target.value)} placeholder={String(tour.basePrice)} className="input-glass mt-1" /></label>
          <button type="button" onClick={saveDay} disabled={saving} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Fiyatı kaydet</button>
          {prices.has(selectedDate) && <button type="button" onClick={resetDay} disabled={saving} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold dark:border-white/10"><RotateCcw className="h-4 w-4" /> Temel fiyata dön</button>}
          <p className="mt-3 text-[11px] leading-4 text-gray-400">Temel fiyat: {formatPrice(tour.basePrice, tour.currency)}. Sarı günlerde planlanmış fiyat vardır.</p>
        </div>
      </div>
    </section>
  );
}
