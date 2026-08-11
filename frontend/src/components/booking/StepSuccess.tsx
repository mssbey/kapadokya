'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useBookingStore } from '@/store/bookingStore';
import { formatPrice, formatDate } from '@/lib/utils';
import { CheckCircle, Download, ArrowRight, PartyPopper, MessageCircle } from 'lucide-react';
import { SITE, whatsappUrl } from '@/lib/site';
import { useI18n } from '@/components/I18nProvider';
import { useGuestLabel } from '@/components/booking/useGuestLabel';

export function StepSuccess() {
  const { selectedTour, selectedDate, adults, children, totalPrice, reset } = useBookingStore();
  const { t, tag, href, fill } = useI18n();
  const guestLabel = useGuestLabel();
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
          {t.booking.success.heading} <PartyPopper className="inline w-10 h-10" />
        </h1>
        <p className="text-gray-500 dark:text-white/60 text-lg mb-8">
          {t.booking.success.subtitle}
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
          {t.booking.success.detailsTitle}
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
            <span className="text-gray-500 dark:text-white/50">{t.booking.success.reservationNumber}</span>
            <span className="max-w-[60%] break-all text-right font-mono text-xs text-gray-900 dark:text-white">{reservationNumber || t.booking.success.processing}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
            <span className="text-gray-500 dark:text-white/50">{t.booking.success.tour}</span>
            <span className="text-gray-900 dark:text-white font-medium">{selectedTour?.title || '—'}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
            <span className="text-gray-500 dark:text-white/50">{t.booking.success.date}</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {selectedDate ? formatDate(selectedDate, tag) : '—'}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
            <span className="text-gray-500 dark:text-white/50">{t.booking.success.guests}</span>
            <span className="text-gray-900 dark:text-white font-medium">{guestLabel(adults, children)}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-500 dark:text-white/50">{t.booking.success.totalPaid}</span>
            <span className="text-2xl font-bold text-emerald-400">
              {formatPrice(totalPrice, 'EUR', tag)}
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
          href={href('/')}
          onClick={() => reset()}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          {t.booking.success.backHome}
        </Link>
        <button onClick={() => window.print()} className="btn-secondary flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          {t.booking.success.printVoucher}
        </button>
        <a href={whatsappUrl(fill(t.booking.success.whatsappMessage, { number: reservationNumber }))} target="_blank" rel="noreferrer" data-event="whatsapp_click" className="btn-secondary flex items-center justify-center gap-2"><MessageCircle className="h-5 w-5" /> {t.booking.success.whatsappSupport}</a>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-gray-400 dark:text-white/30 text-sm mt-8"
      >
        {t.booking.success.needHelp}{' '}
        <a href={`mailto:${SITE.email}`} className="text-emerald-400 hover:underline">
          {SITE.email}
        </a>
      </motion.p>
    </div>
  );
}
