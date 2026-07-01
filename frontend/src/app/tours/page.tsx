'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Tour } from '@/types';
import { MapPin, Clock, Users, Star, Search, SlidersHorizontal } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const categories = ['ALL', 'BALLOON', 'DAILY_TOUR', 'PRIVATE_TOUR', 'TRANSFER', 'ACTIVITY'];

const categoryLabels: Record<string, string> = {
  ALL: 'All Experiences',
  BALLOON: 'Hot Air Balloon',
  DAILY_TOUR: 'Daily Tours',
  PRIVATE_TOUR: 'Private Tours',
  TRANSFER: 'Transfers',
  ACTIVITY: 'Activities',
};

const fallbackTours: Tour[] = [
  {
    id: '1',
    title: 'Cappadocia Hot Air Balloon Flight',
    slug: 'hot-air-balloon',
    description: 'Sunrise balloon flight over the fairy chimneys of Cappadocia.',
    shortDescription: 'Unforgettable sunrise balloon flight over the fairy chimneys.',
    category: 'BALLOON',
    basePrice: 250,
    duration: 60,
    maxCapacity: 16,
    images: [],
    highlights: ['Sunrise views', 'Champagne toast', 'Flight certificate'],
    includes: ['Hotel pickup', 'Breakfast', 'Insurance'],
    meetingPoint: 'Hotel lobby',
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '2',
    title: 'Red Valley & Göreme Daily Tour',
    slug: 'red-valley-tour',
    description: 'Full-day guided tour of Cappadocia\'s most iconic spots.',
    shortDescription: 'Full-day guided tour of Cappadocia\'s most iconic spots.',
    category: 'DAILY_TOUR',
    basePrice: 75,
    duration: 480,
    maxCapacity: 15,
    images: [],
    highlights: ['Red Valley', 'Göreme Open Air Museum', 'Underground City'],
    includes: ['Lunch', 'Entrance fees', 'Guide'],
    meetingPoint: 'Hotel lobby',
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '3',
    title: 'ATV Quad Safari Adventure',
    slug: 'atv-safari',
    description: 'Thrilling ATV ride through the valleys of Cappadocia.',
    shortDescription: 'Thrilling ATV ride through the valleys.',
    category: 'ACTIVITY',
    basePrice: 60,
    duration: 120,
    maxCapacity: 20,
    images: [],
    highlights: ['Sunset ride', 'Valley trails', 'Photo stops'],
    includes: ['Helmet', 'Goggles', 'Insurance'],
    meetingPoint: 'ATV Base',
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '4',
    title: 'Airport Transfer Service',
    slug: 'airport-transfer',
    description: 'Comfortable private transfer from Kayseri or Nevşehir airport.',
    shortDescription: 'Private transfer from Kayseri or Nevşehir airport.',
    category: 'TRANSFER',
    basePrice: 40,
    duration: 60,
    maxCapacity: 4,
    images: [],
    highlights: ['Meet & greet', 'Comfortable vehicle', 'Flight tracking'],
    includes: ['Water', 'WiFi', 'Child seat on request'],
    meetingPoint: 'Airport arrival gate',
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
];

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [filtered, setFiltered] = useState<Tour[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/tours');
        setTours(res.data.tours || res.data);
      } catch {
        setTours(fallbackTours);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let result = tours;
    if (activeCategory !== 'ALL') {
      result = result.filter((t) => t.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [tours, activeCategory, search]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our <span className="text-emerald-500 dark:text-emerald-400">Experiences</span>
          </h1>
          <p className="text-gray-500 dark:text-white/50 text-lg max-w-2xl mx-auto">
            Discover curated adventures across Cappadocia — from sunrise balloon flights to underground city explorations.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 space-y-4"
        >
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experiences..."
              className="input-glass pl-12 w-full"
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'glass text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tours Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-48 bg-gray-100 dark:bg-white/5 rounded-xl mb-4" />
                <div className="h-6 bg-gray-100 dark:bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-full mb-4" />
                <div className="h-10 bg-gray-100 dark:bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <SlidersHorizontal className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-white/40 text-lg">No experiences found matching your criteria.</p>
            <button
              onClick={() => {
                setActiveCategory('ALL');
                setSearch('');
              }}
              className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/booking?tour=${tour.id}`}>
                    <div className="glass-card group cursor-pointer overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
                      {/* Image placeholder */}
                      <div className="relative h-52 bg-gradient-to-br from-emerald-500/10 to-emerald-700/10 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-dark-100 to-transparent z-10" />
                        <MapPin className="w-16 h-16 text-emerald-500/20 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 z-20 bg-emerald-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {categoryLabels[tour.category] || tour.category}
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                          {tour.title}
                        </h3>
                        <p className="text-gray-500 dark:text-white/50 text-sm mb-4 line-clamp-2">
                          {tour.shortDescription}
                        </p>

                        <div className="flex items-center gap-4 text-gray-400 dark:text-white/40 text-sm mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {tour.duration >= 60
                              ? `${Math.floor(tour.duration / 60)}h${tour.duration % 60 > 0 ? ` ${tour.duration % 60}m` : ''}`
                              : `${tour.duration}m`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Up to {tour.maxCapacity}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-gold" />
                            4.9
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-400 dark:text-white/40 text-xs">From</span>
                            <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                              {formatCurrency(tour.basePrice)}
                            </p>
                          </div>
                          <span className="btn-primary text-sm !py-2 !px-5">
                            Book Now
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
