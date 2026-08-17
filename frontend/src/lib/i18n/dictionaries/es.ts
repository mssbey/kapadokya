import type { Dictionary } from './en';
import { toursEs } from './tours/es';

export const es: Dictionary = {
  meta: {
    title: 'Discovery Cappadocia | Tours y vuelos en globo en Capadocia',
    titleTemplate: '%s | Discovery Cappadocia',
    description:
      'Reserva vuelos en globo, tours en quad, paseos a caballo, excursiones de un día y traslados al aeropuerto en Capadocia con una agencia local autorizada.',
    ogTitle: 'Discovery Cappadocia | Tours y experiencias locales',
    ogDescription: 'Descubre y reserva las experiencias esenciales de Capadocia con apoyo local.',
    keywords: [
      'Globo aerostático Capadocia',
      'Tour en globo Capadocia',
      'Tour en quad Capadocia',
      'Paseo a caballo Capadocia',
      'Jeep safari Capadocia',
      'Tour verde Capadocia',
      'Tour rojo Capadocia',
      'Traslado aeropuerto Capadocia',
    ],
  },

  nav: {
    experiences: 'Experiencias',
    balloonFlights: 'Vuelos en globo',
    tours: 'Tours',
    faq: 'Preguntas',
    partners: 'Socios',
    contact: 'Contacto',
    bookNow: 'Reservar',
    languageLabel: 'Idioma del sitio',
    currencyLabel: 'Moneda',
    toggleNav: 'Abrir o cerrar el menú',
    homeAria: 'Inicio de Discovery Cappadocia',
    primaryNavAria: 'Navegación principal',
  },

  hero: {
    badge: 'Cappadocia Kaphera Travel Agency',
    titleLead: 'Descubre la magia de',
    titleAccent: 'Capadocia',
    subtitle:
      'Reserva experiencias inolvidables en Capadocia con una agencia de viajes local autorizada. Globos aerostáticos, excursiones de un día, quads, paseos a caballo, jeep safari, traslados al aeropuerto y mucho más.',
    exploreCta: 'Ver tours',
    whatsappCta: 'Escríbenos por WhatsApp',
    securePayment: 'Pago seguro',
    fastConfirmation: 'Confirmación rápida',
    humanSupport: 'Atención humana real',
    helpBar: '¿No sabes qué elegir? Escribe a nuestro equipo local al {phone}',
  },

  trust: {
    eyebrow: 'Reserva con confianza',
    heading: '¿Por qué reservar con nosotros?',
    licensedAgency: 'Agencia de viajes turca autorizada',
    tursab: 'TÜRSAB n.º: {number}',
    reasons: [
      'Agencia local autorizada',
      'Pago online seguro',
      'Confirmación inmediata',
      'Recogida en hotel en tours seleccionados',
      'Soporte por WhatsApp 24/7',
      'Precios claros y por adelantado',
      'Equipo local en Capadocia',
      'Opciones de cancelación sencillas',
    ],
  },

  categories: {
    eyebrow: 'Explorar por categoría',
    heading: 'Encuentra tu experiencia en Capadocia',
  },

  popular: {
    eyebrow: 'Favoritos de los viajeros',
    heading: 'Las experiencias más populares de Capadocia',
    viewAll: 'Ver todas las experiencias →',
    hotelPickup: 'Recogida en hotel',
    from: 'Desde',
    viewAndBook: 'Ver y reservar',
    currencyNote:
      'Las conversiones de moneda mostradas son orientativas. El total final se confirma antes del pago.',
    addWishlist: 'Añadir a favoritos',
    removeWishlist: 'Quitar de favoritos',
    scrollLeft: 'Desplazar a la izquierda',
    scrollRight: 'Desplazar a la derecha',
  },

  balloon: {
    badge: 'Imprescindible en Capadocia',
    heading: 'Vuela sobre Capadocia al amanecer',
    subtitle:
      'Elige el tipo de vuelo que prefieras. Confirmamos el operador, la disponibilidad y los detalles exactos de recogida antes del pago.',
    cta: 'Consultar disponibilidad',
    imageAlt: 'Globos aerostáticos volando sobre Capadocia al amanecer',
    options: [
      { name: 'Vuelo estándar', detail: 'Un clásico vuelo al amanecer en cesta compartida.' },
      { name: 'Vuelo confort', detail: 'Más espacio personal con un grupo más reducido.' },
      { name: 'Vuelo privado', detail: 'Cesta privada y celebración a tu medida.' },
    ],
  },

  lastMinute: {
    eyebrow: 'Disponibilidad en vivo',
    heading: 'Disponibilidad de última hora',
    seatsAvailable: '{count} plazas disponibles',
  },

  faqSection: {
    eyebrow: 'Respuestas claras, ayuda local',
    heading: 'Planifica con confianza',
    subtitle:
      'Los planes de viaje pueden cambiar rápido. Nuestro equipo local está disponible antes y después de la reserva para aclarar recogidas, meteorología y condiciones de cancelación.',
    whatsappCta: 'Preguntar por WhatsApp',
    whatsappMessage: 'Hola, tengo una pregunta sobre un tour en Capadocia.',
    reviewNote:
      'Los widgets de reseñas de Google y Tripadvisor solo deben activarse tras configurar los perfiles de empresa verificados y el acceso a la API.',
    items: [
      [
        '¿Qué ocurre si mi vuelo en globo se cancela por el tiempo?',
        'La seguridad es lo primero. Si la autoridad aeronáutica cancela el vuelo, te ayudamos a pasar a la siguiente fecha disponible o tramitamos el reembolso definido en tus condiciones de reserva.',
      ],
      [
        '¿Está incluida la recogida en el hotel?',
        'La recogida está incluida en los tours marcados como «Recogida en hotel incluida» o «Hoteles seleccionados incluidos». Indica tu hotel al reservar para que nuestro equipo confirme la cobertura.',
      ],
      [
        '¿Cuánto dura el vuelo en globo?',
        'La experiencia completa suele durar entre 3 y 4 horas, incluidos los traslados y la preparación. La duración del vuelo depende del paquete y de las condiciones de operación.',
      ],
      [
        '¿Qué ropa debo llevar?',
        'Lleva calzado cerrado y ropa por capas. Las mañanas en Capadocia pueden ser frescas incluso en los meses cálidos.',
      ],
      [
        '¿Pueden volar los niños?',
        'Las restricciones de edad y altura dependen del operador y de las normas de seguridad vigentes. Envíanos la edad y la altura del niño antes de reservar.',
      ],
      [
        '¿Cuándo sabré mi hora de recogida?',
        'La hora exacta de recogida se confirma tras la reserva, normalmente la tarde anterior a tu experiencia.',
      ],
    ],
  },

  partnersSection: {
    eyebrow: 'Con quién trabajamos',
    heading: 'Nuestros socios',
    subtitle: 'Hoteles, operadores y plataformas de confianza con los que trabajamos en Capadocia.',
  },

  testimonialsSection: {
    eyebrow: 'Lo que dicen nuestros huéspedes',
    heading: 'Opiniones de huéspedes',
    subtitle: 'Comentarios reales de viajeros que hemos recibido en Capadocia.',
  },

  map: {
    eyebrow: 'Explora la región',
    heading: 'Rutas y destinos de los tours',
    subtitle: 'Descubre los lugares mágicos que visitarás en nuestros tours',
    stopsTitle: 'Paradas del tour',
    directions: 'Cómo llegar',
    fitAll: 'Ver todas las paradas',
    ariaLabel: 'Mapa interactivo de las paradas de los tours en Capadocia',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    note: 'Las paradas varían según el tour. Selecciona una para localizarla en el mapa; tu guía confirma la ruta final la noche anterior.',
    points: [
      'Museo al aire libre de Göreme',
      'Zona de despegue de globos',
      'Castillo de Uçhisar',
      'Valle del Amor',
      'Ciudad subterránea de Derinkuyu',
      'Paşabağ (Valle de los Monjes)',
    ],
    descriptions: [
      'Iglesias rupestres declaradas Patrimonio de la UNESCO con frescos del siglo XI.',
      'La zona de despegue de los vuelos del amanecer, al norte de Göreme.',
      'El punto más alto de Capadocia, con vistas de 360° a los valles.',
      'Las famosas chimeneas de hadas altas: mejor a la hora dorada.',
      'Ocho niveles excavados bajo tierra, a 30 km al sur de Göreme.',
      'Chimeneas de hadas de doble y triple sombrero y una capilla de ermitaños.',
    ],
  },

  footer: {
    ctaTitle: 'Capadocia es más fácil con un experto local.',
    ctaSubtitle: 'Cuéntanos tus fechas y te ayudamos a montar tu itinerario.',
    ctaButton: 'Habla con nuestro equipo local',
    ctaMessage: 'Hola 👋 Me gustaría ayuda para planificar mi viaje a Capadocia.',
    blurb:
      'Un equipo local de Capadocia para vuelos en globo, tours guiados, aventuras y traslados al aeropuerto.',
    licensedAgency: 'Agencia de viajes autorizada',
    quickLinksTitle: 'Enlaces rápidos',
    supportTitle: 'Atención al cliente',
    contactTitle: 'Contacto',
    quick: {
      about: 'Sobre nosotros',
      allTours: 'Todos los tours',
      faq: 'Preguntas frecuentes',
      contact: 'Contacto',
    },
    support: {
      cancellation: 'Política de cancelación y reembolso',
      privacy: 'Política de privacidad',
      terms: 'Términos y condiciones',
      distanceSales: 'Contrato de venta a distancia',
      kvkk: 'KVKK / Datos personales',
      cookies: 'Política de cookies',
    },
    rights: '© {year} {name}. Todos los derechos reservados.',
    ssl: 'Protegido con SSL',
    secure3d: '3D Secure donde esté disponible',
  },

  toursPage: {
    metaTitle: 'Todos los tours y experiencias de Capadocia',
    metaDescription:
      'Compara vuelos en globo, excursiones guiadas de un día, aventuras al aire libre y traslados al aeropuerto en Capadocia, y reserva con una agencia local autorizada.',
    eyebrow: 'Experiencias locales',
    heading: 'Explora Capadocia',
    subtitle:
      'Compara vuelos en globo, excursiones guiadas de un día, aventuras al aire libre y traslados al aeropuerto.',
    heroAlt: 'Paisaje de los tours de Capadocia',
    categories: {
      all: 'Todos',
      Balloon: 'Globo',
      'Daily Tour': 'Tour diario',
      'Private Tour': 'Tour privado',
      Adventure: 'Aventura',
      Cultural: 'Cultura',
      Package: 'Paquete',
      Transfer: 'Traslado',
    },
    searchPlaceholder: 'Buscar experiencias',
    pickupAvailable: 'Recogida disponible',
    from: 'Desde',
    viewDetails: 'Ver detalles',
    empty: 'No se han encontrado experiencias que coincidan.',
  },

  tourDetail: {
    metaTitleSuffix: '{title} – Precio y reserva',
    metaDescriptionSuffix:
      '{description} Consulta disponibilidad, qué incluye e información de recogida, y reserva con apoyo local.',
    breadcrumbTours: 'Tours',
    overview: 'Descripción general',
    highlights: 'Lo más destacado',
    included: 'Qué incluye',
    notIncluded: 'No incluye',
    programTitle: 'Programa del tour / itinerario',
    programPickupTitle: 'Recogida e información previa',
    programPickupText:
      'Confirmamos tu punto y hora de recogida después de la reserva. El equipo local ofrece una explicación de la actividad y las normas de seguridad antes de la salida.',
    programExperienceTitle: 'La experiencia',
    programExperienceText:
      'La ruta y los horarios exactos pueden ajustarse por meteorología, tráfico y condiciones de operación para que tu experiencia sea segura y agradable.',
    programReturnTitle: 'Regreso',
    programReturnText: 'El traslado de regreso se ofrece cuando está incluido en el paquete elegido al pagar.',
    pickupTitle: 'Información de recogida',
    pickupText:
      'Indica el nombre de tu hotel y tu número de WhatsApp durante el pago. Los detalles exactos de recogida se envían tras la confirmación.',
    cancellationTitle: 'Política de cancelación',
    cancellationText:
      'El plazo de cancelación aplicable se muestra antes del pago y en tu bono. Las cancelaciones del operador por meteorología siguen las condiciones de tu reserva confirmada.',
    faqTitle: 'Preguntas frecuentes',
    reviewsTitle: 'Opiniones de clientes',
    reviewsSoon: 'Opiniones verificadas próximamente',
    reviewsText:
      'Las opiniones aparecerán aquí una vez conectados los perfiles verificados de Google o Tripadvisor. No publicamos valoraciones inventadas.',
    relatedTitle: 'Completa tu experiencia en Capadocia',
    balloonFaq: [
      [
        '¿Qué ocurre si el vuelo se cancela por el tiempo?',
        'Te ayudamos a reprogramar al siguiente vuelo disponible o aplicamos las condiciones de reembolso mostradas durante el pago.',
      ],
      [
        '¿Está incluida la recogida en el hotel?',
        'La recogida está incluida donde se indica. Añade tu hotel al reservar para que nuestro equipo pueda verificarlo.',
      ],
      [
        '¿Qué ropa debo llevar?',
        'Se recomienda calzado cerrado y ropa por capas, sobre todo antes del amanecer.',
      ],
      [
        '¿Cuándo sabré mi hora de recogida?',
        'La hora exacta de recogida se confirma normalmente la tarde anterior a tu vuelo.',
      ],
    ],
  },

  bookingCard: {
    from: 'Desde',
    perPerson: 'por persona',
    note: 'La disponibilidad final y el total se confirman antes del pago.',
    checkAvailability: 'Consultar disponibilidad',
    askWhatsapp: 'Preguntar por WhatsApp',
    whatsappMessage: 'Hola, me gustaría información sobre {title}.',
    freeCancellation: 'Cancelación gratuita donde se indica',
    freeRescheduling: 'Reprogramación garantizada por mal tiempo',
    secureCheckout: 'Pago seguro',
    bookNow: 'RESERVAR',
  },

  booking: {
    title: 'Reserva tu experiencia',
    subtitle: 'Completa tu reserva en unos pocos pasos',
    steps: ['Elegir tour', 'Fecha', 'Personas', 'Extras', 'Datos', 'Pago'],
    back: '← Atrás',
    continue: 'Continuar →',

    selectTour: {
      heading: 'Elige tu experiencia',
      pickupAvailable: 'Recogida disponible',
      from: 'Desde',
      note: 'La disponibilidad se confirma desde el sistema de reservas antes del pago.',
    },

    date: {
      heading: 'Selecciona la fecha',
      subtitle: 'Elige tu fecha preferida',
      selected: 'Seleccionada',
      lowAvailability: 'Pocas plazas',
      days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      months: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
    },

    people: {
      heading: 'Selecciona los viajeros',
      subtitle: '¿Cuántas personas participan?',
      adults: 'Viajeros',
      adultsAge: 'Un precio por viajero',
      children: 'Niños',
      childrenAge: 'De 4 a 12 años (50% de descuento)',
      privateTitle: 'Experiencia privada',
      privateSubtitle: 'Tour exclusivo solo para tu grupo (+50%)',
      capacity: 'Máximo {count} viajeros por tour',
    },

    variants: {
      heading: 'Elige tu ruta',
      subtitle: 'Elige la opción que mejor se adapte a esta fecha',
    },

    upsells: {
      heading: 'Mejora tu experiencia',
      subtitle: 'Complementos opcionales para hacerla aún más especial',
      empty: 'No hay complementos de pago para esta experiencia: todo lo demás ya está incluido.',
      skip: 'Omitir este paso →',
      defaultName: 'Paquete de fotografía profesional',
      defaultDescription:
        'Un fotógrafo profesional capta tu experiencia con más de 50 fotos editadas entregadas digitalmente',
    },

    userInfo: {
      heading: 'Tus datos',
      subtitle: 'Los usaremos para confirmar tu reserva',
      fullName: 'Nombre completo *',
      fullNamePlaceholder: 'Juan Pérez',
      email: 'Correo electrónico *',
      emailPlaceholder: 'juan@ejemplo.com',
      phone: 'Número de teléfono *',
      phonePlaceholder: '+34 600 000 000',
      hotelName: 'Nombre del hotel *',
      hotelNamePlaceholder: 'Introduce el nombre de tu hotel',
      notes: 'Peticiones especiales (opcional)',
      notesPlaceholder: 'Cualquier necesidad o petición especial...',
      requiredNote:
        '* Campos obligatorios. Tus datos están protegidos y solo se usarán para la reserva.',
      consentPrefix: 'He leído la',
      consentPrivacy: 'Política de privacidad',
      consentMiddle: ', el',
      consentKvkk: 'aviso KVKK',
      consentSuffix: 'y las condiciones de reserva específicas del tour.',
      errorName: 'Introduce tu nombre completo',
      errorEmail: 'Introduce una dirección de correo válida',
      errorPhone: 'Introduce un número de teléfono válido',
      errorHotelName: 'Introduce el nombre de tu hotel',
      errorConsent: 'Confirma el aviso de privacidad y las condiciones de reserva',
      continueToPayment: 'Continuar al pago →',
    },

    payment: {
      heading: 'Pago',
      subtitle: 'Tu reserva no queda confirmada hasta que el pago se complete.',
      methodTitle: 'Selecciona el método de pago',
      card: 'Tarjeta de crédito',
      cardBrands: 'Visa, Mastercard',
      iyzico: 'iyzico',
      iyzicoNote: 'Pago local seguro',
      promoLabel: 'Código promocional',
      promoPlaceholder: 'Introduce el código',
      promoNote: 'Validado de forma segura',
      ssl: 'Protegido con SSL',
      secure3d: '3D Secure donde esté disponible',
      cardHandled: 'Los datos de la tarjeta los gestiona el proveedor de pago',
      stripeDisabled:
        'El pago con tarjeta está desactivado hasta configurar NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.',
      continueToSecure: 'Continuar al pago seguro',
      secureCardHeading: 'Pago seguro con tarjeta',
      secureIyzicoHeading: 'Pago seguro con iyzico',
      payButton: 'Pagar {amount} de forma segura',
      errorGeneric: 'No se ha podido completar el pago.',
      errorSetup: 'No se ha podido iniciar el pago. No se ha realizado ningún cargo.',
      errorSession: 'No se ha podido crear la sesión de pago segura.',
      errorIyzico: 'No se ha podido crear el pago con iyzico.',
      pending: 'Tu pago se está confirmando. Mantén esta página abierta.',
    },

    success: {
      heading: '¡Reserva confirmada!',
      subtitle:
        'Pago recibido. Guarda este resumen de reserva y contacta con nuestro equipo si necesitas ayuda con la recogida.',
      detailsTitle: 'Detalles de la reserva',
      reservationNumber: 'Número de reserva',
      processing: 'Procesando',
      tour: 'Tour',
      date: 'Fecha',
      guests: 'Viajeros',
      totalPaid: 'Total pagado',
      backHome: 'Volver al inicio',
      printVoucher: 'Imprimir / guardar bono',
      whatsappSupport: 'Soporte por WhatsApp',
      whatsappMessage: 'Hola, necesito ayuda con la reserva {number}.',
      needHelp: '¿Necesitas ayuda? Escríbenos a',
    },

    summary: {
      title: 'Resumen de la reserva',
      privateUpgrade: 'Mejora a tour privado',
      total: 'Total',
      taxesIncluded: 'Impuestos incluidos',
      adultsLine: '{count}x Viajero × {price}',
      childrenLine: '{count}x Niño × {price}',
    },

    guests: {
      adults: '{count} viajero',
      adultsPlural: '{count} viajeros',
      children: '{count} niño',
      childrenPlural: '{count} niños',
      private: '(Privado)',
    },
  },

  chat: {
    greetingTitle: '¡Bienvenido a Capadocia!',
    greetingText: '¿Cómo podemos ayudarte hoy?',
    closeLabel: 'Cerrar asistente',
    openLabel: 'Abrir el asistente de tours por WhatsApp',
    choices: [
      'Globo aerostático',
      'Tour en quad',
      'Paseo a caballo',
      'Jeep safari',
      'Excursiones de un día',
      'Traslado al aeropuerto',
    ],
    other: 'Otro / Pregúntanos por WhatsApp',
    otherMessage: 'Hola 👋 Necesito ayuda para elegir una experiencia en Capadocia.',
  },

  cookie: {
    aria: 'Preferencias de cookies',
    title: 'Tus opciones de privacidad',
    textPrefix:
      'Usamos cookies esenciales para gestionar las reservas. Las cookies de analítica y publicidad solo se cargan tras tu consentimiento. Consulta nuestra',
    policyLink: 'Política de cookies',
    textSuffix: '.',
    essentialOnly: 'Solo esenciales',
    acceptAll: 'Aceptar todas',
  },

  notFound: {
    title: 'Esta ruta se ha desviado.',
    text: 'Puede que la experiencia se haya movido o ya no esté disponible.',
    cta: 'Ver tours disponibles',
  },

  whatsapp: {
    defaultMessage:
      '¡Hola 👋 Bienvenido a Discovery Cappadocia!\nMe gustaría recibir información sobre los tours de Capadocia.',
  },

  tours: toursEs,
};
