'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, Users, Star, ArrowRight } from 'lucide-react';
import { cn, formatPrice, getCategoryIcon } from '@/lib/utils';

const experiences = [
  {
    id: 'balloon',
    title: 'Hot Air Balloon Flight',
    description:
      'Soar above fairy chimneys at sunrise. An unforgettable flight over the stunning Cappadocian landscape with champagne celebration.',
    price: 250,
    duration: '3-4 hours',
    rating: 4.9,
    reviews: 2847,
    capacity: '20 guests',
    image: 'https://images.unsplash.com/photo-1507041957456-9c397ce39c97?w=800&q=80',
    videoPreview: 'https://images.unsplash.com/photo-1526048598645-62b31f82b8f5?w=800&q=80',
    category: 'BALLOON',
    slug: 'hot-air-balloon-flight',
    badge: 'Most Popular',
    gradient: 'from-orange-500/20 to-rose-500/20',
  },
  {
    id: 'daily',
    title: 'Full Day Cappadocia Tour',
    description:
      'Explore underground cities, ancient cave churches, and dramatic valleys with an expert guide. All-inclusive cultural immersion.',
    price: 75,
    duration: '8-10 hours',
    rating: 4.8,
    reviews: 1653,
    capacity: '15 guests',
    image: 'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=800&q=80',
    videoPreview: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800&q=80',
    category: 'DAILY_TOUR',
    slug: 'full-day-cappadocia-tour',
    badge: 'Best Value',
    gradient: 'from-blue-500/20 to-purple-500/20',
  },
  {
    id: 'atv',
    title: 'ATV Quad Safari',
    description:
      'Adrenaline-pumping ride through valleys and fairy chimneys. Navigate stunning terrain on powerful quad bikes with expert guides.',
    price: 60,
    duration: '2-3 hours',
    rating: 4.7,
    reviews: 892,
    capacity: '10 riders',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    videoPreview: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    category: 'ADVENTURE',
    slug: 'atv-quad-safari',
    badge: 'Thrilling',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: 'transfer',
    title: 'Private VIP Transfer',
    description:
      'Luxury private transfer between airport and hotel. Professional driver, comfortable vehicle, and 24/7 availability.',
    price: 40,
    duration: '45-60 min',
    rating: 4.9,
    reviews: 3210,
    capacity: '6 passengers',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    videoPreview: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    category: 'TRANSFER',
    slug: 'private-transfer',
    badge: '24/7',
    gradient: 'from-gold/20 to-amber-500/20',
  },
];

export function ExperiencesSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section id="experiences" className="py-24 md:py-32 relative overflow-hidden isolate">
      {/* Background Effects */}
      <div
        className="absolute inset-0 -z-30 bg-cover bg-center bg-fixed scale-[1.03]"
        style={{ backgroundImage: "url('/images/cappadocia-rose-valley-section.png')" }}
      />
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-white/95 via-orange-50/88 to-white/96 dark:from-dark/96 dark:via-[#15110f]/88 dark:to-dark/96" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(251,191,36,0.11),transparent_48%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/45 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[130px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-emerald-500 dark:text-emerald-400 text-sm font-medium uppercase tracking-widest mb-4 block">
            Curated Experiences
          </span>
          <h2 className="section-heading mb-6">
            Extraordinary Adventures Await
          </h2>
          <p className="section-subheading mx-auto">
            From sunrise balloon flights to underground city explorations, discover
            Cappadocia&apos;s most magical experiences.
          </p>
        </motion.div>

        {/* Experience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              onMouseEnter={() => setHoveredId(exp.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative overflow-hidden rounded-3xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-black/35 backdrop-blur-xl transition-all duration-700 hover:-translate-y-2 hover:border-emerald-500/30 hover:shadow-[0_30px_70px_-30px_rgba(6,78,59,0.5)]"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={hoveredId === exp.id ? exp.videoPreview : exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-t from-white dark:from-dark via-white/30 dark:via-dark/30 to-transparent',
                  'group-hover:from-white/90 dark:group-hover:from-dark/90 group-hover:via-white/40 dark:group-hover:via-dark/40 transition-all duration-500'
                )} />

                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className="badge-emerald text-xs">
                    {getCategoryIcon(exp.category)} {exp.badge}
                  </span>
                </div>

                {/* Price */}
                <div className="absolute top-4 right-4 text-right">
                  <div className="text-sm text-gray-500 dark:text-white/60">from</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(exp.price)}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  {exp.title}
                </h3>
                <p className="text-gray-500 dark:text-white/50 text-sm leading-relaxed mb-4">
                  {exp.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-white/40 mb-5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {exp.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {exp.capacity}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-gold" />
                    {exp.rating} ({exp.reviews.toLocaleString()})
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/booking?tour=${exp.slug}`}
                  className="flex items-center justify-between w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:border-emerald-300 dark:group-hover:border-emerald-500/30 transition-all duration-300"
                >
                  <span className="font-medium text-gray-600 dark:text-white/80 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Book This Experience
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-white/40 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
