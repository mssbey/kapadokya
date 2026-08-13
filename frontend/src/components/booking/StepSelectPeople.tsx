'use client';

import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { cn } from '@/lib/utils';
import { Minus, Plus, Crown } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';

export function StepSelectPeople() {
  const { adults, isPrivate, setPeople, nextStep, prevStep, selectedTour } = useBookingStore();
  const { t, fill } = useI18n();

  const maxCapacity = selectedTour?.maxCapacity || 20;
  function adjustGuests(delta: number) {
    const newVal = Math.max(1, Math.min(adults + delta, maxCapacity));
    setPeople(newVal, isPrivate);
  }

  function togglePrivate() {
    setPeople(adults, !isPrivate);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{t.booking.people.heading}</h2>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-1">{t.booking.people.subtitle}</p>
        </div>
        <button onClick={prevStep} className="glass-button text-sm">
          {t.booking.back}
        </button>
      </div>

      <div className="space-y-4">
        {/* Guests */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{t.booking.people.adults}</h3>
              <p className="text-gray-400 dark:text-white/40 text-sm">{t.booking.people.adultsAge}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => adjustGuests(-1)}
                disabled={adults <= 1}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border transition-all',
                  adults <= 1
                    ? 'border-gray-200 dark:border-white/10 text-gray-300 dark:text-white/20 cursor-not-allowed'
                    : 'border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10'
                )}
              >
                <Minus className="w-4 h-4" />
              </button>
              <motion.span
                key={adults}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-gray-900 dark:text-white w-8 text-center"
              >
                {adults}
              </motion.span>
              <button
                onClick={() => adjustGuests(1)}
                disabled={adults >= maxCapacity}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border transition-all',
                  adults >= maxCapacity
                    ? 'border-gray-200 dark:border-white/10 text-gray-300 dark:text-white/20 cursor-not-allowed'
                    : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                )}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Private Option */}
        <motion.button
          onClick={togglePrivate}
          className={cn(
            'w-full glass-card p-6 text-left transition-all duration-300',
            isPrivate
              ? 'border-gold/50 bg-gold/10'
              : 'hover:border-gray-300 dark:hover:border-white/20'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                isPrivate ? 'bg-gold/20' : 'bg-gray-100 dark:bg-white/5'
              )}>
                <Crown className={cn(
                  'w-6 h-6 transition-colors',
                  isPrivate ? 'text-gold' : 'text-gray-300 dark:text-white/30'
                )} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{t.booking.people.privateTitle}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">
                  {t.booking.people.privateSubtitle}
                </p>
              </div>
            </div>

            {/* Toggle */}
            <div className={cn(
              'w-12 h-7 rounded-full transition-all duration-300 flex items-center px-1',
              isPrivate ? 'bg-gold' : 'bg-gray-200 dark:bg-white/10'
            )}>
              <motion.div
                animate={{ x: isPrivate ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white shadow-md"
              />
            </div>
          </div>
        </motion.button>

        {/* Capacity Info */}
        <p className="text-center text-gray-400 dark:text-white/30 text-sm">
          {fill(t.booking.people.capacity, { count: maxCapacity })}
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={nextStep} className="btn-primary">
          {t.booking.continue}
        </button>
      </div>
    </div>
  );
}
