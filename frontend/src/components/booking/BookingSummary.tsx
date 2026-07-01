'use client';

import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { formatPrice, formatDate, getCategoryIcon } from '@/lib/utils';
import { Calendar, Users, Sparkles, MapPin } from 'lucide-react';

export function BookingSummary() {
  const {
    selectedTour,
    selectedDate,
    adults,
    children,
    isPrivate,
    selectedUpsells,
    totalPrice,
  } = useBookingStore();

  if (!selectedTour) return null;

  const unitPrice = selectedTour.basePrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-5"
    >
      <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        Booking Summary
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
          <span className="text-gray-600 dark:text-white/70">{formatDate(selectedDate)}</span>
        </div>
      )}

      {/* People */}
      {(adults > 0 || children > 0) && (
        <div className="flex items-center gap-3 text-sm">
          <Users className="w-4 h-4 text-emerald-400" />
          <span className="text-gray-600 dark:text-white/70">
            {adults} Adult{adults > 1 ? 's' : ''}
            {children > 0 && `, ${children} Child${children > 1 ? 'ren' : ''}`}
            {isPrivate && ' (Private)'}
          </span>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-white/10">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400 dark:text-white/50">
            {adults}x Adult × {formatPrice(unitPrice)}
          </span>
          <span className="text-gray-600 dark:text-white/70">{formatPrice(adults * unitPrice)}</span>
        </div>
        {children > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-white/50">
              {children}x Child × {formatPrice(unitPrice * 0.5)}
            </span>
            <span className="text-white/70">
              {formatPrice(children * unitPrice * 0.5)}
            </span>
          </div>
        )}
        {isPrivate && (
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Private tour upgrade</span>
            <span className="text-white/70">+50%</span>
          </div>
        )}
        {selectedUpsells.map((u) => (
          <div key={u.id} className="flex justify-between text-sm">
            <span className="text-gray-400 dark:text-white/50">{u.name}</span>
            <span className="text-gray-600 dark:text-white/70">{formatPrice(u.price)}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-200 dark:border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-white/60 font-medium">Total</span>
          <motion.span
            key={totalPrice}
            initial={{ scale: 1.2, color: '#34d399' }}
            animate={{ scale: 1, color: 'currentColor' }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {formatPrice(totalPrice)}
          </motion.span>
        </div>
        <p className="text-gray-400 dark:text-white/30 text-xs mt-1 text-right">Taxes included</p>
      </div>

      {/* Mobile Summary Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-dark/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-gray-400 dark:text-white/50 text-xs">Total</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(totalPrice)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
