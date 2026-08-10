import { PrismaClient, TourCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Slugs and prices here must stay in step with the frontend catalogue in
 * `frontend/src/lib/site.ts` — the booking funnel deep-links from a tour page
 * as `/booking?tour=<slug>` and matches on the slug.
 *
 * The frontend carries finer categories (private tours, cultural, packages)
 * than the `TourCategory` enum, so several of them collapse onto one value.
 */
const tours = [
  // ── Balloon ────────────────────────────────────────────────────────────
  {
    title: 'Göreme Balloon Ride (Economy Class)',
    slug: 'cappadocia-hot-air-balloon',
    description:
      'The classic Cappadocia sunrise flight. You lift off from the Göreme area just before dawn and float over the fairy chimneys and valleys in a shared basket, with a licensed operator and an experienced pilot. Hotel pickup, a light breakfast before the flight and a celebration on landing are included.',
    shortDesc: 'Sunrise balloon flight over the fairy chimneys',
    category: TourCategory.BALLOON,
    basePrice: 49,
    duration: '3–4 hours (about 60 minutes in the air)',
    maxCapacity: 20,
    images: ['/images/cappadocia-hero-signature.png', '/images/cappadocia-sunrise-section.png'],
    highlights: [
      'Sunrise over the fairy chimneys',
      'Roughly 60 minutes of flight time',
      'Licensed operator and certified pilot',
      'Celebration and flight certificate after landing',
    ],
    includes: ['Hotel transfer', 'Light breakfast', 'Flight insurance', 'Flight certificate'],
    excludes: ['Personal expenses', 'Professional photos', 'Gratuities'],
    sortOrder: 1,
  },
  {
    title: 'Göreme Balloon Ride (Comfort Class)',
    slug: 'cappadocia-balloon-comfort',
    description:
      'The same sunrise route as the economy flight, flown in a smaller basket with fewer passengers. More room at the edge of the basket means a clearer view and easier photography throughout the flight.',
    shortDesc: 'Smaller basket, fewer passengers, same sunrise route',
    category: TourCategory.BALLOON,
    basePrice: 75,
    duration: '3–4 hours (about 60 minutes in the air)',
    maxCapacity: 16,
    images: ['/images/cappadocia-sunrise-section.png'],
    highlights: [
      'Smaller basket, fewer passengers',
      'More space at the basket edge for photos',
      'Roughly 60 minutes of flight time',
      'Champagne celebration on landing',
    ],
    includes: ['Hotel transfer', 'Light breakfast', 'Flight insurance', 'Flight certificate'],
    excludes: ['Personal expenses', 'Professional photos', 'Gratuities'],
    sortOrder: 2,
  },
  {
    title: 'Private Balloon Flight',
    slug: 'cappadocia-balloon-private',
    description:
      'A balloon basket reserved for your group alone, with the flight shaped around you — proposals, anniversaries and honeymoons included. The listed price covers the basket, not one seat.',
    shortDesc: 'A basket reserved for your group alone',
    category: TourCategory.BALLOON,
    basePrice: 750,
    duration: '3–4 hours (about 60 minutes in the air)',
    maxCapacity: 8,
    images: ['/images/cappadocia-blue-hour-section.png'],
    highlights: [
      'Basket reserved for your group only',
      'Ideal for proposals and anniversaries',
      'Pilot briefed on your occasion',
      'Private celebration after landing',
    ],
    includes: ['Private basket', 'Hotel transfer', 'Flight insurance', 'Celebration and certificate'],
    excludes: ['Personal expenses', 'Professional photos', 'Gratuities'],
    sortOrder: 3,
  },
  {
    title: 'Soğanlı Valley Balloon Ride (Comfort Flight)',
    slug: 'soganli-valley-balloon',
    description:
      'A flight over the quieter Soğanlı Valley, south of Göreme, where the rock churches and cone formations sit in far less crowded sky. A good alternative on days when Göreme flights are fully booked.',
    shortDesc: 'Quieter valley, fewer balloons in the sky',
    category: TourCategory.BALLOON,
    basePrice: 160,
    duration: '4–5 hours (about 60 minutes in the air)',
    maxCapacity: 16,
    images: ['/images/cappadocia-rose-valley-section.png'],
    highlights: [
      'Quieter valley with fewer balloons in the sky',
      'Rock churches and cone formations from above',
      'Comfort basket with fewer passengers',
      'Transfer from the Göreme and Ürgüp area',
    ],
    includes: ['Hotel transfer', 'Light breakfast', 'Flight insurance', 'Flight certificate'],
    excludes: ['Personal expenses', 'Professional photos', 'Gratuities'],
    sortOrder: 4,
  },
  {
    title: 'Balloon Watching Tour',
    slug: 'cappadocia-balloon-watching',
    description:
      'For those who would rather photograph the balloons than fly in one. You are driven to the best viewpoint for the morning’s conditions and watch a hundred-odd balloons rise with the sun over breakfast.',
    shortDesc: 'Watch the sunrise balloon launch from the best viewpoint',
    category: TourCategory.BALLOON,
    basePrice: 30,
    duration: '2 hours',
    maxCapacity: 15,
    images: ['/images/cappadocia-sunrise-section.png'],
    highlights: [
      'Viewpoint chosen for the morning’s wind direction',
      'Balloons rising with the sunrise',
      'Turkish breakfast and hot drinks at the viewpoint',
      'A budget alternative to flying',
    ],
    includes: ['Hotel transfer', 'Breakfast and hot drinks', 'Driver-guide', 'Photo stops'],
    excludes: ['Balloon flight', 'Personal expenses', 'Gratuities'],
    sortOrder: 5,
  },

  // ── Daily tours ────────────────────────────────────────────────────────
  {
    title: 'Cappadocia Red Tour',
    slug: 'cappadocia-red-tour',
    description:
      'The northern Cappadocia route and the best introduction to the region: the Göreme Open Air Museum, the Uçhisar and Göreme panoramas, the fairy chimneys of Paşabağ and the pottery workshops of Avanos.',
    shortDesc: 'Northern route with a licensed guide',
    category: TourCategory.DAILY_TOUR,
    basePrice: 40,
    duration: '8–9 hours',
    maxCapacity: 15,
    images: ['/images/cappadocia-tours-hero.png', '/images/cappadocia-routes-aerial.png'],
    highlights: [
      'Göreme Open Air Museum',
      'Uçhisar Castle panorama',
      'Paşabağ and Devrent fairy chimneys',
      'Avanos pottery demonstration',
    ],
    includes: ['Licensed guide', 'Air-conditioned transport', 'Lunch', 'Hotel pickup and drop-off'],
    excludes: ['Museum entrance fees', 'Drinks', 'Gratuities'],
    sortOrder: 6,
  },
  {
    title: 'Cappadocia Green Tour',
    slug: 'cappadocia-green-tour',
    description:
      'The southern route, built around the underground city of Derinkuyu and the four-kilometre walk through the Ihlara Valley. A longer, more active day than the Red Tour, with Selime Monastery at the end.',
    shortDesc: 'Underground city and the Ihlara Valley walk',
    category: TourCategory.DAILY_TOUR,
    basePrice: 50,
    duration: '9–10 hours',
    maxCapacity: 15,
    images: ['/images/cappadocia-sunrise-section.png', '/images/cappadocia-routes-aerial.png'],
    highlights: [
      'Derinkuyu Underground City',
      'Ihlara Valley walk (about 4 km)',
      'Selime Monastery',
      'Pigeon Valley panorama',
    ],
    includes: ['Licensed guide', 'Air-conditioned transport', 'Lunch', 'Hotel pickup and drop-off'],
    excludes: ['Museum entrance fees', 'Drinks', 'Gratuities'],
    sortOrder: 7,
  },
  {
    title: 'Cappadocia Blue Tour',
    slug: 'cappadocia-blue-tour',
    description:
      'The route most visitors never reach: Soğanlı Valley, the Keşlik Monastery and the Cappadocian villages of the south, away from the coach traffic. A slower day, with more time at each stop.',
    shortDesc: 'The quiet southern route, away from the coaches',
    category: TourCategory.DAILY_TOUR,
    basePrice: 110,
    duration: '8–9 hours',
    maxCapacity: 15,
    images: ['/images/cappadocia-routes-aerial.png'],
    highlights: [
      'Soğanlı Valley rock churches',
      'Keşlik Monastery',
      'Mustafapaşa (Sinasos) old Greek village',
      'Cave rooms and quiet viewpoints',
    ],
    includes: ['Licensed guide', 'Air-conditioned transport', 'Lunch', 'Hotel pickup and drop-off'],
    excludes: ['Museum entrance fees', 'Drinks', 'Gratuities'],
    sortOrder: 8,
  },
  {
    title: 'Cappadocia Mix Tour',
    slug: 'cappadocia-mix-tour',
    description:
      'The headline stops of both the Red and Green routes in a single day, for travellers with only one day in Cappadocia: an underground city, the best panoramas and the fairy chimney valleys.',
    shortDesc: 'Red and Green highlights in one day',
    category: TourCategory.DAILY_TOUR,
    basePrice: 50,
    duration: '8–9 hours',
    maxCapacity: 15,
    images: ['/images/cappadocia-rose-valley-section.png'],
    highlights: [
      'An underground city',
      'Fairy chimney valleys',
      'Best panoramic viewpoints',
      'Designed for one-day visits',
    ],
    includes: ['Licensed guide', 'Air-conditioned transport', 'Lunch', 'Hotel pickup and drop-off'],
    excludes: ['Museum entrance fees', 'Drinks', 'Gratuities'],
    sortOrder: 9,
  },

  // ── Private tours (price covers the whole vehicle) ─────────────────────
  {
    title: 'Private Red Tour (up to 18 people)',
    slug: 'cappadocia-private-red-tour',
    description:
      'The Red Tour route with a vehicle and guide for your group alone. You set the departure time, decide how long to stay at each stop and can drop or add sites. The price is for the whole vehicle, not per person.',
    shortDesc: 'Private vehicle and guide on the Red Tour route',
    category: TourCategory.DAILY_TOUR,
    basePrice: 140,
    duration: '8–9 hours',
    maxCapacity: 18,
    images: ['/images/cappadocia-tours-hero.png'],
    highlights: [
      'Vehicle and guide for your group only',
      'Departure time and pace set by you',
      'Itinerary adjustable on the day',
      'One price for up to 18 people',
    ],
    includes: ['Private licensed guide', 'Private vehicle and driver', 'Lunch', 'Hotel pickup and drop-off'],
    excludes: ['Museum entrance fees', 'Drinks', 'Gratuities'],
    sortOrder: 10,
  },
  {
    title: 'Private Green Tour (up to 18 people)',
    slug: 'cappadocia-private-green-tour',
    description:
      'Derinkuyu, the Ihlara Valley and Selime Monastery at your own pace, with a private guide and vehicle. Useful if you want the full Ihlara walk — or a shorter version of it — without a group schedule.',
    shortDesc: 'Private vehicle and guide on the Green Tour route',
    category: TourCategory.DAILY_TOUR,
    basePrice: 160,
    duration: '9–10 hours',
    maxCapacity: 18,
    images: ['/images/cappadocia-sunrise-section.png'],
    highlights: [
      'Vehicle and guide for your group only',
      'Ihlara walk shortened or extended as you like',
      'Departure time set by you',
      'One price for up to 18 people',
    ],
    includes: ['Private licensed guide', 'Private vehicle and driver', 'Lunch', 'Hotel pickup and drop-off'],
    excludes: ['Museum entrance fees', 'Drinks', 'Gratuities'],
    sortOrder: 11,
  },
  {
    title: 'Private Mix Tour (up to 18 people)',
    slug: 'cappadocia-private-mix-tour',
    description:
      'A private day built from the strongest stops of both routes. Tell us what you care about — history, photography, walking or the least crowded viewpoints — and the guide plans the day around it.',
    shortDesc: 'A private day built around your interests',
    category: TourCategory.DAILY_TOUR,
    basePrice: 150,
    duration: '8–9 hours',
    maxCapacity: 18,
    images: ['/images/cappadocia-rose-valley-section.png'],
    highlights: [
      'Itinerary planned around your interests',
      'Vehicle and guide for your group only',
      'Photography-friendly timing',
      'One price for up to 18 people',
    ],
    includes: ['Private licensed guide', 'Private vehicle and driver', 'Lunch', 'Hotel pickup and drop-off'],
    excludes: ['Museum entrance fees', 'Drinks', 'Gratuities'],
    sortOrder: 12,
  },

  // ── Adventure ──────────────────────────────────────────────────────────
  {
    title: 'Sunset ATV Tour',
    slug: 'cappadocia-sunset-atv-tour',
    description:
      'Ride a quad through Love Valley, Rose Valley and Sword Valley on tracks a coach cannot reach, timed so the last stretch runs as the rock turns gold. No experience needed — a briefing comes first.',
    shortDesc: 'Quad ride through the valleys at golden hour',
    category: TourCategory.ADVENTURE,
    basePrice: 20,
    duration: '2 hours',
    maxCapacity: 10,
    images: ['/images/cappadocia-atv-tour.png'],
    highlights: [
      'Love, Rose and Sword valleys',
      'Sunset viewpoint stop',
      'Beginner-friendly briefing',
      'Helmet and goggles provided',
    ],
    includes: ['ATV and fuel', 'Safety equipment', 'Local guide', 'Hotel pickup and drop-off'],
    excludes: ['Drinks', 'Personal expenses', 'Gratuities'],
    sortOrder: 13,
  },
  {
    title: 'Sunset Horseback Riding',
    slug: 'cappadocia-horse-riding',
    description:
      'Cappadocia means “land of beautiful horses”, and the valleys are still best seen from one. Quiet trails, a calm pace and a local guide, with the route matched to your riding experience.',
    shortDesc: 'Guided horse riding through the valleys',
    category: TourCategory.ADVENTURE,
    basePrice: 15,
    duration: '2 hours',
    maxCapacity: 10,
    images: ['/images/cappadocia-blue-hour-section.png'],
    highlights: [
      'Quiet valley trails',
      'Horses matched to your experience',
      'Sunrise or sunset departure',
      'Scenic photo stops',
    ],
    includes: ['Horse and equipment', 'Helmet', 'Local guide', 'Hotel pickup and drop-off'],
    excludes: ['Personal expenses', 'Photos', 'Gratuities'],
    sortOrder: 14,
  },
  {
    title: 'Cappadocia Jeep Safari',
    slug: 'cappadocia-jeep-safari',
    description:
      'An open-top 4x4 along valley floors and up to viewpoints the tour buses never see, with the driver stopping wherever the light is worth it. Comfortable for families and groups who would rather not drive themselves.',
    shortDesc: 'Off-road 4x4 to viewpoints the buses never reach',
    category: TourCategory.ADVENTURE,
    basePrice: 30,
    duration: '2–3 hours',
    maxCapacity: 16,
    images: ['/images/cappadocia-routes-aerial.png'],
    highlights: [
      'Off-road valley route',
      'Panoramic viewpoints away from the crowds',
      'Local driver-guide',
      'Family-friendly alternative to ATV',
    ],
    includes: ['Jeep and driver', 'Fuel', 'Insurance', 'Hotel pickup and drop-off'],
    excludes: ['Food and drinks', 'Personal expenses', 'Gratuities'],
    sortOrder: 15,
  },
  {
    title: 'Camel Riding Tour',
    slug: 'cappadocia-camel-riding',
    description:
      'A short, gentle ride through the fairy chimneys on the animal that gave Cappadocia its Camel Rock. Slow enough for photographs and easy enough for children, with a handler alongside throughout.',
    shortDesc: 'A gentle ride among the fairy chimneys',
    category: TourCategory.ADVENTURE,
    basePrice: 40,
    duration: '1–2 hours',
    maxCapacity: 12,
    images: ['/images/cappadocia-rose-valley-section.png'],
    highlights: [
      'Ride among the fairy chimneys',
      'Handler walks alongside throughout',
      'Suitable for children',
      'Excellent photo opportunities',
    ],
    includes: ['Camel and handler', 'Safety briefing', 'Photo stops', 'Hotel pickup and drop-off'],
    excludes: ['Personal expenses', 'Photos', 'Gratuities'],
    sortOrder: 16,
  },
  {
    title: 'Classic Car Tour',
    slug: 'cappadocia-classic-car-tour',
    description:
      'A vintage convertible, a driver and a route through the valleys and viewpoints — the shot everyone comes back from Cappadocia with. Book the sunrise slot if you want the balloons in the background.',
    shortDesc: 'Vintage convertible through the valleys',
    category: TourCategory.ADVENTURE,
    basePrice: 50,
    duration: '2 hours',
    maxCapacity: 4,
    images: ['/images/cappadocia-tours-hero.png'],
    highlights: [
      'Vintage convertible with driver',
      'Sunrise slot puts balloons in the frame',
      'Stops at the best photo viewpoints',
      'Car reserved for your group',
    ],
    includes: ['Classic car and driver', 'Fuel', 'Photo stops', 'Hotel pickup and drop-off'],
    excludes: ['Professional photographer', 'Personal expenses', 'Gratuities'],
    sortOrder: 17,
  },

  // ── Cultural ───────────────────────────────────────────────────────────
  {
    title: 'Turkish Night Show',
    slug: 'cappadocia-turkish-night',
    description:
      'Dinner in a restored cave restaurant with folk dances from across Anatolia, a whirling dervish sema and live music. Unlimited local drinks are included, and the evening finishes with the hotel transfer.',
    shortDesc: 'Cave restaurant dinner with folk dances and live music',
    category: TourCategory.ADVENTURE,
    basePrice: 45,
    duration: '3 hours',
    maxCapacity: 100,
    images: ['/images/cappadocia-blue-hour-section.png'],
    highlights: [
      'Dinner in a cave restaurant',
      'Anatolian folk dances and live music',
      'Whirling dervish performance',
      'Unlimited local drinks',
    ],
    includes: ['Dinner', 'Local drinks', 'Show', 'Hotel pickup and drop-off'],
    excludes: ['Imported drinks', 'Personal expenses', 'Gratuities'],
    sortOrder: 18,
  },
  {
    title: 'Whirling Dervish Ceremony',
    slug: 'cappadocia-whirling-dervish',
    description:
      'The sema is a religious ceremony, not a floor show, and it is performed here as one — in a restored caravanserai, in silence, with no photography during the ritual. Around an hour, including the introduction.',
    shortDesc: 'Authentic sema ceremony in a historic caravanserai',
    category: TourCategory.ADVENTURE,
    basePrice: 20,
    duration: '1 hour',
    maxCapacity: 60,
    images: ['/images/cappadocia-blue-hour-section.png'],
    highlights: [
      'Authentic sema ceremony',
      'Held in a historic caravanserai',
      'Short introduction to the ritual',
      'Quiet, respectful setting',
    ],
    includes: ['Ceremony ticket', 'Introduction to the sema', 'Hotel pickup and drop-off', 'Seating'],
    excludes: ['Food and drinks', 'Photography during the ritual', 'Gratuities'],
    sortOrder: 19,
  },
  {
    title: 'Pottery Making Experience',
    slug: 'cappadocia-pottery-workshop',
    description:
      'Avanos has thrown pots from Kızılırmak clay for four thousand years. A master potter shows you the kick wheel, then hands it over — you shape your own piece and take it with you.',
    shortDesc: 'Throw your own pot on a traditional kick wheel',
    category: TourCategory.ADVENTURE,
    basePrice: 15,
    duration: '20–40 minutes',
    maxCapacity: 10,
    images: ['/images/cappadocia-tours-hero.png'],
    highlights: [
      'Traditional kick wheel with a master potter',
      'Red Kızılırmak river clay',
      'Shape your own piece',
      'Take your piece home',
    ],
    includes: ['Workshop session', 'Clay and materials', 'Master potter', 'Your finished piece'],
    excludes: ['Hotel transfer unless arranged', 'Shipping of large pieces', 'Gratuities'],
    sortOrder: 20,
  },
  {
    title: 'Turkish Bath (Hamam)',
    slug: 'cappadocia-turkish-bath',
    description:
      'A traditional hamam in a stone bath house: the heated marble slab, a foam wash and a scrub, followed by tea in the resting room. The obvious way to end a day of walking through valleys.',
    shortDesc: 'Traditional hamam with scrub and foam wash',
    category: TourCategory.ADVENTURE,
    basePrice: 30,
    duration: '1–2 hours',
    maxCapacity: 20,
    images: ['/images/cappadocia-blue-hour-section.png'],
    highlights: [
      'Heated marble slab and steam room',
      'Traditional scrub and foam wash',
      'Separate or shared sections available',
      'Tea in the resting room',
    ],
    includes: ['Hamam entry', 'Scrub and foam wash', 'Towels and slippers', 'Hotel pickup and drop-off'],
    excludes: ['Oil massage (extra)', 'Personal expenses', 'Gratuities'],
    sortOrder: 21,
  },
  {
    title: 'Cappadocia Photoshoot Tour',
    slug: 'cappadocia-photoshoot',
    description:
      'A professional photographer, a driver and two hours across the best-lit locations in the region — carpet-covered stairs, valley viewpoints, the balloons at dawn. Edited images are delivered afterwards.',
    shortDesc: 'Professional photo session across the best locations',
    category: TourCategory.ADVENTURE,
    basePrice: 180,
    duration: '2 hours',
    maxCapacity: 6,
    images: ['/images/cappadocia-rose-valley-section.png'],
    highlights: [
      'Professional photographer and driver',
      'Multiple locations in one session',
      'Balloons in frame on the sunrise slot',
      'Edited images delivered digitally',
    ],
    includes: ['Photographer', 'Vehicle and driver', 'Edited digital images', 'Hotel pickup and drop-off'],
    excludes: ['Costume rental', 'Printed albums', 'Gratuities'],
    sortOrder: 22,
  },

  // ── Multi-day packages ─────────────────────────────────────────────────
  {
    title: '1 Night 2 Days Cappadocia Package',
    slug: 'cappadocia-2day-package',
    description:
      'A complete weekend: cave hotel accommodation, a balloon flight at sunrise, a full guided day tour and all transfers, arranged as one booking so nothing has to be coordinated on the ground.',
    shortDesc: 'Cave hotel, balloon flight and a guided day tour',
    category: TourCategory.DAILY_TOUR,
    basePrice: 300,
    duration: '2 days, 1 night',
    maxCapacity: 15,
    images: ['/images/cappadocia-hero-signature.png'],
    highlights: [
      'One night in a cave hotel',
      'Sunrise balloon flight',
      'Full-day guided tour',
      'All airport and hotel transfers',
    ],
    includes: ['Accommodation with breakfast', 'Balloon flight', 'Guided day tour', 'All transfers'],
    excludes: ['Flights to Cappadocia', 'Museum entrance fees', 'Gratuities'],
    sortOrder: 23,
  },
  {
    title: '2 Nights 3 Days Cappadocia Package',
    slug: 'cappadocia-3day-package',
    description:
      'Enough time to see the region properly: two nights in a cave hotel, a balloon flight, both the Red and Green routes with a licensed guide, and every transfer handled from the moment you land.',
    shortDesc: 'Two nights, a balloon flight and both day-tour routes',
    category: TourCategory.DAILY_TOUR,
    basePrice: 495,
    duration: '3 days, 2 nights',
    maxCapacity: 15,
    images: ['/images/cappadocia-routes-aerial.png'],
    highlights: [
      'Two nights in a cave hotel',
      'Sunrise balloon flight',
      'Red Tour and Green Tour with a guide',
      'All airport and hotel transfers',
    ],
    includes: ['Accommodation with breakfast', 'Balloon flight', 'Two guided day tours', 'All transfers'],
    excludes: ['Flights to Cappadocia', 'Museum entrance fees', 'Gratuities'],
    sortOrder: 24,
  },

  // ── Transfers ──────────────────────────────────────────────────────────
  {
    title: 'Nevşehir Airport Private Transfer',
    slug: 'cappadocia-airport-transfer',
    description:
      'A private vehicle between Nevşehir (NAV) airport and your Cappadocia hotel, scheduled against your flight number. The driver waits inside arrivals with a name sign and tracks delays.',
    shortDesc: 'Private door-to-door transfer from Nevşehir airport',
    category: TourCategory.TRANSFER,
    basePrice: 90,
    duration: '40–50 minutes',
    maxCapacity: 6,
    images: ['/images/cappadocia-routes-aerial.png'],
    highlights: [
      'Private vehicle for your group',
      'Meet and greet inside arrivals',
      'Flight delays tracked',
      'Door-to-door service',
    ],
    includes: ['Private vehicle', 'Driver', 'Luggage', 'One-way transfer'],
    excludes: ['Extra stops', 'Oversize baggage unless arranged', 'Gratuities'],
    sortOrder: 25,
  },
  {
    title: 'Kayseri Airport Private Transfer',
    slug: 'kayseri-airport-private-transfer',
    description:
      'A private vehicle between Kayseri (ASR) airport and your hotel in Göreme, Ürgüp or Uçhisar. The longer of the two airport routes, so worth booking privately if you land late.',
    shortDesc: 'Private door-to-door transfer from Kayseri airport',
    category: TourCategory.TRANSFER,
    basePrice: 100,
    duration: '70–90 minutes',
    maxCapacity: 6,
    images: ['/images/cappadocia-routes-aerial.png'],
    highlights: [
      'Private vehicle for your group',
      'Meet and greet inside arrivals',
      'Available for late-night arrivals',
      'Door-to-door service',
    ],
    includes: ['Private vehicle', 'Driver', 'Luggage', 'One-way transfer'],
    excludes: ['Extra stops', 'Oversize baggage unless arranged', 'Gratuities'],
    sortOrder: 26,
  },
  {
    title: 'Nevşehir Airport Shuttle Transfer',
    slug: 'nevsehir-airport-shuttle',
    description:
      'A shared shuttle between Nevşehir (NAV) airport and hotels in the Göreme, Ürgüp and Uçhisar area. The cheapest way in, with the departure timed to the flight rather than to you.',
    shortDesc: 'Shared shuttle from Nevşehir airport',
    category: TourCategory.TRANSFER,
    basePrice: 12.5,
    duration: '45–70 minutes',
    maxCapacity: 16,
    images: ['/images/cappadocia-tours-hero.png'],
    highlights: [
      'Lowest-cost airport connection',
      'Serves Göreme, Ürgüp and Uçhisar hotels',
      'Seat reserved in advance',
      'Per-person pricing',
    ],
    includes: ['Shuttle seat', 'Driver', 'Standard luggage', 'One-way transfer'],
    excludes: ['Private vehicle', 'Waiting beyond the shuttle schedule', 'Gratuities'],
    sortOrder: 27,
  },
  {
    title: 'Kayseri Airport Shuttle Transfer',
    slug: 'kayseri-airport-shuttle',
    description:
      'A shared shuttle between Kayseri (ASR) airport and the Cappadocia hotel area. Departures are grouped around flight arrivals, so there may be a short wait for other passengers.',
    shortDesc: 'Shared shuttle from Kayseri airport',
    category: TourCategory.TRANSFER,
    basePrice: 12.5,
    duration: '75–100 minutes',
    maxCapacity: 16,
    images: ['/images/cappadocia-tours-hero.png'],
    highlights: [
      'Lowest-cost connection from Kayseri',
      'Serves Göreme, Ürgüp and Uçhisar hotels',
      'Seat reserved in advance',
      'Per-person pricing',
    ],
    includes: ['Shuttle seat', 'Driver', 'Standard luggage', 'One-way transfer'],
    excludes: ['Private vehicle', 'Waiting beyond the shuttle schedule', 'Gratuities'],
    sortOrder: 28,
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kapheratravel.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@kapheratravel.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+90 540 101 50 50',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  for (const tourData of tours) {
    const tour = await prisma.tour.upsert({
      where: { slug: tourData.slug },
      update: tourData,
      create: tourData,
    });
    console.log(`✅ Tour created: ${tour.title}`);

    // Photography is the one add-on we sell on balloon flights; hotel transfer
    // and the celebration are included in the price, not upsold.
    if (tour.category === TourCategory.BALLOON) {
      const name = 'Professional Photography Package';
      const existing = await prisma.tourUpsell.findFirst({ where: { tourId: tour.id, name } });
      if (!existing) {
        await prisma.tourUpsell.create({
          data: {
            tourId: tour.id,
            name,
            description: 'Professional photographer captures your flight with 50+ edited photos',
            price: 75,
            icon: '📸',
          },
        });
      }
    }

    // Availability for today plus the next 90 days. Starting at today matters:
    // same-day bookings are a real share of walk-up traffic, and a missing row
    // silently makes the tour unbookable rather than showing it as sold out.
    const today = new Date();
    for (let i = 0; i <= 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Random seat availability
      const seatsTotal = tour.maxCapacity;
      const booked = Math.floor(Math.random() * (seatsTotal * 0.7));
      const seatsAvailable = seatsTotal - booked;

      // Price variations (weekends more expensive)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const priceOverride = isWeekend ? tour.basePrice * 1.2 : null;

      await prisma.availability.upsert({
        where: {
          tourId_date: { tourId: tour.id, date: new Date(date.toISOString().split('T')[0]) },
        },
        update: {},
        create: {
          tourId: tour.id,
          date: new Date(date.toISOString().split('T')[0]),
          seatsAvailable,
          seatsTotal,
          priceOverride,
        },
      });
    }
    console.log(`  📅 90 days of availability created`);
  }

  // Tours seeded under earlier slugs would otherwise linger in the listing
  // alongside their replacements. Deactivate rather than delete: existing
  // bookings still reference them.
  const retired = await prisma.tour.updateMany({
    where: { slug: { notIn: tours.map((tour) => tour.slug) }, isActive: true },
    data: { isActive: false },
  });
  if (retired.count > 0) console.log(`🗄️  Deactivated ${retired.count} tour(s) no longer in the catalogue`);

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
