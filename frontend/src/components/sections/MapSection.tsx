'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const tourPoints = [
  { id: 1, name: 'Göreme Open Air Museum', lat: 38.6431, lng: 34.8307, type: 'museum' },
  { id: 2, name: 'Balloon Launch Site', lat: 38.6400, lng: 34.8280, type: 'balloon' },
  { id: 3, name: 'Uçhisar Castle', lat: 38.6333, lng: 34.8068, type: 'castle' },
  { id: 4, name: 'Love Valley', lat: 38.6568, lng: 34.8266, type: 'valley' },
  { id: 5, name: 'Derinkuyu Underground City', lat: 38.3744, lng: 34.7346, type: 'underground' },
  { id: 6, name: 'Paşabağ (Monks Valley)', lat: 38.6542, lng: 34.8553, type: 'valley' },
];

export function MapSection() {
  const [activePoint, setActivePoint] = useState<number | null>(null);

  return (
    <section id="map" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-dark to-gray-50 dark:to-dark-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-emerald-500 dark:text-emerald-400 text-sm font-medium uppercase tracking-widest mb-4 block">
            Explore the Region
          </span>
          <h2 className="section-heading mb-6">Tour Routes & Destinations</h2>
          <p className="section-subheading mx-auto">
            Discover the magical locations you&apos;ll visit on our tours
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card overflow-hidden"
        >
          {/* Map Container */}
          <div className="relative h-[500px] bg-gray-100 dark:bg-dark-100">
            {/* Styled Map Placeholder — replace with Mapbox/Google Maps in production */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 dark:from-dark-50 to-gray-200 dark:to-dark-200">
              <img
                src="https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=1400&q=80"
                alt="Cappadocia aerial view"
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-white/40 dark:bg-dark/40" />

              {/* Tour Points */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full max-w-lg h-80">
                  {tourPoints.map((point, i) => {
                    const positions = [
                      { top: '20%', left: '45%' },
                      { top: '30%', left: '40%' },
                      { top: '60%', left: '25%' },
                      { top: '15%', left: '60%' },
                      { top: '75%', left: '50%' },
                      { top: '25%', left: '75%' },
                    ];

                    return (
                      <motion.button
                        key={point.id}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                        onClick={() => setActivePoint(activePoint === point.id ? null : point.id)}
                        className="absolute group"
                        style={positions[i]}
                      >
                        <div className={`relative ${activePoint === point.id ? 'z-20' : 'z-10'}`}>
                          {/* Pulse ring */}
                          <div className="absolute inset-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 animate-ping" />

                          {/* Pin */}
                          <div className={`w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 ${
                            activePoint === point.id
                              ? 'bg-emerald-500 scale-125 shadow-glow-emerald'
                              : 'bg-emerald-600/60 dark:bg-white/20 backdrop-blur-sm border border-emerald-600/40 dark:border-white/30 hover:bg-emerald-500/80 dark:hover:bg-emerald-500/50'
                          }`}>
                            <MapPin className="w-5 h-5 text-white" />
                          </div>

                          {/* Label */}
                          {activePoint === point.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
                            >
                              <div className="bg-gray-900/90 dark:bg-dark/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-500/30 text-sm text-white font-medium shadow-lg">
                                {point.name}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}

                  {/* Connecting lines (decorative SVG) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 320">
                    <motion.path
                      d="M 180 64 C 160 96 100 160 100 192 C 100 224 160 224 200 240"
                      stroke="rgba(16, 185, 129, 0.2)"
                      strokeWidth="1.5"
                      strokeDasharray="5,5"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, delay: 1 }}
                    />
                    <motion.path
                      d="M 180 64 C 240 80 280 64 300 80"
                      stroke="rgba(212, 168, 83, 0.2)"
                      strokeWidth="1.5"
                      strokeDasharray="5,5"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, delay: 1.3 }}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Points List (sidebar) */}
            <div className="absolute right-4 top-4 bottom-4 w-56 hidden lg:block">
              <div className="glass p-4 h-full overflow-y-auto space-y-2">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-white/60 uppercase tracking-wide mb-3">
                  Tour Stops
                </h4>
                {tourPoints.map((point) => (
                  <button
                    key={point.id}
                    onClick={() => setActivePoint(activePoint === point.id ? null : point.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activePoint === point.id
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {point.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
