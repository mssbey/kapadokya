import type { Dictionary, TourSlug } from '@/lib/i18n';

export const SITE = {
  name: 'Discovery Cappadocia',
  legalName: 'Cappadocia Kaphera Travel Agency',
  phoneDisplay: '+90 540 101 50 50',
  phone: '+905401015050',
  email: 'info@kapheratravel.com',
  address: 'Cappadocia, Nevşehir, Türkiye',
  tursabNumber: '18577',
} as const;

export function whatsappUrl(message: string) {
  return `https://wa.me/${SITE.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

/** Stable, language-independent category keys used for filtering and icons. */
export type CategoryKey = 'Balloon' | 'Adventure' | 'Daily Tour' | 'Transfer';

/**
 * Everything about a tour that does not change with language. The copy
 * (title, description, highlights…) lives in the locale dictionaries and is
 * merged in by `getCatalog`.
 */
type TourBase = {
  slug: TourSlug;
  categoryKey: CategoryKey;
  image: string;
  price: number;
};

export const TOUR_BASE: TourBase[] = [
  {
    slug: 'cappadocia-hot-air-balloon',
    categoryKey: 'Balloon',
    image: '/images/cappadocia-hero-signature.png',
    price: 250,
  },
  {
    slug: 'cappadocia-sunset-atv-tour',
    categoryKey: 'Adventure',
    image: '/images/cappadocia-atv-tour.png',
    price: 45,
  },
  {
    slug: 'cappadocia-horse-riding',
    categoryKey: 'Adventure',
    image: '/images/cappadocia-blue-hour-section.png',
    price: 50,
  },
  {
    slug: 'cappadocia-jeep-safari',
    categoryKey: 'Adventure',
    image: '/images/cappadocia-routes-aerial.png',
    price: 65,
  },
  {
    slug: 'cappadocia-green-tour',
    categoryKey: 'Daily Tour',
    image: '/images/cappadocia-sunrise-section.png',
    price: 75,
  },
  {
    slug: 'cappadocia-red-tour',
    categoryKey: 'Daily Tour',
    image: '/images/cappadocia-tours-hero.png',
    price: 70,
  },
  {
    slug: 'cappadocia-airport-transfer',
    categoryKey: 'Transfer',
    image: '/images/cappadocia-routes-aerial.png',
    price: 20,
  },
];

export type CatalogTour = TourBase & {
  title: string;
  /** Translated category label, for display only. Filter on `categoryKey`. */
  category: string;
  description: string;
  duration: string;
  startTime: string;
  pickup: string;
  languages: string;
  badge: string;
  highlights: string[];
  included: string[];
  notIncluded: string[];
};

/** Merges the language-independent tour data with the active locale's copy. */
export function getCatalog(dict: Dictionary): CatalogTour[] {
  return TOUR_BASE.map((base) => ({ ...base, ...dict.tours[base.slug] }));
}

export function getTour(dict: Dictionary, slug: string): CatalogTour | undefined {
  return getCatalog(dict).find((tour) => tour.slug === slug);
}
