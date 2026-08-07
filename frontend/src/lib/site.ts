export const SITE = {
  name: 'Discovery Cappadocia',
  legalName: 'Cappadocia Kaphera Travel Agency',
  phoneDisplay: '+90 540 101 50 50',
  phone: '+905401015050',
  email: 'info@kapheratravel.com',
  address: 'Cappadocia, Nevşehir, Türkiye',
  tursabNumber: '18577',
  whatsappMessage:
    'Hello 👋 Welcome to Discovery Cappadocia!\nI would like to get information about Cappadocia tours.',
} as const;

export function whatsappUrl(message: string = SITE.whatsappMessage) {
  return `https://wa.me/${SITE.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export type CatalogTour = {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  startTime: string;
  rating?: string;
  pickup: string;
  languages: string;
  badge?: string;
  highlights: string[];
  included: string[];
  notIncluded: string[];
};

export const CATALOG: CatalogTour[] = [
  {
    slug: 'cappadocia-hot-air-balloon',
    title: 'Göreme Hot Air Balloon Flight',
    category: 'Balloon',
    description: 'Watch Cappadocia wake beneath you on a professionally operated sunrise flight over its valleys and fairy chimneys.',
    image: '/images/cappadocia-hero-signature.png',
    price: 250,
    duration: '3–4 hours',
    startTime: 'Before sunrise',
    pickup: 'Selected hotels included',
    languages: 'English, Turkish',
    badge: 'Signature experience',
    highlights: ['Sunrise views over Cappadocia', 'Flight with a licensed operator', 'Hotel transfer on selected packages', 'Post-flight celebration'],
    included: ['Flight insurance', 'Pre-flight briefing', 'Hotel pickup where stated', 'Flight certificate'],
    notIncluded: ['Personal expenses', 'Optional photos', 'Gratuities'],
  },
  {
    slug: 'cappadocia-sunset-atv-tour',
    title: 'Sunset ATV Tour',
    category: 'Adventure',
    description: 'Ride through Cappadocia’s sculpted valleys and stop at panoramic viewpoints as the landscape turns gold.',
    image: '/images/cappadocia-atv-tour.png',
    price: 45,
    duration: '2 hours',
    startTime: 'Before sunset',
    pickup: 'Selected hotels included',
    languages: 'English, Turkish',
    badge: 'Sunset favourite',
    highlights: ['Guided valley route', 'Sunset viewpoint stop', 'Beginner-friendly briefing', 'Helmet provided'],
    included: ['ATV and fuel', 'Safety equipment', 'Local guide', 'Hotel pickup where stated'],
    notIncluded: ['Drinks', 'Personal expenses', 'Gratuities'],
  },
  {
    slug: 'cappadocia-horse-riding',
    title: 'Sunrise or Sunset Horse Riding',
    category: 'Adventure',
    description: 'Explore quiet trails and rock formations at the most atmospheric time of day with an experienced local guide.',
    image: '/images/cappadocia-blue-hour-section.png',
    price: 50,
    duration: '2 hours',
    startTime: 'Sunrise or sunset',
    pickup: 'Selected hotels included',
    languages: 'English, Turkish',
    highlights: ['Small-group trail ride', 'Scenic photo stops', 'Safety briefing', 'Routes matched to conditions'],
    included: ['Horse and equipment', 'Guide', 'Helmet', 'Hotel pickup where stated'],
    notIncluded: ['Personal expenses', 'Photos', 'Gratuities'],
  },
  {
    slug: 'cappadocia-jeep-safari',
    title: 'Cappadocia Jeep Safari',
    category: 'Adventure',
    description: 'Reach hidden viewpoints and rugged valleys on an energetic off-road Cappadocia experience.',
    image: '/images/cappadocia-routes-aerial.png',
    price: 65,
    duration: '2–3 hours',
    startTime: 'Morning or sunset',
    pickup: 'Selected hotels included',
    languages: 'English, Turkish',
    highlights: ['Off-road valley route', 'Panoramic stops', 'Local driver-guide', 'Flexible departure options'],
    included: ['Jeep and driver', 'Fuel', 'Hotel pickup where stated', 'Insurance'],
    notIncluded: ['Food and drinks', 'Personal expenses', 'Gratuities'],
  },
  {
    slug: 'cappadocia-green-tour',
    title: 'Cappadocia Green Tour',
    category: 'Daily Tour',
    description: 'A full-day guided route through southern Cappadocia, including dramatic viewpoints and underground heritage.',
    image: '/images/cappadocia-sunrise-section.png',
    price: 75,
    duration: '8–9 hours',
    startTime: '09:30 approx.',
    pickup: 'Hotel pickup included',
    languages: 'English',
    highlights: ['Underground city', 'Ihlara region', 'Panoramic viewpoints', 'Professional guide'],
    included: ['Licensed guide', 'Transport', 'Lunch', 'Museum entries stated in program'],
    notIncluded: ['Drinks', 'Personal expenses', 'Gratuities'],
  },
  {
    slug: 'cappadocia-red-tour',
    title: 'Cappadocia Red Tour',
    category: 'Daily Tour',
    description: 'Discover northern Cappadocia’s celebrated open-air landscapes, viewpoints and cultural stops in one day.',
    image: '/images/cappadocia-tours-hero.png',
    price: 70,
    duration: '7–8 hours',
    startTime: '09:30 approx.',
    pickup: 'Hotel pickup included',
    languages: 'English',
    highlights: ['Göreme region highlights', 'Fairy chimney valleys', 'Local cultural stop', 'Professional guide'],
    included: ['Licensed guide', 'Transport', 'Lunch', 'Museum entries stated in program'],
    notIncluded: ['Drinks', 'Personal expenses', 'Gratuities'],
  },
  {
    slug: 'cappadocia-airport-transfer',
    title: 'Cappadocia Airport Transfer',
    category: 'Transfer',
    description: 'A pre-booked transfer between Kayseri or Nevşehir airport and your Cappadocia hotel.',
    image: '/images/cappadocia-routes-aerial.png',
    price: 20,
    duration: '45–90 min',
    startTime: 'Matched to your flight',
    pickup: 'Airport or hotel pickup',
    languages: 'English, Turkish',
    highlights: ['Flight-aware scheduling', 'Door-to-door service', 'Luggage included', 'Support by WhatsApp'],
    included: ['Vehicle', 'Driver', 'Standard luggage', 'One-way transfer'],
    notIncluded: ['Extra stops', 'Oversize baggage unless arranged', 'Gratuities'],
  },
];

export const BALLOON_OPTIONS = [
  { name: 'Standard Flight', detail: 'A classic sunrise flight in a shared basket.' },
  { name: 'Comfort Flight', detail: 'More personal space with a smaller group.' },
  { name: 'Private Flight', detail: 'A private basket and tailored celebration.' },
] as const;
