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
    text: 'I\'ve traveled extensively but Cappadocia with DiscoveryCappadocia was truly special. The VIP balloon package was worth every penny. The champagne toast at sunrise — unforgettable!',
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
    <section className="py-24 md:py-32 relative overflow-hidden isolate">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/cappadocia-blue-hour-section.png')" }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/88 via-slate-950/80 to-slate-950/92" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />

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
          <h2 className="section-heading mb-6 !text-white">What Our Guests Say</h2>
          <p className="section-subheading mx-auto !text-white/65">
            Join thousands of happy travelers who chose DiscoveryCappadocia
          </p>

          {/* Overall Rating */}
          <div className="mt-8 inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 text-gold fill-gold" />
              ))}
            </div>
            <span className="text-white font-bold text-lg">4.9</span>
            <span className="text-white/30">|</span>
            <span className="text-white/60">2,847 reviews</span>
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
              className="rounded-2xl border border-white/15 bg-slate-950/55 backdrop-blur-xl p-6 md:p-8 group shadow-2xl shadow-black/20 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/35"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                  {t.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{t.name}</h4>
                  <p className="text-sm text-white/45">{t.location}</p>
                </div>
                <Quote className="w-8 h-8 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors flex-shrink-0" />
              </div>

              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }, (_, j) => (
                  <Star key={j} className="w-4 h-4 text-gold fill-gold" />
                ))}
              </div>

              <p className="text-white/68 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>

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
              className="text-center p-6 rounded-2xl bg-slate-950/50 backdrop-blur-xl border border-white/10 hover:border-emerald-400/35 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/10"
            >
              <badge.icon className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-1">{badge.label}</h4>
              <p className="text-white/45 text-sm">{badge.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
