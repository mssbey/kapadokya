'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { cn } from '@/lib/utils';
import { User, Mail, Phone, MessageSquare } from 'lucide-react';

export function StepUserInfo() {
  const { guestName, guestEmail, guestPhone, notes, setGuestInfo, nextStep, prevStep } = useBookingStore();
  const [localName, setLocalName] = useState(guestName);
  const [localEmail, setLocalEmail] = useState(guestEmail);
  const [localPhone, setLocalPhone] = useState(guestPhone);
  const [localNotes, setLocalNotes] = useState(notes);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!localName.trim() || localName.trim().length < 2) {
      errs.name = 'Please enter your full name';
    }
    if (!localEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!localPhone.trim() || localPhone.trim().length < 5) {
      errs.phone = 'Please enter a valid phone number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleContinue() {
    if (validate()) {
      setGuestInfo(localName.trim(), localEmail.trim(), localPhone.trim(), localNotes.trim());
      nextStep();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Your Information</h2>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-1">We&apos;ll use this to confirm your booking</p>
        </div>
        <button onClick={prevStep} className="glass-button text-sm">
          ← Back
        </button>
      </div>

      <div className="glass-card p-6 space-y-5">
        {/* Full Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
            <User className="w-4 h-4 text-emerald-400" />
            Full Name *
          </label>
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="John Doe"
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
            Email Address *
          </label>
          <input
            type="email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            placeholder="john@example.com"
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
            Phone Number *
          </label>
          <input
            type="tel"
            value={localPhone}
            onChange={(e) => setLocalPhone(e.target.value)}
            placeholder="+90 555 000 0000"
            className={cn('input-glass', errors.phone && 'border-red-500/50 focus:border-red-500/50')}
          />
          {errors.phone && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-1">
              {errors.phone}
            </motion.p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Special Requests (Optional)
          </label>
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Any special requirements or requests..."
            rows={3}
            className="input-glass resize-none"
          />
        </div>

        <p className="text-gray-400 dark:text-white/30 text-xs">
          * Required fields. Your information is secure and will only be used for booking purposes.
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleContinue} className="btn-primary">
          Continue to Payment →
        </button>
      </div>
    </div>
  );
}
