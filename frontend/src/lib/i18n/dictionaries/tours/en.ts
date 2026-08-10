/**
 * Tour copy, English — the source of truth for the catalogue.
 *
 * `TourCopy` is derived from this object, so every other locale in this folder
 * is checked against it at build time: a missing tour, a missing field or a
 * misspelled slug is a compile error rather than a blank on the page.
 *
 * Prices live in `lib/site.ts`, not here — they do not change per language.
 */
export const toursEn = {
  // ── Balloon ────────────────────────────────────────────────────────────
  'cappadocia-hot-air-balloon': {
    title: 'Göreme Balloon Ride (Economy Class)',
    category: 'Balloon',
    description:
      'The classic Cappadocia sunrise flight. You lift off from the Göreme area just before dawn and float over the fairy chimneys and valleys in a shared basket, with a licensed operator and an experienced pilot.',
    duration: '3–4 hours (about 60 minutes in the air)',
    startTime: 'Before sunrise',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Best seller',
    highlights: [
      'Sunrise over the fairy chimneys',
      'Roughly 60 minutes of flight time',
      'Licensed operator and certified pilot',
      'Celebration and flight certificate after landing',
    ],
    included: ['Hotel transfer', 'Light breakfast', 'Flight insurance', 'Flight certificate'],
    notIncluded: ['Personal expenses', 'Professional photos', 'Gratuities'],
  },
  'cappadocia-balloon-comfort': {
    title: 'Göreme Balloon Ride (Comfort Class)',
    category: 'Balloon',
    description:
      'The same sunrise route as the economy flight, flown in a smaller basket with fewer passengers. More room at the edge of the basket means a clearer view and easier photography throughout the flight.',
    duration: '3–4 hours (about 60 minutes in the air)',
    startTime: 'Before sunrise',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Best seller',
    highlights: [
      'Smaller basket, fewer passengers',
      'More space at the basket edge for photos',
      'Roughly 60 minutes of flight time',
      'Champagne celebration on landing',
    ],
    included: ['Hotel transfer', 'Light breakfast', 'Flight insurance', 'Flight certificate'],
    notIncluded: ['Personal expenses', 'Professional photos', 'Gratuities'],
  },
  'cappadocia-balloon-private': {
    title: 'Private Balloon Flight',
    category: 'Balloon',
    description:
      'A balloon basket reserved for your group alone, with the flight shaped around you — proposals, anniversaries and honeymoons included. The listed price covers the basket, not one seat.',
    duration: '3–4 hours (about 60 minutes in the air)',
    startTime: 'Before sunrise',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Signature experience',
    highlights: [
      'Basket reserved for your group only',
      'Ideal for proposals and anniversaries',
      'Pilot briefed on your occasion',
      'Private celebration after landing',
    ],
    included: ['Private basket', 'Hotel transfer', 'Flight insurance', 'Celebration and certificate'],
    notIncluded: ['Personal expenses', 'Professional photos', 'Gratuities'],
  },
  'soganli-valley-balloon': {
    title: 'Soğanlı Valley Balloon Ride (Comfort Flight)',
    category: 'Balloon',
    description:
      'A flight over the quieter Soğanlı Valley, south of Göreme, where the rock churches and cone formations sit in far less crowded sky. A good alternative on days when Göreme flights are fully booked.',
    duration: '4–5 hours (about 60 minutes in the air)',
    startTime: 'Before sunrise',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Limited availability',
    highlights: [
      'Quieter valley with fewer balloons in the sky',
      'Rock churches and cone formations from above',
      'Comfort basket with fewer passengers',
      'Transfer from the Göreme and Ürgüp area',
    ],
    included: ['Hotel transfer', 'Light breakfast', 'Flight insurance', 'Flight certificate'],
    notIncluded: ['Personal expenses', 'Professional photos', 'Gratuities'],
  },
  'cappadocia-balloon-watching': {
    title: 'Balloon Watching Tour',
    category: 'Balloon',
    description:
      'For those who would rather photograph the balloons than fly in one. You are driven to the best viewpoint for the morning’s conditions and watch a hundred-odd balloons rise with the sun over breakfast.',
    duration: '2 hours',
    startTime: 'Before sunrise',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Likely to sell out',
    highlights: [
      'Viewpoint chosen for the morning’s wind direction',
      'Balloons rising with the sunrise',
      'Turkish breakfast and hot drinks at the viewpoint',
      'A budget alternative to flying',
    ],
    included: ['Hotel transfer', 'Breakfast and hot drinks', 'Driver-guide', 'Photo stops'],
    notIncluded: ['Balloon flight', 'Personal expenses', 'Gratuities'],
  },

  // ── Daily tours ────────────────────────────────────────────────────────
  'cappadocia-red-tour': {
    title: 'Cappadocia Red Tour',
    category: 'Daily Tour',
    description:
      'The northern Cappadocia route and the best introduction to the region: the Göreme Open Air Museum, the Uçhisar and Göreme panoramas, the fairy chimneys of Paşabağ and the pottery workshops of Avanos.',
    duration: '8–9 hours',
    startTime: '09:30 approx.',
    pickup: 'Hotel pickup included',
    languages: 'English',
    badge: 'Best seller',
    highlights: [
      'Göreme Open Air Museum',
      'Uçhisar Castle panorama',
      'Paşabağ and Devrent fairy chimneys',
      'Avanos pottery demonstration',
    ],
    included: ['Licensed guide', 'Air-conditioned transport', 'Lunch', 'Hotel pickup and drop-off'],
    notIncluded: ['Museum entrance fees', 'Drinks', 'Gratuities'],
  },
  'cappadocia-green-tour': {
    title: 'Cappadocia Green Tour',
    category: 'Daily Tour',
    description:
      'The southern route, built around the underground city of Derinkuyu and the four-kilometre walk through the Ihlara Valley. A longer, more active day than the Red Tour, with Selime Monastery at the end.',
    duration: '9–10 hours',
    startTime: '09:30 approx.',
    pickup: 'Hotel pickup included',
    languages: 'English',
    badge: 'Likely to sell out',
    highlights: [
      'Derinkuyu Underground City',
      'Ihlara Valley walk (about 4 km)',
      'Selime Monastery',
      'Pigeon Valley panorama',
    ],
    included: ['Licensed guide', 'Air-conditioned transport', 'Lunch', 'Hotel pickup and drop-off'],
    notIncluded: ['Museum entrance fees', 'Drinks', 'Gratuities'],
  },
  'cappadocia-blue-tour': {
    title: 'Cappadocia Blue Tour',
    category: 'Daily Tour',
    description:
      'The route most visitors never reach: Soğanlı Valley, the Keşlik Monastery and the Cappadocian villages of the south, away from the coach traffic. A slower day, with more time at each stop.',
    duration: '8–9 hours',
    startTime: '09:30 approx.',
    pickup: 'Hotel pickup included',
    languages: 'English',
    badge: '',
    highlights: [
      'Soğanlı Valley rock churches',
      'Keşlik Monastery',
      'Mustafapaşa (Sinasos) old Greek village',
      'Cave rooms and quiet viewpoints',
    ],
    included: ['Licensed guide', 'Air-conditioned transport', 'Lunch', 'Hotel pickup and drop-off'],
    notIncluded: ['Museum entrance fees', 'Drinks', 'Gratuities'],
  },
  'cappadocia-mix-tour': {
    title: 'Cappadocia Mix Tour',
    category: 'Daily Tour',
    description:
      'The headline stops of both the Red and Green routes in a single day, for travellers with only one day in Cappadocia: an underground city, the best panoramas and the fairy chimney valleys.',
    duration: '8–9 hours',
    startTime: '09:30 approx.',
    pickup: 'Hotel pickup included',
    languages: 'English',
    badge: 'Best seller',
    highlights: [
      'An underground city',
      'Fairy chimney valleys',
      'Best panoramic viewpoints',
      'Designed for one-day visits',
    ],
    included: ['Licensed guide', 'Air-conditioned transport', 'Lunch', 'Hotel pickup and drop-off'],
    notIncluded: ['Museum entrance fees', 'Drinks', 'Gratuities'],
  },

  // ── Private tours ──────────────────────────────────────────────────────
  'cappadocia-private-red-tour': {
    title: 'Private Red Tour (up to 18 people)',
    category: 'Private Tour',
    description:
      'The Red Tour route with a vehicle and guide for your group alone. You set the departure time, decide how long to stay at each stop and can drop or add sites. The price is for the whole vehicle, not per person.',
    duration: '8–9 hours',
    startTime: 'Your choice',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Best seller',
    highlights: [
      'Vehicle and guide for your group only',
      'Departure time and pace set by you',
      'Itinerary adjustable on the day',
      'One price for up to 18 people',
    ],
    included: ['Private licensed guide', 'Private vehicle and driver', 'Lunch', 'Hotel pickup and drop-off'],
    notIncluded: ['Museum entrance fees', 'Drinks', 'Gratuities'],
  },
  'cappadocia-private-green-tour': {
    title: 'Private Green Tour (up to 18 people)',
    category: 'Private Tour',
    description:
      'Derinkuyu, the Ihlara Valley and Selime Monastery at your own pace, with a private guide and vehicle. Useful if you want the full Ihlara walk — or a shorter version of it — without a group schedule.',
    duration: '9–10 hours',
    startTime: 'Your choice',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Likely to sell out',
    highlights: [
      'Vehicle and guide for your group only',
      'Ihlara walk shortened or extended as you like',
      'Departure time set by you',
      'One price for up to 18 people',
    ],
    included: ['Private licensed guide', 'Private vehicle and driver', 'Lunch', 'Hotel pickup and drop-off'],
    notIncluded: ['Museum entrance fees', 'Drinks', 'Gratuities'],
  },
  'cappadocia-private-mix-tour': {
    title: 'Private Mix Tour (up to 18 people)',
    category: 'Private Tour',
    description:
      'A private day built from the strongest stops of both routes. Tell us what you care about — history, photography, walking or the least crowded viewpoints — and the guide plans the day around it.',
    duration: '8–9 hours',
    startTime: 'Your choice',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Best seller',
    highlights: [
      'Itinerary planned around your interests',
      'Vehicle and guide for your group only',
      'Photography-friendly timing',
      'One price for up to 18 people',
    ],
    included: ['Private licensed guide', 'Private vehicle and driver', 'Lunch', 'Hotel pickup and drop-off'],
    notIncluded: ['Museum entrance fees', 'Drinks', 'Gratuities'],
  },

  // ── Adventure ──────────────────────────────────────────────────────────
  'cappadocia-sunset-atv-tour': {
    title: 'Sunset ATV Tour',
    category: 'Adventure',
    description:
      'Ride a quad through Love Valley, Rose Valley and Sword Valley on tracks a coach cannot reach, timed so the last stretch runs as the rock turns gold. No experience needed — a briefing comes first.',
    duration: '2 hours',
    startTime: 'Before sunset',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Likely to sell out',
    highlights: [
      'Love, Rose and Sword valleys',
      'Sunset viewpoint stop',
      'Beginner-friendly briefing',
      'Helmet and goggles provided',
    ],
    included: ['ATV and fuel', 'Safety equipment', 'Local guide', 'Hotel pickup and drop-off'],
    notIncluded: ['Drinks', 'Personal expenses', 'Gratuities'],
  },
  'cappadocia-horse-riding': {
    title: 'Sunset Horseback Riding',
    category: 'Adventure',
    description:
      'Cappadocia means “land of beautiful horses”, and the valleys are still best seen from one. Quiet trails, a calm pace and a local guide, with the route matched to your riding experience.',
    duration: '2 hours',
    startTime: 'Sunrise or sunset',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Likely to sell out',
    highlights: [
      'Quiet valley trails',
      'Horses matched to your experience',
      'Sunrise or sunset departure',
      'Scenic photo stops',
    ],
    included: ['Horse and equipment', 'Helmet', 'Local guide', 'Hotel pickup and drop-off'],
    notIncluded: ['Personal expenses', 'Photos', 'Gratuities'],
  },
  'cappadocia-jeep-safari': {
    title: 'Cappadocia Jeep Safari',
    category: 'Adventure',
    description:
      'An open-top 4x4 along valley floors and up to viewpoints the tour buses never see, with the driver stopping wherever the light is worth it. Comfortable for families and groups who would rather not drive themselves.',
    duration: '2–3 hours',
    startTime: 'Morning or sunset',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: '',
    highlights: [
      'Off-road valley route',
      'Panoramic viewpoints away from the crowds',
      'Local driver-guide',
      'Family-friendly alternative to ATV',
    ],
    included: ['Jeep and driver', 'Fuel', 'Insurance', 'Hotel pickup and drop-off'],
    notIncluded: ['Food and drinks', 'Personal expenses', 'Gratuities'],
  },
  'cappadocia-camel-riding': {
    title: 'Camel Riding Tour',
    category: 'Adventure',
    description:
      'A short, gentle ride through the fairy chimneys on the animal that gave Cappadocia its Camel Rock. Slow enough for photographs and easy enough for children, with a handler alongside throughout.',
    duration: '1–2 hours',
    startTime: 'Sunrise or sunset',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: '',
    highlights: [
      'Ride among the fairy chimneys',
      'Handler walks alongside throughout',
      'Suitable for children',
      'Excellent photo opportunities',
    ],
    included: ['Camel and handler', 'Safety briefing', 'Photo stops', 'Hotel pickup and drop-off'],
    notIncluded: ['Personal expenses', 'Photos', 'Gratuities'],
  },
  'cappadocia-classic-car-tour': {
    title: 'Classic Car Tour',
    category: 'Adventure',
    description:
      'A vintage convertible, a driver and a route through the valleys and viewpoints — the shot everyone comes back from Cappadocia with. Book the sunrise slot if you want the balloons in the background.',
    duration: '2 hours',
    startTime: 'Sunrise or sunset',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Best seller',
    highlights: [
      'Vintage convertible with driver',
      'Sunrise slot puts balloons in the frame',
      'Stops at the best photo viewpoints',
      'Car reserved for your group',
    ],
    included: ['Classic car and driver', 'Fuel', 'Photo stops', 'Hotel pickup and drop-off'],
    notIncluded: ['Professional photographer', 'Personal expenses', 'Gratuities'],
  },

  // ── Cultural ───────────────────────────────────────────────────────────
  'cappadocia-turkish-night': {
    title: 'Turkish Night Show',
    category: 'Cultural',
    description:
      'Dinner in a restored cave restaurant with folk dances from across Anatolia, a whirling dervish sema and live music. Unlimited local drinks are included, and the evening finishes with the hotel transfer.',
    duration: '3 hours',
    startTime: 'Evening',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Best seller',
    highlights: [
      'Dinner in a cave restaurant',
      'Anatolian folk dances and live music',
      'Whirling dervish performance',
      'Unlimited local drinks',
    ],
    included: ['Dinner', 'Local drinks', 'Show', 'Hotel pickup and drop-off'],
    notIncluded: ['Imported drinks', 'Personal expenses', 'Gratuities'],
  },
  'cappadocia-whirling-dervish': {
    title: 'Whirling Dervish Ceremony',
    category: 'Cultural',
    description:
      'The sema is a religious ceremony, not a floor show, and it is performed here as one — in a restored caravanserai, in silence, with no photography during the ritual. Around an hour, including the introduction.',
    duration: '1 hour',
    startTime: 'Evening',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Limited availability',
    highlights: [
      'Authentic sema ceremony',
      'Held in a historic caravanserai',
      'Short introduction to the ritual',
      'Quiet, respectful setting',
    ],
    included: ['Ceremony ticket', 'Introduction to the sema', 'Hotel pickup and drop-off', 'Seating'],
    notIncluded: ['Food and drinks', 'Photography during the ritual', 'Gratuities'],
  },
  'cappadocia-pottery-workshop': {
    title: 'Pottery Making Experience',
    category: 'Cultural',
    description:
      'Avanos has thrown pots from Kızılırmak clay for four thousand years. A master potter shows you the kick wheel, then hands it over — you shape your own piece and take it with you.',
    duration: '20–40 minutes',
    startTime: 'Flexible',
    pickup: 'On request',
    languages: 'English, Turkish',
    badge: 'Best seller',
    highlights: [
      'Traditional kick wheel with a master potter',
      'Red Kızılırmak river clay',
      'Shape your own piece',
      'Take your piece home',
    ],
    included: ['Workshop session', 'Clay and materials', 'Master potter', 'Your finished piece'],
    notIncluded: ['Hotel transfer unless arranged', 'Shipping of large pieces', 'Gratuities'],
  },
  'cappadocia-turkish-bath': {
    title: 'Turkish Bath (Hamam)',
    category: 'Cultural',
    description:
      'A traditional hamam in a stone bath house: the heated marble slab, a foam wash and a scrub, followed by tea in the resting room. The obvious way to end a day of walking through valleys.',
    duration: '1–2 hours',
    startTime: 'Flexible',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Likely to sell out',
    highlights: [
      'Heated marble slab and steam room',
      'Traditional scrub and foam wash',
      'Separate or shared sections available',
      'Tea in the resting room',
    ],
    included: ['Hamam entry', 'Scrub and foam wash', 'Towels and slippers', 'Hotel pickup and drop-off'],
    notIncluded: ['Oil massage (extra)', 'Personal expenses', 'Gratuities'],
  },
  'cappadocia-photoshoot': {
    title: 'Cappadocia Photoshoot Tour',
    category: 'Cultural',
    description:
      'A professional photographer, a driver and two hours across the best-lit locations in the region — carpet-covered stairs, valley viewpoints, the balloons at dawn. Edited images are delivered afterwards.',
    duration: '2 hours',
    startTime: 'Sunrise',
    pickup: 'Hotel pickup included',
    languages: 'English, Turkish',
    badge: 'Likely to sell out',
    highlights: [
      'Professional photographer and driver',
      'Multiple locations in one session',
      'Balloons in frame on the sunrise slot',
      'Edited images delivered digitally',
    ],
    included: ['Photographer', 'Vehicle and driver', 'Edited digital images', 'Hotel pickup and drop-off'],
    notIncluded: ['Costume rental', 'Printed albums', 'Gratuities'],
  },

  // ── Packages ───────────────────────────────────────────────────────────
  'cappadocia-2day-package': {
    title: '1 Night 2 Days Cappadocia Package',
    category: 'Package',
    description:
      'A complete weekend: cave hotel accommodation, a balloon flight at sunrise, a full guided day tour and all transfers, arranged as one booking so nothing has to be coordinated on the ground.',
    duration: '2 days, 1 night',
    startTime: 'Arrival day',
    pickup: 'Airport pickup included',
    languages: 'English, Turkish',
    badge: 'Best seller',
    highlights: [
      'One night in a cave hotel',
      'Sunrise balloon flight',
      'Full-day guided tour',
      'All airport and hotel transfers',
    ],
    included: ['Accommodation with breakfast', 'Balloon flight', 'Guided day tour', 'All transfers'],
    notIncluded: ['Flights to Cappadocia', 'Museum entrance fees', 'Gratuities'],
  },
  'cappadocia-3day-package': {
    title: '2 Nights 3 Days Cappadocia Package',
    category: 'Package',
    description:
      'Enough time to see the region properly: two nights in a cave hotel, a balloon flight, both the Red and Green routes with a licensed guide, and every transfer handled from the moment you land.',
    duration: '3 days, 2 nights',
    startTime: 'Arrival day',
    pickup: 'Airport pickup included',
    languages: 'English, Turkish',
    badge: 'Best seller',
    highlights: [
      'Two nights in a cave hotel',
      'Sunrise balloon flight',
      'Red Tour and Green Tour with a guide',
      'All airport and hotel transfers',
    ],
    included: ['Accommodation with breakfast', 'Balloon flight', 'Two guided day tours', 'All transfers'],
    notIncluded: ['Flights to Cappadocia', 'Museum entrance fees', 'Gratuities'],
  },

  // ── Transfers ──────────────────────────────────────────────────────────
  'cappadocia-airport-transfer': {
    title: 'Nevşehir Airport Private Transfer',
    category: 'Transfer',
    description:
      'A private vehicle between Nevşehir (NAV) airport and your Cappadocia hotel, scheduled against your flight number. The driver waits inside arrivals with a name sign and tracks delays.',
    duration: '40–50 minutes',
    startTime: 'Matched to your flight',
    pickup: 'Airport or hotel pickup',
    languages: 'English, Turkish',
    badge: '',
    highlights: [
      'Private vehicle for your group',
      'Meet and greet inside arrivals',
      'Flight delays tracked',
      'Door-to-door service',
    ],
    included: ['Private vehicle', 'Driver', 'Luggage', 'One-way transfer'],
    notIncluded: ['Extra stops', 'Oversize baggage unless arranged', 'Gratuities'],
  },
  'kayseri-airport-private-transfer': {
    title: 'Kayseri Airport Private Transfer',
    category: 'Transfer',
    description:
      'A private vehicle between Kayseri (ASR) airport and your hotel in Göreme, Ürgüp or Uçhisar. The longer of the two airport routes, so worth booking privately if you land late.',
    duration: '70–90 minutes',
    startTime: 'Matched to your flight',
    pickup: 'Airport or hotel pickup',
    languages: 'English, Turkish',
    badge: '',
    highlights: [
      'Private vehicle for your group',
      'Meet and greet inside arrivals',
      'Available for late-night arrivals',
      'Door-to-door service',
    ],
    included: ['Private vehicle', 'Driver', 'Luggage', 'One-way transfer'],
    notIncluded: ['Extra stops', 'Oversize baggage unless arranged', 'Gratuities'],
  },
  'nevsehir-airport-shuttle': {
    title: 'Nevşehir Airport Shuttle Transfer',
    category: 'Transfer',
    description:
      'A shared shuttle between Nevşehir (NAV) airport and hotels in the Göreme, Ürgüp and Uçhisar area. The cheapest way in, with the departure timed to the flight rather than to you.',
    duration: '45–70 minutes',
    startTime: 'Matched to flight arrivals',
    pickup: 'Airport or hotel pickup',
    languages: 'English, Turkish',
    badge: 'Likely to sell out',
    highlights: [
      'Lowest-cost airport connection',
      'Serves Göreme, Ürgüp and Uçhisar hotels',
      'Seat reserved in advance',
      'Per-person pricing',
    ],
    included: ['Shuttle seat', 'Driver', 'Standard luggage', 'One-way transfer'],
    notIncluded: ['Private vehicle', 'Waiting beyond the shuttle schedule', 'Gratuities'],
  },
  'kayseri-airport-shuttle': {
    title: 'Kayseri Airport Shuttle Transfer',
    category: 'Transfer',
    description:
      'A shared shuttle between Kayseri (ASR) airport and the Cappadocia hotel area. Departures are grouped around flight arrivals, so there may be a short wait for other passengers.',
    duration: '75–100 minutes',
    startTime: 'Matched to flight arrivals',
    pickup: 'Airport or hotel pickup',
    languages: 'English, Turkish',
    badge: 'Likely to sell out',
    highlights: [
      'Lowest-cost connection from Kayseri',
      'Serves Göreme, Ürgüp and Uçhisar hotels',
      'Seat reserved in advance',
      'Per-person pricing',
    ],
    included: ['Shuttle seat', 'Driver', 'Standard luggage', 'One-way transfer'],
    notIncluded: ['Private vehicle', 'Waiting beyond the shuttle schedule', 'Gratuities'],
  },
};

/** Shape every other locale in this folder must match. */
export type TourCopy = typeof toursEn;
