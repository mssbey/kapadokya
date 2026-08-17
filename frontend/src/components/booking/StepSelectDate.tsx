'use client';

import { useState, useEffect, useMemo } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { api } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import type { Availability } from '@/types';

export function StepSelectDate() {
  const { selectedTour, selectedDate, setDate, selectedVariant, setVariant, nextStep, prevStep } = useBookingStore();
  const { t, tag } = useI18n();
  const variants = useMemo(() => (selectedTour?.variants ?? []).filter((v) => v.isActive), [selectedTour]);
  const DAYS = t.booking.date.days;
  const MONTHS = t.booking.date.months;
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!selectedTour) return;

    async function fetchAvailability() {
      setLoading(true);
      setError(false);
      try {
        const res = await api.get(`/availability/${selectedTour!.id}`, {
          params: { month: currentMonth + 1, year: currentYear },
        });
        setAvailabilities(res.data.data);
      } catch {
        setAvailabilities([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [selectedTour, currentMonth, currentYear]);

  const availabilityMap = useMemo(() => {
    const map = new Map<string, Availability>();
    availabilities.forEach((a) => {
      const dateStr = new Date(a.date).toISOString().split('T')[0];
      map.set(dateStr, a);
    });
    return map;
  }, [availabilities]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return days;
  }, [currentMonth, currentYear]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function handleDateSelect(day: number) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const avail = availabilityMap.get(dateStr);

    if (!avail || avail.seatsAvailable <= 0) return;

    setDate(dateStr, avail);
  }

  const canContinue = Boolean(selectedDate) && (variants.length === 0 || Boolean(selectedVariant));

  function handleContinue() {
    if (canContinue) nextStep();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{t.booking.date.heading}</h2>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-1">{t.booking.date.subtitle}</p>
        </div>
        <button onClick={prevStep} className="glass-button text-sm">
          {t.booking.back}
        </button>
      </div>

      <div className="glass-card p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 dark:text-white/30 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-amber-700 dark:text-amber-300"><AlertTriangle className="h-8 w-8" /><p>Live availability could not be loaded. No estimated dates are shown.</p></div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="aspect-square" />;
              }

              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const date = new Date(currentYear, currentMonth, day);
              const isPast = date < today;
              const avail = availabilityMap.get(dateStr);
              const isAvailable = avail && avail.seatsAvailable > 0 && !isPast;
              const isSelected = selectedDate === dateStr;
              const isLow = avail && avail.seatsAvailable <= 5 && avail.seatsAvailable > 0;
              const price = avail?.priceOverride ?? selectedTour?.basePrice ?? 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => isAvailable && handleDateSelect(day)}
                  disabled={!isAvailable}
                  className={cn(
                    'aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative text-sm',
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-glow-emerald'
                      : isAvailable
                      ? 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white cursor-pointer'
                      : 'text-gray-300 dark:text-white/15 cursor-not-allowed',
                    isPast && 'opacity-30'
                  )}
                >
                  <span className="font-medium">{day}</span>
                  {isAvailable && !isSelected && (
                    <span className="text-[9px] text-emerald-400/70 mt-0.5">
                      {formatPrice(price, selectedTour?.currency || 'EUR', tag)}
                    </span>
                  )}
                  {isLow && !isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-white/10 text-xs text-gray-400 dark:text-white/40">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            {t.booking.date.selected}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            {t.booking.date.lowAvailability}
          </div>
        </div>
      </div>

      {/* Route / class options — only shown once a date is picked, mirroring
          how these appear on the reference site: they surface alongside the
          availability check rather than as their own wizard step. */}
      {selectedDate && variants.length > 0 && (
        <div className="glass-card mt-6 p-6">
          <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">{t.booking.variants.heading}</h3>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-1">{t.booking.variants.subtitle}</p>
          <div className="mt-4 space-y-3">
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setVariant({ id: variant.id, name: variant.name, priceDelta: variant.priceDelta })}
                  className={cn(
                    'w-full text-left glass-card p-4 flex items-start gap-4 transition-all duration-300',
                    isSelected
                      ? 'border-emerald-500/50 bg-emerald-500/10 shadow-glow-emerald'
                      : 'hover:border-gray-300 dark:hover:border-white/20'
                  )}
                >
                  {variant.icon && <span className="text-2xl leading-none flex-shrink-0">{variant.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{variant.name}</h4>
                    {variant.description && <p className="text-gray-400 dark:text-white/40 text-sm mt-1">{variant.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {variant.priceDelta !== 0 && (
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {variant.priceDelta > 0 ? '+' : ''}{formatPrice(variant.priceDelta, selectedTour?.currency || 'EUR', tag)}
                      </span>
                    )}
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                        isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-white/20'
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={cn(
            'btn-primary',
            !canContinue && 'opacity-50 cursor-not-allowed'
          )}
        >
          {t.booking.continue}
        </button>
      </div>
    </div>
  );
}
