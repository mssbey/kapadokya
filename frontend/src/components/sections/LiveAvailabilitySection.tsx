'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Flame } from 'lucide-react';

const liveData = [
  {
    tourName: 'Hot Air Balloon Flight',
    date: 'Tomorrow',
    seatsLeft: 3,
    totalSeats: 20,
    price: 250,
  },
  {
    tourName: 'Full Day Tour',
    date: 'Tomorrow',
    seatsLeft: 7,
    totalSeats: 15,
    price: 75,
  },
  {
    tourName: 'ATV Safari',
    date: 'Today',
    seatsLeft: 2,
    totalSeats: 10,
    price: 60,
  },
];

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 23, seconds: 47 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {Object.entries(timeLeft).map(([key, val]) => (
        <div key={key} className="text-center">
          <div className="bg-gray-100 dark:bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[48px] border border-gray-200 dark:border-white/10">
            <span className="text-xl font-bold text-gray-900 dark:text-white font-mono">
              {String(val).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-white/40 uppercase mt-1 block">{key}</span>
        </div>
      ))}
    </div>
  );
}

export function LiveAvailabilitySection() {
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % liveData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden isolate">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/cappadocia-sunrise-section.png')" }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/95 via-amber-50/88 to-white/95 dark:from-dark/95 dark:via-[#17120d]/86 dark:to-dark-50/95" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Live Availability
          </div>
          <h2 className="section-heading mb-4">Selling Out Fast</h2>
          <p className="section-subheading mx-auto">
            Don&apos;t miss out — these experiences are booking quickly
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-6 md:p-8 mb-10 max-w-2xl mx-auto text-center shadow-2xl shadow-amber-950/10 ring-1 ring-white/30"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-gray-500 dark:text-white/70 text-sm font-medium">
              Special pricing ends in
            </span>
          </div>
          <div className="flex justify-center">
            <CountdownTimer />
          </div>
        </motion.div>

        {/* Availability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {liveData.map((item, i) => {
            const isUrgent = item.seatsLeft <= 3;
            const fillPercent = ((item.totalSeats - item.seatsLeft) / item.totalSeats) * 100;

            return (
              <motion.div
                key={item.tourName}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`glass-card p-6 transition-all duration-500 shadow-xl shadow-amber-950/10 ring-1 ring-white/20 hover:-translate-y-1 ${
                  pulseIndex === i ? 'border-emerald-500/30 shadow-glow-emerald' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                    {item.tourName}
                  </h3>
                  {isUrgent && (
                    <span className="badge-red">
                      <AlertTriangle className="w-3 h-3" />
                      Urgent
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{item.date}</span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={isUrgent ? 'text-red-500 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-white/60'}>
                      Only {item.seatsLeft} seats left!
                    </span>
                    <span className="text-gray-400 dark:text-white/40">{item.totalSeats} total</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${fillPercent}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                      className={`h-full rounded-full ${
                        isUrgent
                          ? 'bg-gradient-to-r from-red-500 to-orange-500'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">${item.price}</span>
                  <button className="btn-primary text-sm px-5 py-2">
                    Book Now
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
