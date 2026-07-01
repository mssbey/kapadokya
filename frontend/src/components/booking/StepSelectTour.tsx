'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/bookingStore';
import { api } from '@/lib/api';
import { formatPrice, getCategoryIcon } from '@/lib/utils';
import { Clock, Users, Star, ArrowRight, Loader2 } from 'lucide-react';
import type { Tour } from '@/types';

export function StepSelectTour() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const { setTour, nextStep, selectedTour } = useBookingStore();

  useEffect(() => {
    async function fetchTours() {
      try {
        const res = await api.get('/tours');
        setTours(res.data.data);
      } catch {
        // Fallback data for demo
        setTours([
          {
            id: '1',
            title: 'Cappadocia Hot Air Balloon Flight',
            slug: 'hot-air-balloon-flight',
            description: 'Experience the magic of Cappadocia from above with our premium hot air balloon flight.',
            shortDesc: 'Sunrise balloon flight over fairy chimneys with champagne toast',
            category: 'BALLOON',
            basePrice: 250,
            currency: 'USD',
            duration: '3-4 hours',
            maxCapacity: 20,
            images: [],
            highlights: [],
            includes: [],
            excludes: [],
            isActive: true,
            sortOrder: 1,
            upsells: [],
          },
          {
            id: '2',
            title: 'Full Day Cappadocia Tour',
            slug: 'full-day-cappadocia-tour',
            description: 'Discover the most remarkable sights of Cappadocia in a single day.',
            shortDesc: 'Complete Cappadocia exploration with expert guide',
            category: 'DAILY_TOUR',
            basePrice: 75,
            currency: 'USD',
            duration: '8-10 hours',
            maxCapacity: 15,
            images: [],
            highlights: [],
            includes: [],
            excludes: [],
            isActive: true,
            sortOrder: 2,
            upsells: [],
          },
          {
            id: '3',
            title: 'ATV Quad Safari Adventure',
            slug: 'atv-quad-safari',
            description: 'Adrenaline-pumping ride through the dramatic landscapes of Cappadocia.',
            shortDesc: 'Thrilling ATV ride through valleys and fairy chimneys',
            category: 'ADVENTURE',
            basePrice: 60,
            currency: 'USD',
            duration: '2-3 hours',
            maxCapacity: 10,
            images: [],
            highlights: [],
            includes: [],
            excludes: [],
            isActive: true,
            sortOrder: 3,
            upsells: [],
          },
          {
            id: '4',
            title: 'Private Airport/Hotel Transfer',
            slug: 'private-transfer',
            description: 'Comfortable private transfer with professional driver.',
            shortDesc: 'Comfortable private transfer with professional driver',
            category: 'TRANSFER',
            basePrice: 40,
            currency: 'USD',
            duration: '45-60 min',
            maxCapacity: 6,
            images: [],
            highlights: [],
            includes: [],
            excludes: [],
            isActive: true,
            sortOrder: 4,
            upsells: [],
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchTours();
  }, []);

  function handleSelect(tour: Tour) {
    setTour(tour);
    nextStep();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Choose Your Experience
      </h2>

      {tours.map((tour, i) => (
        <motion.button
          key={tour.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => handleSelect(tour)}
          className={`w-full text-left glass-card p-5 md:p-6 flex items-center gap-5 group transition-all duration-300 ${
            selectedTour?.id === tour.id
              ? 'border-emerald-500/50 bg-emerald-500/10'
              : 'hover:border-white/20'
          }`}
        >
          <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
            {getCategoryIcon(tour.category)}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
              {tour.title}
            </h3>
            <p className="text-gray-500 dark:text-white/50 text-sm mt-1 truncate">{tour.shortDesc}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-white/40">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {tour.duration}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Up to {tour.maxCapacity}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-gold" />
                4.9
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-400 dark:text-white/40">from</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
              {formatPrice(tour.basePrice)}
            </div>
            <div className="text-xs text-gray-400 dark:text-white/30">per person</div>
          </div>

          <ArrowRight className="w-5 h-5 text-gray-300 dark:text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </motion.button>
      ))}
    </div>
  );
}
