'use client';

import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { formatPrice, formatDate, getCategoryIcon } from '@/lib/utils';
import { Calendar, Users, Sparkles } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { useGuestLabel } from '@/components/booking/useGuestLabel';

export function BookingSummary() {
  const {
    selectedTour,
    selectedDate,
    selectedAvailability,
    adults,
    isPrivate,
    selectedUpsells,
    totalPrice,
  } = useBookingStore();
  const { t, tag, fill } = useI18n();
  const guestLabel = useGuestLabel();

  if (!selectedTour) return null;

  const unitPrice = selectedAvailability?.priceOverride ?? selectedTour.basePrice;
  const currency = selectedTour.currency || 'EUR';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-5"
    >
      <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        {t.booking.summary.title}
      </h3>

      {/* Tour */}
      <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-white/10">
        <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
          {getCategoryIcon(selectedTour.category)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{selectedTour.title}</h4>
          <p className="text-gray-400 dark:text-white/40 text-xs mt-1">{selectedTour.duration}</p>
        </div>
      </div>

      {/* Date */}
      {selectedDate && (
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-gray-600 dark:text-white/70">{formatDate(selectedDate, tag)}</span>
        </div>
      )}

      {/* People */}
      {adults > 0 && (
        <div className="flex items-center gap-3 text-sm">
          <Users className="w-4 h-4 text-emerald-400" />
          <span className="text-gray-600 dark:text-white/70">{guestLabel(adults, isPrivate)}</span>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-white/10">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400 dark:text-white/50">
            {fill(t.booking.summary.adultsLine, { count: adults, price: formatPrice(unitPrice, currency, tag) })}
          </span>
          <span className="text-gray-600 dark:text-white/70">{formatPrice(adults * unitPrice, currency, tag)}</span>
        </div>
        {isPrivate && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 dark:text-white/50">{t.booking.summary.privateUpgrade}</span>
            <span className="text-gray-600 dark:text-white/70">×{selectedTour.privatePriceMultiplier ?? 1.5}</span>
          </div>
        )}
        {selectedUpsells.map((u) => (
          <div key={u.id} className="flex justify-between text-sm">
            <span className="text-gray-400 dark:text-white/50">{u.name}</span>
            <span className="text-gray-600 dark:text-white/70">{formatPrice(u.price, currency, tag)}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-200 dark:border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-white/60 font-medium">{t.booking.summary.total}</span>
          <motion.span
            key={totalPrice}
            initial={{ scale: 1.2, color: '#34d399' }}
            animate={{ scale: 1, color: 'currentColor' }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {formatPrice(totalPrice, currency, tag)}
          </motion.span>
        </div>
        <p className="text-gray-400 dark:text-white/30 text-xs mt-1 text-right">{t.booking.summary.taxesIncluded}</p>
      </div>

      {/* Mobile Summary Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-dark/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-gray-400 dark:text-white/50 text-xs">{t.booking.summary.total}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(totalPrice, currency, tag)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
