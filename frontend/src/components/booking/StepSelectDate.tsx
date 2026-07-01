'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { api } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Availability } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function StepSelectDate() {
  const { selectedTour, selectedDate, setDate, nextStep, prevStep } = useBookingStore();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedTour) return;

    async function fetchAvailability() {
      setLoading(true);
      try {
        const res = await api.get(`/availability/${selectedTour!.id}`, {
          params: { month: currentMonth + 1, year: currentYear },
        });
        setAvailabilities(res.data.data);
      } catch {
        // Generate demo availability
        const demoAvail: Availability[] = [];
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const today = new Date();

        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(currentYear, currentMonth, d);
          if (date < today) continue;

          const seatsTotal = selectedTour!.maxCapacity;
          const seatsAvailable = Math.floor(Math.random() * seatsTotal) + 1;
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          demoAvail.push({
            id: `demo-${d}`,
            tourId: selectedTour!.id,
            date: date.toISOString().split('T')[0],
            seatsAvailable,
            seatsTotal,
            priceOverride: isWeekend ? selectedTour!.basePrice * 1.2 : null,
            isBlocked: false,
          });
        }
        setAvailabilities(demoAvail);
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

  function handleContinue() {
    if (selectedDate) nextStep();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Select Date</h2>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-1">Choose your preferred travel date</p>
        </div>
        <button onClick={prevStep} className="glass-button text-sm">
          ← Back
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
        {loading ? (
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
              const price = avail?.priceOverride || selectedTour?.basePrice || 0;

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
                      {formatPrice(price)}
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
            Selected
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Low availability
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selectedDate}
          className={cn(
            'btn-primary',
            !selectedDate && 'opacity-50 cursor-not-allowed'
          )}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
