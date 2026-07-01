'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { cn } from '@/lib/utils';

const steps = [
  { num: 1, label: 'Select Tour' },
  { num: 2, label: 'Pick Date' },
  { num: 3, label: 'Guests' },
  { num: 4, label: 'Extras' },
  { num: 5, label: 'Details' },
  { num: 6, label: 'Payment' },
];

export function StepIndicator() {
  const { step } = useBookingStore();

  return (
    <div className="flex items-center justify-center gap-2 md:gap-0 overflow-x-auto pb-4">
      {steps.map((s, i) => {
        const isActive = step === s.num;
        const isCompleted = step > s.num;

        return (
          <div key={s.num} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? 'rgb(16, 185, 129)'
                    : isActive
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                }}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border',
                  isCompleted
                    ? 'border-emerald-500 text-white'
                    : isActive
                    ? 'border-emerald-500/50 text-emerald-400'
                    : 'border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/30'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : s.num}
              </motion.div>
              <span
                className={cn(
                  'text-xs mt-2 whitespace-nowrap hidden md:block',
                  isActive ? 'text-emerald-400' : isCompleted ? 'text-gray-500 dark:text-white/60' : 'text-gray-400 dark:text-white/30'
                )}
              >
                {s.label}
              </span>
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div className="hidden md:block w-12 lg:w-20 h-[2px] mx-2 mt-[-18px]">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isCompleted ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10'
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
