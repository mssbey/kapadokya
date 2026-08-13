'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { cn } from '@/lib/utils';
import { Building2, User, Mail, Phone, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';

export function StepUserInfo() {
  const { guestName, guestEmail, guestPhone, hotelName, notes, setGuestInfo, nextStep, prevStep } = useBookingStore();
  const { t, href } = useI18n();
  const [localName, setLocalName] = useState(guestName);
  const [localEmail, setLocalEmail] = useState(guestEmail);
  const [localPhone, setLocalPhone] = useState(guestPhone);
  const [localHotelName, setLocalHotelName] = useState(hotelName);
  const [localNotes, setLocalNotes] = useState(notes);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!localName.trim() || localName.trim().length < 2) {
      errs.name = t.booking.userInfo.errorName;
    }
    if (!localEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail)) {
      errs.email = t.booking.userInfo.errorEmail;
    }
    if (!localPhone.trim() || localPhone.trim().length < 5) {
      errs.phone = t.booking.userInfo.errorPhone;
    }
    if (!localHotelName.trim() || localHotelName.trim().length < 2) {
      errs.hotelName = t.booking.userInfo.errorHotelName;
    }
    if (!consent) errs.consent = t.booking.userInfo.errorConsent;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleContinue() {
    if (validate()) {
      setGuestInfo(localName.trim(), localEmail.trim(), localPhone.trim(), localHotelName.trim(), localNotes.trim());
      nextStep();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{t.booking.userInfo.heading}</h2>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-1">{t.booking.userInfo.subtitle}</p>
        </div>
        <button onClick={prevStep} className="glass-button text-sm">
          {t.booking.back}
        </button>
      </div>

      <div className="glass-card p-6 space-y-5">
        {/* Full Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
            <User className="w-4 h-4 text-emerald-400" />
            {t.booking.userInfo.fullName}
          </label>
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder={t.booking.userInfo.fullNamePlaceholder}
            className={cn('input-glass', errors.name && 'border-red-500/50 focus:border-red-500/50')}
          />
          {errors.name && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-1">
              {errors.name}
            </motion.p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
            <Mail className="w-4 h-4 text-emerald-400" />
            {t.booking.userInfo.email}
          </label>
          <input
            type="email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            placeholder={t.booking.userInfo.emailPlaceholder}
            className={cn('input-glass', errors.email && 'border-red-500/50 focus:border-red-500/50')}
          />
          {errors.email && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-1">
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            {t.booking.userInfo.phone}
          </label>
          <input
            type="tel"
            value={localPhone}
            onChange={(e) => setLocalPhone(e.target.value)}
            placeholder={t.booking.userInfo.phonePlaceholder}
            className={cn('input-glass', errors.phone && 'border-red-500/50 focus:border-red-500/50')}
          />
          {errors.phone && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-1">
              {errors.phone}
            </motion.p>
          )}
        </div>

        {/* Hotel */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            {t.booking.userInfo.hotelName}
          </label>
          <input
            type="text"
            value={localHotelName}
            onChange={(e) => setLocalHotelName(e.target.value)}
            placeholder={t.booking.userInfo.hotelNamePlaceholder}
            autoComplete="organization"
            className={cn('input-glass', errors.hotelName && 'border-red-500/50 focus:border-red-500/50')}
          />
          {errors.hotelName && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-1">
              {errors.hotelName}
            </motion.p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            {t.booking.userInfo.notes}
          </label>
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder={t.booking.userInfo.notesPlaceholder}
            rows={3}
            className="input-glass resize-none"
          />
        </div>

        <p className="text-gray-400 dark:text-white/30 text-xs">{t.booking.userInfo.requiredNote}</p>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 text-sm dark:border-white/10">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 accent-emerald-600" />
          <span className="text-gray-600 dark:text-white/60">
            {t.booking.userInfo.consentPrefix}{' '}
            <Link href={href('/legal/privacy')} target="_blank" className="underline">{t.booking.userInfo.consentPrivacy}</Link>
            {t.booking.userInfo.consentMiddle}{' '}
            <Link href={href('/legal/kvkk')} target="_blank" className="underline">{t.booking.userInfo.consentKvkk}</Link>{' '}
            {t.booking.userInfo.consentSuffix}
          </span>
        </label>
        {errors.consent && <p className="text-xs text-red-500">{errors.consent}</p>}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleContinue} className="btn-primary">
          {t.booking.userInfo.continueToPayment}
        </button>
      </div>
    </div>
  );
}
