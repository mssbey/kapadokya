'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useBookingStore } from '@/store/bookingStore';
import { formatPrice, formatDate } from '@/lib/utils';
import { CheckCircle, Download, ArrowRight, PartyPopper, MessageCircle } from 'lucide-react';
import { SITE, whatsappUrl } from '@/lib/site';

export function StepSuccess() {
  const { selectedTour, selectedDate, adults, children, totalPrice, reset } = useBookingStore();
  const [reservationNumber, setReservationNumber] = useState('');
  useEffect(() => setReservationNumber(sessionStorage.getItem('dc_last_booking_id') || ''), []);

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <CheckCircle className="w-14 h-14 text-emerald-400" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Booking Confirmed! <PartyPopper className="inline w-10 h-10" />
        </h1>
        <p className="text-gray-500 dark:text-white/60 text-lg mb-8">
          Payment received. Keep this reservation summary and contact our team if you need pickup assistance.
        </p>
      </motion.div>

      {/* Booking Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-8 text-left mb-8"
      >
        <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Booking Details
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
            <span className="text-gray-500 dark:text-white/50">Reservation Number</span>
            <span className="max-w-[60%] break-all text-right font-mono text-xs text-gray-900 dark:text-white">{reservationNumber || 'Processing'}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
            <span className="text-gray-500 dark:text-white/50">Tour</span>
            <span className="text-gray-900 dark:text-white font-medium">{selectedTour?.title || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
            <span className="text-gray-500 dark:text-white/50">Date</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {selectedDate ? formatDate(selectedDate) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
            <span className="text-gray-500 dark:text-white/50">Guests</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {adults} Adult{adults > 1 ? 's' : ''}
              {children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-500 dark:text-white/50">Total Paid</span>
            <span className="text-2xl font-bold text-emerald-400">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link
          href="/"
          onClick={() => reset()}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          Back to Home
        </Link>
        <button onClick={() => window.print()} className="btn-secondary flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Print / Save Voucher
        </button>
        <a href={whatsappUrl(`Hello, I need help with reservation ${reservationNumber}.`)} target="_blank" rel="noreferrer" data-event="whatsapp_click" className="btn-secondary flex items-center justify-center gap-2"><MessageCircle className="h-5 w-5" /> WhatsApp Support</a>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-gray-400 dark:text-white/30 text-sm mt-8"
      >
        Need help? Contact us at{' '}
        <a href={`mailto:${SITE.email}`} className="text-emerald-400 hover:underline">
          {SITE.email}
        </a>
      </motion.p>
    </div>
  );
}
