import { toursEn } from './tours/en';

/**
 * English is the source of truth: the `Dictionary` type is derived from this
 * file, so every other locale is checked against it at build time.
 */
export const en = {
  meta: {
    title: 'Discovery Cappadocia | Tours & Hot Air Balloon Flights',
    titleTemplate: '%s | Discovery Cappadocia',
    description:
      'Book Cappadocia hot air balloon flights, ATV tours, horse riding, daily tours and airport transfers with a licensed local travel agency.',
    ogTitle: 'Discovery Cappadocia | Local Tours & Experiences',
    ogDescription: 'Explore and book Cappadocia’s essential experiences with local support.',
    keywords: [
      'Cappadocia Hot Air Balloon',
      'Cappadocia Balloon Tour',
      'Cappadocia ATV Tour',
      'Cappadocia Horse Riding',
      'Cappadocia Jeep Safari',
      'Cappadocia Green Tour',
      'Cappadocia Red Tour',
      'Cappadocia Airport Transfer',
    ],
  },

  nav: {
    experiences: 'Experiences',
    balloonFlights: 'Balloon Flights',
    tours: 'Tours',
    faq: 'FAQ',
    partners: 'Partners',
    contact: 'Contact',
    bookNow: 'Book now',
    languageLabel: 'Site language',
    currencyLabel: 'Currency',
    toggleNav: 'Toggle navigation',
    homeAria: 'Discovery Cappadocia home',
    primaryNavAria: 'Primary navigation',
  },

  hero: {
    badge: 'Cappadocia Kaphera Travel Agency',
    titleLead: 'Discover the Magic of',
    titleAccent: 'Cappadocia',
    subtitle:
      'Book unforgettable Cappadocia experiences with a licensed local travel agency. Hot air balloons, daily tours, ATV, horse riding, Jeep safari, airport transfers and more.',
    exploreCta: 'Explore tours',
    whatsappCta: 'WhatsApp us',
    securePayment: 'Secure payment',
    fastConfirmation: 'Fast confirmation',
    humanSupport: 'Real human support',
    helpBar: 'Need help choosing? Message our local team at {phone}',
  },

  trust: {
    eyebrow: 'Book with confidence',
    heading: 'Why book with us?',
    licensedAgency: 'Licensed Turkish Travel Agency',
    tursab: 'TÜRSAB No: {number}',
    reasons: [
      'Licensed local agency',
      'Secure online payment',
      'Instant confirmation',
      'Hotel pickup on selected tours',
      '24/7 WhatsApp support',
      'Clear, upfront prices',
      'Local Cappadocia team',
      'Easy cancellation options',
    ],
  },

  categories: {
    eyebrow: 'Browse by category',
    heading: 'Find your Cappadocia experience',
  },

  popular: {
    eyebrow: 'Guest favourites',
    heading: 'Most Popular Cappadocia Experiences',
    viewAll: 'View all experiences →',
    hotelPickup: 'Hotel pickup',
    from: 'From',
    viewAndBook: 'View & book',
    currencyNote:
      'Displayed currency conversions are indicative. Your final checkout total is confirmed before payment.',
    addWishlist: 'Add to wishlist',
    removeWishlist: 'Remove from wishlist',
    scrollLeft: 'Scroll left',
    scrollRight: 'Scroll right',
  },

  balloon: {
    badge: 'Cappadocia essential',
    heading: 'Fly Over Cappadocia at Sunrise',
    subtitle:
      'Choose the flight style that suits you. We’ll confirm the operator, availability and exact pickup details before payment.',
    cta: 'Check availability',
    imageAlt: 'Hot air balloons flying over Cappadocia at sunrise',
    options: [
      { name: 'Standard Flight', detail: 'A classic sunrise flight in a shared basket.' },
      { name: 'Comfort Flight', detail: 'More personal space with a smaller group.' },
      { name: 'Private Flight', detail: 'A private basket and tailored celebration.' },
    ],
  },

  lastMinute: {
    eyebrow: 'Live inventory',
    heading: 'Last Minute Availability',
    seatsAvailable: '{count} seats available',
  },

  faqSection: {
    eyebrow: 'Clear answers, local help',
    heading: 'Plan with confidence',
    subtitle:
      'Tourism plans can change quickly. Our local support team is available before and after booking to clarify pickup, weather and cancellation details.',
    whatsappCta: 'Ask on WhatsApp',
    whatsappMessage: 'Hello, I have a question about a Cappadocia tour.',
    reviewNote:
      'Google and Tripadvisor review widgets should be enabled only after verified business profile URLs and API access are configured.',
    items: [
      [
        'What happens if my balloon flight is cancelled due to weather?',
        'Safety comes first. If the aviation authority cancels the flight, we will help you move to the next available date or process the refund defined by your booking terms.',
      ],
      [
        'Is hotel pickup included?',
        'Pickup is included on tours marked “Hotel pickup included” or “Selected hotels included.” Enter your hotel when booking so our team can confirm coverage.',
      ],
      [
        'How long is the balloon flight?',
        'The complete experience is usually 3–4 hours, including transfers and preparation. Flight duration depends on the package and operating conditions.',
      ],
      [
        'What should I wear?',
        'Wear closed shoes and layered clothing. Cappadocia mornings can be cool even during warmer months.',
      ],
      [
        'Can children fly?',
        'Age and height restrictions depend on the operator and current safety rules. Send us the child’s age and height before booking.',
      ],
      [
        'When will I receive my pickup time?',
        'Your exact pickup time is confirmed after booking, normally by the evening before your experience.',
      ],
    ] as [string, string][],
  },

  partnersSection: {
    eyebrow: 'Who we work with',
    heading: 'Our partners',
    subtitle: 'Trusted hotels, operators and platforms we work with across Cappadocia.',
  },

  testimonialsSection: {
    eyebrow: 'What our guests say',
    heading: 'Guest reviews',
    subtitle: 'Real feedback from travelers we’ve hosted in Cappadocia.',
  },

  map: {
    eyebrow: 'Explore the Region',
    heading: 'Tour Routes & Destinations',
    subtitle: 'Discover the magical locations you’ll visit on our tours.',
    stopsTitle: 'Tour Stops',
    directions: 'Get directions',
    fitAll: 'Show all stops',
    ariaLabel: 'Interactive map of Cappadocia tour stops',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    note: 'Stops vary by tour. Select one to locate it on the map — your guide confirms the final route the evening before.',
    points: [
      'Göreme Open Air Museum',
      'Balloon Launch Site',
      'Uçhisar Castle',
      'Love Valley',
      'Derinkuyu Underground City',
      'Paşabağ (Monks Valley)',
    ],
    // Same order as `points`.
    descriptions: [
      'UNESCO-listed rock churches with 11th-century frescoes.',
      'Where the sunrise flights lift off, just north of Göreme.',
      'The highest point in Cappadocia, with a 360° valley view.',
      'The famous tall fairy chimneys — best at golden hour.',
      'Eight levels carved underground, 30 km south of Göreme.',
      'Twin- and triple-capped fairy chimneys and a hermit chapel.',
    ],
  },

  footer: {
    ctaTitle: 'Cappadocia is easier with a local expert.',
    ctaSubtitle: 'Tell us your dates and we’ll help build your itinerary.',
    ctaButton: 'Chat with our local team',
    ctaMessage: 'Hello 👋 I would like help planning my Cappadocia trip.',
    blurb:
      'A local Cappadocia booking team for balloon flights, guided tours, adventures and airport transfers.',
    licensedAgency: 'Licensed Travel Agency',
    quickLinksTitle: 'Quick links',
    supportTitle: 'Customer support',
    contactTitle: 'Contact',
    quick: {
      about: 'About us',
      allTours: 'All tours',
      faq: 'FAQ',
      contact: 'Contact',
    },
    support: {
      cancellation: 'Cancellation & Refund Policy',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      distanceSales: 'Distance Sales Agreement',
      kvkk: 'KVKK / Personal Data',
      cookies: 'Cookie Policy',
    },
    rights: '© {year} {name}. All rights reserved.',
    ssl: 'SSL secured',
    secure3d: '3D Secure where supported',
  },

  toursPage: {
    metaTitle: 'All Cappadocia Tours & Experiences',
    metaDescription:
      'Compare Cappadocia balloon flights, guided day tours, outdoor adventures and airport transfers, then book with a licensed local agency.',
    eyebrow: 'Local experiences',
    heading: 'Explore Cappadocia',
    subtitle: 'Compare balloon flights, guided day tours, outdoor adventures and airport transfers.',
    heroAlt: 'Cappadocia tours landscape',
    categories: {
      all: 'All',
      Balloon: 'Balloon',
      'Daily Tour': 'Daily Tour',
      'Private Tour': 'Private Tour',
      Adventure: 'Adventure',
      Cultural: 'Cultural',
      Package: 'Package',
      Transfer: 'Transfer',
    },
    searchPlaceholder: 'Search experiences',
    pickupAvailable: 'Pickup available',
    from: 'From',
    viewDetails: 'View details',
    empty: 'No matching experiences found.',
  },

  tourDetail: {
    metaTitleSuffix: '{title} – Price & Booking',
    metaDescriptionSuffix:
      '{description} Check availability, inclusions, pickup information and book with local support.',
    breadcrumbTours: 'Tours',
    overview: 'Overview',
    highlights: 'Highlights',
    included: 'What’s included',
    notIncluded: 'Not included',
    programTitle: 'Tour program / itinerary',
    programPickupTitle: 'Pickup and briefing',
    programPickupText:
      'We confirm your pickup point and time after booking. The local team provides an activity and safety briefing before departure.',
    programExperienceTitle: 'The experience',
    programExperienceText:
      'The exact route and timing may adjust for weather, traffic and operating conditions so your experience remains safe and enjoyable.',
    programReturnTitle: 'Return',
    programReturnText: 'Return transfer is provided where included in the package selected at checkout.',
    pickupTitle: 'Pickup information',
    pickupText:
      'Enter your hotel name and WhatsApp number during checkout. Exact pickup details are sent after confirmation.',
    cancellationTitle: 'Cancellation policy',
    cancellationText:
      'The applicable cancellation window is shown before payment and on your voucher. Weather-related operator cancellations follow the terms of your confirmed booking.',
    faqTitle: 'Frequently asked questions',
    reviewsTitle: 'Customer reviews',
    reviewsSoon: 'Verified reviews coming soon',
    reviewsText:
      'Reviews will appear here after verified Google or Tripadvisor profiles are connected. We do not publish fabricated ratings.',
    relatedTitle: 'Complete your Cappadocia experience',
    balloonFaq: [
      [
        'What happens if the flight is cancelled due to weather?',
        'We help you reschedule to the next available flight or apply the refund terms shown during checkout.',
      ],
      [
        'Is hotel pickup included?',
        'Pickup is included where stated. Add your hotel during booking so our team can verify it.',
      ],
      [
        'What should I wear?',
        'Closed shoes and layered clothing are recommended, especially before sunrise.',
      ],
      [
        'When will I receive my pickup time?',
        'The exact pickup time is normally confirmed by the evening before your flight.',
      ],
    ] as [string, string][],
  },

  bookingCard: {
    from: 'From',
    perPerson: 'per person',
    note: 'Final availability and total are confirmed before payment.',
    checkAvailability: 'Check availability',
    askWhatsapp: 'Ask on WhatsApp',
    whatsappMessage: 'Hello, I would like information about {title}.',
    freeCancellation: 'Free cancellation where stated',
    freeRescheduling: 'Rescheduling guaranteed for weather delays',
    secureCheckout: 'Secure checkout',
    bookNow: 'BOOK NOW',
  },

  booking: {
    title: 'Book Your Experience',
    subtitle: 'Complete your booking in just a few steps',
    steps: ['Select Tour', 'Pick Date', 'Guests', 'Extras', 'Details', 'Payment'],
    back: '← Back',
    continue: 'Continue →',

    selectTour: {
      heading: 'Choose your experience',
      pickupAvailable: 'Pickup available',
      from: 'From',
      note: 'Availability is confirmed from the booking system before payment.',
    },

    date: {
      heading: 'Select Date',
      subtitle: 'Choose your preferred travel date',
      selected: 'Selected',
      lowAvailability: 'Low availability',
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
    },

    people: {
      heading: 'Select Guests',
      subtitle: 'How many people are joining?',
      adults: 'Guests',
      adultsAge: 'One price per guest',
      children: 'Children',
      childrenAge: 'Age 4–12 (50% discount)',
      privateTitle: 'Private Experience',
      privateSubtitle: 'Exclusive tour just for your group (+50%)',
      capacity: 'Maximum {count} guests per tour',
    },

    variants: {
      heading: 'Choose your route',
      subtitle: 'Pick the option that suits you best for this date',
    },

    upsells: {
      heading: 'Enhance Your Experience',
      subtitle: 'Optional add-ons to make it extra special',
      empty: 'No paid add-ons for this experience — everything else is already included.',
      skip: 'Skip this step →',
      defaultName: 'Professional Photography Package',
      defaultDescription:
        'Professional photographer captures your experience with 50+ edited photos delivered digitally',
    },

    userInfo: {
      heading: 'Your Information',
      subtitle: 'We’ll use this to confirm your booking',
      fullName: 'Full Name *',
      fullNamePlaceholder: 'John Doe',
      email: 'Email Address *',
      emailPlaceholder: 'john@example.com',
      phone: 'Phone Number *',
      phonePlaceholder: '+90 555 000 0000',
      hotelName: 'Hotel Name *',
      hotelNamePlaceholder: 'Enter your hotel name',
      notes: 'Special Requests (Optional)',
      notesPlaceholder: 'Any special requirements or requests...',
      requiredNote:
        '* Required fields. Your information is secure and will only be used for booking purposes.',
      consentPrefix: 'I have read the',
      consentPrivacy: 'Privacy Policy',
      consentMiddle: ',',
      consentKvkk: 'KVKK notice',
      consentSuffix: 'and the tour-specific booking conditions.',
      errorName: 'Please enter your full name',
      errorEmail: 'Please enter a valid email address',
      errorPhone: 'Please enter a valid phone number',
      errorHotelName: 'Please enter your hotel name',
      errorConsent: 'Please confirm the privacy notice and booking terms',
      continueToPayment: 'Continue to Payment →',
    },

    payment: {
      heading: 'Payment',
      subtitle: 'Your booking is not confirmed until payment succeeds.',
      methodTitle: 'Select payment method',
      card: 'Credit card',
      cardBrands: 'Visa, Mastercard',
      iyzico: 'iyzico',
      iyzicoNote: 'Secure local checkout',
      promoLabel: 'Promo code',
      promoPlaceholder: 'Enter code',
      promoNote: 'Validated securely',
      ssl: 'SSL secured',
      secure3d: '3D Secure where supported',
      cardHandled: 'Card data handled by payment provider',
      stripeDisabled:
        'Card checkout is disabled until NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is configured.',
      continueToSecure: 'Continue to secure payment',
      secureCardHeading: 'Secure card payment',
      secureIyzicoHeading: 'Secure iyzico payment',
      payButton: 'Pay {amount} securely',
      errorGeneric: 'Payment could not be completed.',
      errorSetup: 'Payment setup failed. No charge was made.',
      errorSession: 'Secure payment session could not be created.',
      errorIyzico: 'iyzico checkout could not be created.',
      pending: 'Your payment is being confirmed. Please keep this page open.',
    },

    success: {
      heading: 'Booking Confirmed!',
      subtitle:
        'Payment received. Keep this reservation summary and contact our team if you need pickup assistance.',
      detailsTitle: 'Booking Details',
      reservationNumber: 'Reservation Number',
      processing: 'Processing',
      tour: 'Tour',
      date: 'Date',
      guests: 'Guests',
      totalPaid: 'Total Paid',
      backHome: 'Back to Home',
      printVoucher: 'Print / Save Voucher',
      whatsappSupport: 'WhatsApp Support',
      whatsappMessage: 'Hello, I need help with reservation {number}.',
      needHelp: 'Need help? Contact us at',
    },

    summary: {
      title: 'Booking Summary',
      privateUpgrade: 'Private tour upgrade',
      total: 'Total',
      taxesIncluded: 'Taxes included',
      adultsLine: '{count}x Guest × {price}',
      childrenLine: '{count}x Child × {price}',
    },

    guests: {
      adults: '{count} Guest',
      adultsPlural: '{count} Guests',
      children: '{count} Child',
      childrenPlural: '{count} Children',
      private: '(Private)',
    },
  },

  chat: {
    greetingTitle: 'Welcome to Cappadocia!',
    greetingText: 'How can we help you today?',
    closeLabel: 'Close assistant',
    openLabel: 'Open WhatsApp tour assistant',
    choices: [
      'Hot Air Balloon',
      'ATV Tour',
      'Horse Riding',
      'Jeep Safari',
      'Daily Tours',
      'Airport Transfer',
    ],
    other: 'Other / Ask us on WhatsApp',
    otherMessage: 'Hello 👋 I need help choosing a Cappadocia experience.',
  },

  cookie: {
    aria: 'Cookie preferences',
    title: 'Your privacy choices',
    textPrefix:
      'We use essential cookies to operate bookings. Analytics and advertising cookies are loaded only after your consent. See our',
    policyLink: 'Cookie Policy',
    textSuffix: '.',
    essentialOnly: 'Essential only',
    acceptAll: 'Accept all',
  },

  notFound: {
    title: 'This route drifted off course.',
    text: 'The experience may have moved or is no longer available.',
    cta: 'Explore available tours',
  },

  whatsapp: {
    defaultMessage:
      'Hello 👋 Welcome to Discovery Cappadocia!\nI would like to get information about Cappadocia tours.',
  },

  tours: toursEn,
};

/**
 * Derived from the English dictionary above (no `as const`, so values widen to
 * `string`/`string[]`). Every other locale is annotated with this type, which
 * makes a missing or misspelled key a build error rather than a runtime blank.
 */
export type Dictionary = typeof en;
export type TourSlug = keyof Dictionary['tours'];
