'use client';

import { motion } from 'framer-motion';
import { Star, Quote, Shield, Award, Clock, CheckCircle } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'New York, USA',
    text: 'The balloon ride was absolutely magical. Watching the sunrise over the fairy chimneys was a once-in-a-lifetime experience. The team was professional and made us feel safe throughout.',
    rating: 5,
    avatar: 'S',
    tourType: 'Hot Air Balloon',
  },
  {
    name: 'Marco Rossi',
    location: 'Milan, Italy',
    text: 'Best tour company in Cappadocia! The full day tour covered everything and our guide was incredibly knowledgeable. The underground city was mind-blowing.',
    rating: 5,
    avatar: 'M',
    tourType: 'Full Day Tour',
  },
  {
    name: 'Yuki Tanaka',
    location: 'Tokyo, Japan',
    text: 'From booking to the actual experience, everything was seamless. The ATV tour was thrilling and the views were breathtaking. Highly recommend!',
    rating: 5,
    avatar: 'Y',
    tourType: 'ATV Safari',
  },
  {
    name: 'Emma Wilson',
    location: 'London, UK',
    text: 'I\'ve traveled extensively but Cappadocia with Discovery was truly special. The VIP balloon package was worth every penny. The champagne toast at sunrise — unforgettable!',
    rating: 5,
    avatar: 'E',
    tourType: 'VIP Balloon',
  },
];

const trustBadges = [
  { icon: Shield, label: 'Fully Licensed', desc: 'Government certified operator' },
  { icon: Award, label: 'Top Rated', desc: '#1 on TripAdvisor since 2020' },
  { icon: Clock, label: '24/7 Support', desc: 'Always here for you' },
  { icon: CheckCircle, label: 'Best Price', desc: 'Price match guarantee' },
];

export function SocialProofSection() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 dark:from-dark-50 via-white dark:via-dark to-gray-50 dark:to-dark-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-gold text-sm font-medium uppercase tracking-widest mb-4 block">
            Testimonials
          </span>
          <h2 className="section-heading mb-6">What Our Guests Say</h2>
          <p className="section-subheading mx-auto">
            Join thousands of happy travelers who chose Discovery Cappadocia
          </p>

          {/* Overall Rating */}
          <div className="mt-8 inline-flex items-center gap-4 px-6 py-3 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 text-gold fill-gold" />
              ))}
            </div>
            <span className="text-gray-900 dark:text-white font-bold text-lg">4.9</span>
            <span className="text-gray-300 dark:text-white/40">|</span>
            <span className="text-gray-500 dark:text-white/60">2,847 reviews</span>
          </div>
        </motion.div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 md:p-8 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                  {t.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{t.name}</h4>
                  <p className="text-sm text-gray-400 dark:text-white/40">{t.location}</p>
                </div>
                <Quote className="w-8 h-8 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors flex-shrink-0" />
              </div>

              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }, (_, j) => (
                  <Star key={j} className="w-4 h-4 text-gold fill-gold" />
                ))}
              </div>

              <p className="text-gray-600 dark:text-white/60 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>

              <span className="badge-emerald text-xs">{t.tourType}</span>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/20 transition-all"
            >
              <badge.icon className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{badge.label}</h4>
              <p className="text-gray-400 dark:text-white/40 text-sm">{badge.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
