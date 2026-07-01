'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { StepIndicator } from '@/components/booking/StepIndicator';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { StepSelectTour } from '@/components/booking/StepSelectTour';
import { StepSelectDate } from '@/components/booking/StepSelectDate';
import { StepSelectPeople } from '@/components/booking/StepSelectPeople';
import { StepUpsells } from '@/components/booking/StepUpsells';
import { StepUserInfo } from '@/components/booking/StepUserInfo';
import { StepPayment } from '@/components/booking/StepPayment';
import { StepSuccess } from '@/components/booking/StepSuccess';

function BookingContent() {
  const searchParams = useSearchParams();
  const { step } = useBookingStore();

  const steps: Record<number, React.ReactNode> = {
    1: <StepSelectTour />,
    2: <StepSelectDate />,
    3: <StepSelectPeople />,
    4: <StepUpsells />,
    5: <StepUserInfo />,
    6: <StepPayment />,
    7: <StepSuccess />,
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {step < 7 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Book Your Experience
            </h1>
            <p className="text-gray-500 dark:text-white/60 text-lg max-w-xl mx-auto">
              Complete your booking in just a few steps
            </p>
          </motion.div>
        )}

        {/* Step Indicator */}
        {step < 7 && <StepIndicator />}

        {/* Content Grid */}
        <div className={`mt-10 ${step < 7 ? 'lg:grid lg:grid-cols-3 lg:gap-8' : ''}`}>
          {/* Main Content */}
          <div className={step < 7 ? 'lg:col-span-2' : ''}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {steps[step]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky Summary */}
          {step >= 2 && step < 7 && (
            <div className="hidden lg:block">
              <div className="sticky top-28">
                <BookingSummary />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
