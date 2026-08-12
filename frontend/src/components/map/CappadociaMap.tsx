'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_VIEW, directionsUrl, type TourStop } from '@/lib/tourStops';

export interface MapStop extends TourStop {
  name: string;
  description: string;
}

interface CappadociaMapProps {
  stops: MapStop[];
  activeId: number | null;
  onSelect: (id: number) => void;
  /** Bumping this number re-frames the map around every stop. */
  fitAllToken: number;
  labels: { directions: string; ariaLabel: string; zoomIn: string; zoomOut: string };
}

const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
};

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function pinIcon(order: number, active: boolean): L.DivIcon {
  return L.divIcon({
    className: 'dc-pin-icon',
    html: `<span class="dc-pin${active ? ' dc-pin--active' : ''}"><span class="dc-pin__ring"></span><span class="dc-pin__badge">${order}</span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

/** Reads the app theme straight off <html>, so the tiles never fight the store's hydration order. */
function isDarkNow(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
}

export default function CappadociaMap({ stops, activeId, onSelect, fitAllToken, labels }: CappadociaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Create the map once; stop labels are re-applied by the effects below.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: DEFAULT_VIEW.center,
      zoom: DEFAULT_VIEW.zoom,
      // The map sits mid-page — hijacking the wheel would trap the reader.
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: true,
    });
    mapRef.current = map;

    tileRef.current = L.tileLayer(isDarkNow() ? TILES.dark : TILES.light, {
      attribution: ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright', zoomInTitle: labels.zoomIn, zoomOutTitle: labels.zoomOut }).addTo(map);
    const markers = markersRef.current;

    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      markers.clear();
    };
    // Labels only seed the zoom-button tooltips; re-creating the map on a
    // language switch would be far more disruptive than a stale tooltip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow the light/dark toggle without tearing the map down.
  useEffect(() => {
    const html = document.documentElement;
    const sync = () => tileRef.current?.setUrl(isDarkNow() ? TILES.dark : TILES.light);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Markers, popups and the dashed route line.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const layers: L.Layer[] = [];
    markersRef.current.clear();

    const connected = stops.filter((stop) => stop.connect);
    if (connected.length > 1) {
      layers.push(
        L.polyline(
          connected.map((stop) => [stop.lat, stop.lng] as [number, number]),
          { color: '#10b981', weight: 2, opacity: 0.75, dashArray: '6 8', lineCap: 'round' },
        ).addTo(map),
      );
    }

    const markers = markersRef.current;
    stops.forEach((stop, index) => {
      const marker = L.marker([stop.lat, stop.lng], {
        icon: pinIcon(index + 1, false),
        title: stop.name,
        keyboard: true,
        alt: stop.name,
      }).addTo(map);

      marker.bindPopup(
        `<div class="dc-popup">
           <p class="dc-popup__title">${escapeHtml(stop.name)}</p>
           <p class="dc-popup__text">${escapeHtml(stop.description)}</p>
           <a class="dc-popup__link" href="${directionsUrl(stop)}" target="_blank" rel="noreferrer">${escapeHtml(labels.directions)}</a>
         </div>`,
        { closeButton: false, offset: [0, -4] },
      );

      marker.on('click', () => onSelectRef.current(stop.id));
      markers.set(stop.id, marker);
      layers.push(marker);
    });

    return () => {
      layers.forEach((layer) => layer.remove());
      markers.clear();
    };
  }, [stops, labels.directions]);

  // Highlight + fly to whatever the sidebar (or a marker click) selected.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    stops.forEach((stop, index) => {
      markersRef.current.get(stop.id)?.setIcon(pinIcon(index + 1, stop.id === activeId));
    });

    if (activeId === null) return;
    const stop = stops.find((item) => item.id === activeId);
    const marker = stop && markersRef.current.get(activeId);
    if (!stop || !marker) return;

    map.flyTo([stop.lat, stop.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
    map.once('moveend', () => marker.openPopup());
  }, [activeId, stops]);

  // "Show all stops" — fits every pin, Derinkuyu included.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !stops.length) return;
    if (fitAllToken === 0) return;

    map.closePopup();
    map.flyToBounds(L.latLngBounds(stops.map((stop) => [stop.lat, stop.lng] as [number, number])), {
      padding: [56, 56],
      duration: 0.9,
    });
  }, [fitAllToken, stops]);

  return <div ref={containerRef} className="h-full w-full" role="application" aria-label={labels.ariaLabel} />;
}
