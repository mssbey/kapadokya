'use client';

import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useInView } from 'framer-motion';
import { Loader2, Maximize2, Navigation } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { TOUR_STOPS, directionsUrl } from '@/lib/tourStops';

// Leaflet touches `window` at import time, so the map only ever loads in the browser.
const CappadociaMap = dynamic(() => import('@/components/map/CappadociaMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0f1f1b]">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-400/70" />
    </div>
  ),
});

export function MapSection() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [fitAllToken, setFitAllToken] = useState(0);
  const { t } = useI18n();

  // This section sits at the very bottom of the home page, but `dynamic` alone
  // starts fetching Leaflet and a dozen map tiles as soon as the page hydrates
  // — on a throttled mobile connection that competes with the hero for
  // bandwidth. Hold the mount until the section is within a screen's reach.
  const mapRef = useRef<HTMLDivElement>(null);
  const mapNear = useInView(mapRef, { once: true, margin: '600px' });

  const stops = useMemo(
    () =>
      TOUR_STOPS.map((stop, index) => ({
        ...stop,
        name: t.map.points[index] ?? '',
        description: t.map.descriptions[index] ?? '',
      })),
    [t],
  );

  return (
    <section
      id="map"
      className="relative isolate overflow-hidden bg-[#0d241f] py-20 text-white md:py-28"
      aria-labelledby="map-heading"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(16,185,129,.16),transparent_45%),radial-gradient(circle_at_85%_100%,rgba(217,170,82,.12),transparent_45%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-[#07110e]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[.25em] text-amber-300">{t.map.eyebrow}</p>
          <h2 id="map-heading" className="font-display text-4xl font-bold md:text-5xl">
            {t.map.heading}
          </h2>
          <p className="mt-5 leading-relaxed text-white/65">{t.map.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-12 grid gap-6 lg:grid-cols-[1.65fr_1fr]"
        >
          {/* lg:h-auto lets the map stretch to the stop list's height so the two cards line up. */}
          <div ref={mapRef} className="relative h-[420px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0f1f1b] shadow-[0_35px_90px_-45px_rgba(0,0,0,.9)] md:h-[540px] lg:h-auto lg:min-h-[540px]">
            {mapNear ? (
              <CappadociaMap
                stops={stops}
                activeId={activeId}
                onSelect={(id) => setActiveId(id)}
                fitAllToken={fitAllToken}
                labels={{
                  directions: t.map.directions,
                  ariaLabel: t.map.ariaLabel,
                  zoomIn: t.map.zoomIn,
                  zoomOut: t.map.zoomOut,
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0f1f1b]">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-400/70" />
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveId(null);
                setFitAllToken((token) => token + 1);
              }}
              className="absolute left-4 top-4 z-[1000] inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#0d241f]/85 px-3.5 py-2.5 text-xs font-semibold text-white/85 backdrop-blur-md transition hover:border-emerald-400/40 hover:text-white"
            >
              <Maximize2 className="h-4 w-4 text-emerald-300" />
              {t.map.fitAll}
            </button>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[.04] p-5 backdrop-blur-sm sm:p-6">
            <h3 className="text-xs font-bold uppercase tracking-[.22em] text-white/45">{t.map.stopsTitle}</h3>

            <ul className="mt-4 space-y-1.5">
              {stops.map((stop, index) => {
                const active = stop.id === activeId;
                return (
                  <li key={stop.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(active ? null : stop.id)}
                      aria-pressed={active}
                      className={`flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                        active
                          ? 'border-emerald-400/40 bg-emerald-400/12'
                          : 'border-transparent hover:border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${
                          active ? 'bg-emerald-400 text-[#0d241f]' : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-sm font-semibold ${active ? 'text-white' : 'text-white/85'}`}>
                          {stop.name}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-white/50">{stop.description}</span>
                      </span>
                    </button>

                    {active && (
                      <a
                        href={directionsUrl(stop)}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-12 mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        {t.map.directions}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>

            <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/40">{t.map.note}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
