'use client';

import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { formatPrice, cn } from '@/lib/utils';
import { Camera, Check, Sparkles } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';

// VIP Package and Hotel Transfer are included free of charge, so they are never
// offered as paid add-ons — filtered out even if they still exist in the database.
const retiredUpsells = ['vip', 'transfer'];
const isRetired = (name: string) =>
  retiredUpsells.some((k) => name.toLowerCase().includes(k));

export function StepUpsells() {
  const { selectedTour, selectedUpsells, toggleUpsell, nextStep, prevStep } = useBookingStore();
  const { t, tag } = useI18n();

  // Add-ons defined in the backend keep their stored wording; only the built-in
  // fallback is translated.
  const defaultUpsells = [
    {
      id: 'photo-pkg',
      name: t.booking.upsells.defaultName,
      description: t.booking.upsells.defaultDescription,
      price: 75,
      icon: '📸',
      lucideIcon: Camera,
    },
  ];

  const upsells = (
    selectedTour?.upsells?.length
      ? selectedTour.upsells.map((u) => ({ ...u, lucideIcon: Camera }))
      : defaultUpsells
  ).filter((u) => !isRetired(u.name));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold" />
            {t.booking.upsells.heading}
          </h2>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-1">{t.booking.upsells.subtitle}</p>
        </div>
        <button onClick={prevStep} className="glass-button text-sm">
          {t.booking.back}
        </button>
      </div>

      <div className="space-y-4">
        {upsells.length === 0 && (
          <div className="glass-card p-6 text-center text-gray-500 dark:text-white/50 text-sm">
            {t.booking.upsells.empty}
          </div>
        )}
        {upsells.map((upsell, i) => {
          const isSelected = selectedUpsells.some((u) => u.id === upsell.id);
          const Icon = upsell.lucideIcon;

          return (
            <motion.button
              key={upsell.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() =>
                toggleUpsell({
                  id: upsell.id,
                  name: upsell.name,
                  price: upsell.price,
                })
              }
              className={cn(
                'w-full text-left glass-card p-5 flex items-start gap-4 transition-all duration-300',
                isSelected
                  ? 'border-emerald-500/50 bg-emerald-500/10 shadow-glow-emerald'
                  : 'hover:border-gray-300 dark:hover:border-white/20'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected ? 'bg-emerald-500/20' : 'bg-gray-100 dark:bg-white/5'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors',
                    isSelected ? 'text-emerald-400' : 'text-gray-400 dark:text-white/40'
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">{upsell.name}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-1">{upsell.description}</p>
              </div>

              {/* Price + Check */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  +{formatPrice(upsell.price, 'EUR', tag)}
                </span>
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-gray-300 dark:border-white/20'
                  )}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={nextStep}
          className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
        >
          {t.booking.upsells.skip}
        </button>
        <button onClick={nextStep} className="btn-primary">
          {t.booking.continue}
        </button>
      </div>
    </div>
  );
}
