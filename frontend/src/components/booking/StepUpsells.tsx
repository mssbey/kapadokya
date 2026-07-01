'use client';

import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { formatPrice, cn } from '@/lib/utils';
import { Camera, Crown, Car, Check, Sparkles } from 'lucide-react';

const defaultUpsells = [
  {
    id: 'photo-pkg',
    name: 'Professional Photography Package',
    description: 'Professional photographer captures your experience with 50+ edited photos delivered digitally',
    price: 75,
    icon: '📸',
    lucideIcon: Camera,
  },
  {
    id: 'vip-pkg',
    name: 'VIP Package',
    description: 'Smaller group (max 8), extended duration, premium champagne celebration, priority boarding',
    price: 150,
    icon: '👑',
    lucideIcon: Crown,
  },
  {
    id: 'transfer-pkg',
    name: 'Hotel Transfer (Round Trip)',
    description: 'Private comfortable vehicle pickup from and return to your hotel door',
    price: 25,
    icon: '🚗',
    lucideIcon: Car,
  },
];

export function StepUpsells() {
  const { selectedTour, selectedUpsells, toggleUpsell, nextStep, prevStep } = useBookingStore();

  const upsells = selectedTour?.upsells?.length
    ? selectedTour.upsells.map((u) => ({
        ...u,
        lucideIcon: u.name.includes('Photo') ? Camera : u.name.includes('VIP') ? Crown : Car,
      }))
    : defaultUpsells;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold" />
            Enhance Your Experience
          </h2>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-1">Optional add-ons to make it extra special</p>
        </div>
        <button onClick={prevStep} className="glass-button text-sm">
          ← Back
        </button>
      </div>

      <div className="space-y-4">
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
                  +{formatPrice(upsell.price)}
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
          Skip this step →
        </button>
        <button onClick={nextStep} className="btn-primary">
          Continue →
        </button>
      </div>
    </div>
  );
}
