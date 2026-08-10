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
export type CategoryKey =
  | 'Balloon'
  | 'Daily Tour'
  | 'Private Tour'
  | 'Adventure'
  | 'Cultural'
  | 'Package'
  | 'Transfer';

/** Filter order for the category chips on /tours. */
export const CATEGORY_KEYS: CategoryKey[] = [
  'Balloon',
  'Daily Tour',
  'Private Tour',
  'Adventure',
  'Cultural',
  'Package',
  'Transfer',
];

/**
 * Everything about a tour that does not change with language. The copy
 * (title, description, highlights…) lives in the locale dictionaries and is
 * merged in by `getCatalog`.
 */
type TourBase = {
  slug: TourSlug;
  categoryKey: CategoryKey;
  image: string;
  /** Per-person price in EUR, except for private/vehicle products where the
   *  price covers the whole group — the dictionary copy says which. */
  price: number;
  /** Shown on the homepage grid. Everything else lives on /tours. */
  featured?: boolean;
};

export const TOUR_BASE: TourBase[] = [
  // ── Balloon ────────────────────────────────────────────────────────────
  {
    slug: 'cappadocia-hot-air-balloon',
    categoryKey: 'Balloon',
    image: '/images/cappadocia-hero-signature.png',
    price: 49,
    featured: true,
  },
  {
    slug: 'cappadocia-balloon-comfort',
    categoryKey: 'Balloon',
    image: '/images/cappadocia-sunrise-section.png',
    price: 75,
    featured: true,
  },
  {
    slug: 'cappadocia-balloon-private',
    categoryKey: 'Balloon',
    image: '/images/cappadocia-blue-hour-section.png',
    price: 750,
  },
  {
    slug: 'soganli-valley-balloon',
    categoryKey: 'Balloon',
    image: '/images/cappadocia-rose-valley-section.png',
    price: 160,
  },
  {
    slug: 'cappadocia-balloon-watching',
    categoryKey: 'Balloon',
    image: '/images/cappadocia-sunrise-section.png',
    price: 30,
  },

  // ── Daily tours ────────────────────────────────────────────────────────
  {
    slug: 'cappadocia-red-tour',
    categoryKey: 'Daily Tour',
    image: '/images/cappadocia-tours-hero.png',
    price: 40,
    featured: true,
  },
  {
    slug: 'cappadocia-green-tour',
    categoryKey: 'Daily Tour',
    image: '/images/cappadocia-sunrise-section.png',
    price: 50,
    featured: true,
  },
  {
    slug: 'cappadocia-blue-tour',
    categoryKey: 'Daily Tour',
    image: '/images/cappadocia-routes-aerial.png',
    price: 110,
  },
  {
    slug: 'cappadocia-mix-tour',
    categoryKey: 'Daily Tour',
    image: '/images/cappadocia-rose-valley-section.png',
    price: 50,
  },

  // ── Private tours (price is for the whole vehicle) ──────────────────────
  {
    slug: 'cappadocia-private-red-tour',
    categoryKey: 'Private Tour',
    image: '/images/cappadocia-tours-hero.png',
    price: 140,
  },
  {
    slug: 'cappadocia-private-green-tour',
    categoryKey: 'Private Tour',
    image: '/images/cappadocia-sunrise-section.png',
    price: 160,
  },
  {
    slug: 'cappadocia-private-mix-tour',
    categoryKey: 'Private Tour',
    image: '/images/cappadocia-rose-valley-section.png',
    price: 150,
  },

  // ── Adventure ──────────────────────────────────────────────────────────
  {
    slug: 'cappadocia-sunset-atv-tour',
    categoryKey: 'Adventure',
    image: '/images/cappadocia-atv-tour.png',
    price: 20,
    featured: true,
  },
  {
    slug: 'cappadocia-horse-riding',
    categoryKey: 'Adventure',
    image: '/images/cappadocia-blue-hour-section.png',
    price: 15,
    featured: true,
  },
  {
    slug: 'cappadocia-jeep-safari',
    categoryKey: 'Adventure',
    image: '/images/cappadocia-routes-aerial.png',
    price: 30,
  },
  {
    slug: 'cappadocia-camel-riding',
    categoryKey: 'Adventure',
    image: '/images/cappadocia-rose-valley-section.png',
    price: 40,
  },
  {
    slug: 'cappadocia-classic-car-tour',
    categoryKey: 'Adventure',
    image: '/images/cappadocia-tours-hero.png',
    price: 50,
  },

  // ── Cultural ───────────────────────────────────────────────────────────
  {
    slug: 'cappadocia-turkish-night',
    categoryKey: 'Cultural',
    image: '/images/cappadocia-blue-hour-section.png',
    price: 45,
    featured: true,
  },
  {
    slug: 'cappadocia-whirling-dervish',
    categoryKey: 'Cultural',
    image: '/images/cappadocia-blue-hour-section.png',
    price: 20,
  },
  {
    slug: 'cappadocia-pottery-workshop',
    categoryKey: 'Cultural',
    image: '/images/cappadocia-tours-hero.png',
    price: 15,
  },
  {
    slug: 'cappadocia-turkish-bath',
    categoryKey: 'Cultural',
    image: '/images/cappadocia-blue-hour-section.png',
    price: 30,
  },
  {
    slug: 'cappadocia-photoshoot',
    categoryKey: 'Cultural',
    image: '/images/cappadocia-rose-valley-section.png',
    price: 180,
  },

  // ── Multi-day packages ─────────────────────────────────────────────────
  {
    slug: 'cappadocia-2day-package',
    categoryKey: 'Package',
    image: '/images/cappadocia-hero-signature.png',
    price: 300,
    featured: true,
  },
  {
    slug: 'cappadocia-3day-package',
    categoryKey: 'Package',
    image: '/images/cappadocia-routes-aerial.png',
    price: 495,
  },

  // ── Transfers ──────────────────────────────────────────────────────────
  {
    slug: 'cappadocia-airport-transfer',
    categoryKey: 'Transfer',
    image: '/images/cappadocia-routes-aerial.png',
    price: 90,
  },
  {
    slug: 'kayseri-airport-private-transfer',
    categoryKey: 'Transfer',
    image: '/images/cappadocia-routes-aerial.png',
    price: 100,
  },
  {
    slug: 'nevsehir-airport-shuttle',
    categoryKey: 'Transfer',
    image: '/images/cappadocia-tours-hero.png',
    price: 12.5,
  },
  {
    slug: 'kayseri-airport-shuttle',
    categoryKey: 'Transfer',
    image: '/images/cappadocia-tours-hero.png',
    price: 12.5,
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

/** The homepage subset — one or two headline products per category. */
export function getFeatured(dict: Dictionary): CatalogTour[] {
  return getCatalog(dict).filter((tour) => tour.featured);
}

export function getTour(dict: Dictionary, slug: string): CatalogTour | undefined {
  return getCatalog(dict).find((tour) => tour.slug === slug);
}

/** Same-category suggestions first, topped up with anything else. */
export function getRelated(dict: Dictionary, tour: CatalogTour, limit = 4): CatalogTour[] {
  const others = getCatalog(dict).filter((item) => item.slug !== tour.slug);
  const sameCategory = others.filter((item) => item.categoryKey === tour.categoryKey);
  const rest = others.filter((item) => item.categoryKey !== tour.categoryKey);
  return [...sameCategory, ...rest].slice(0, limit);
}
