import type { Dictionary } from './en';
import { toursIt } from './tours/it';

export const it: Dictionary = {
  meta: {
    title: 'Discovery Cappadocia | Tour e voli in mongolfiera in Cappadocia',
    titleTemplate: '%s | Discovery Cappadocia',
    description:
      'Prenota voli in mongolfiera, tour in quad, passeggiate a cavallo, escursioni giornaliere e transfer aeroportuali in Cappadocia con un’agenzia locale autorizzata.',
    ogTitle: 'Discovery Cappadocia | Tour ed esperienze locali',
    ogDescription: 'Scopri e prenota le esperienze imperdibili della Cappadocia con supporto locale.',
    keywords: [
      'Mongolfiera Cappadocia',
      'Tour in mongolfiera Cappadocia',
      'Tour in quad Cappadocia',
      'Passeggiata a cavallo Cappadocia',
      'Jeep safari Cappadocia',
      'Tour verde Cappadocia',
      'Tour rosso Cappadocia',
      'Transfer aeroporto Cappadocia',
    ],
  },

  nav: {
    experiences: 'Esperienze',
    balloonFlights: 'Voli in mongolfiera',
    tours: 'Tour',
    faq: 'FAQ',
    partners: 'Partner',
    contact: 'Contatti',
    bookNow: 'Prenota ora',
    languageLabel: 'Lingua del sito',
    currencyLabel: 'Valuta',
    toggleNav: 'Apri o chiudi il menu',
    homeAria: 'Home di Discovery Cappadocia',
    primaryNavAria: 'Navigazione principale',
  },

  hero: {
    badge: 'Cappadocia Kaphera Travel Agency',
    titleLead: 'Scopri la magia della',
    titleAccent: 'Cappadocia',
    subtitle:
      'Prenota esperienze indimenticabili in Cappadocia con un’agenzia di viaggi locale autorizzata. Mongolfiere, escursioni giornaliere, quad, cavallo, jeep safari, transfer aeroportuali e molto altro.',
    exploreCta: 'Scopri i tour',
    whatsappCta: 'Scrivici su WhatsApp',
    securePayment: 'Pagamento sicuro',
    fastConfirmation: 'Conferma rapida',
    humanSupport: 'Assistenza umana reale',
    helpBar: 'Non sai cosa scegliere? Scrivi al nostro team locale al {phone}',
  },

  trust: {
    eyebrow: 'Prenota in tutta tranquillità',
    heading: 'Perché prenotare con noi?',
    licensedAgency: 'Agenzia di viaggi turca autorizzata',
    tursab: 'TÜRSAB n. {number}',
    reasons: [
      'Agenzia locale autorizzata',
      'Pagamento online sicuro',
      'Conferma immediata',
      'Prelievo in hotel su tour selezionati',
      'Assistenza WhatsApp 24/7',
      'Prezzi chiari e trasparenti',
      'Team locale in Cappadocia',
      'Opzioni di cancellazione semplici',
    ],
  },

  popular: {
    eyebrow: 'I preferiti dei viaggiatori',
    heading: 'Le esperienze più popolari della Cappadocia',
    viewAll: 'Vedi tutte le esperienze →',
    newListing: 'Nuovo annuncio',
    hotelPickup: 'Prelievo in hotel',
    from: 'Da',
    viewAndBook: 'Vedi e prenota',
    currencyNote:
      'Le conversioni di valuta mostrate sono indicative. Il totale finale viene confermato prima del pagamento.',
    addWishlist: 'Aggiungi ai preferiti',
    removeWishlist: 'Rimuovi dai preferiti',
    scrollLeft: 'Scorri a sinistra',
    scrollRight: 'Scorri a destra',
  },

  balloon: {
    badge: 'Imperdibile in Cappadocia',
    heading: 'Vola sulla Cappadocia all’alba',
    subtitle:
      'Scegli il tipo di volo che preferisci. Confermiamo operatore, disponibilità e dettagli esatti del prelievo prima del pagamento.',
    cta: 'Verifica disponibilità',
    imageAlt: 'Mongolfiere in volo sulla Cappadocia all’alba',
    options: [
      { name: 'Volo standard', detail: 'Un classico volo all’alba in cesta condivisa.' },
      { name: 'Volo comfort', detail: 'Più spazio personale con un gruppo più ristretto.' },
      { name: 'Volo privato', detail: 'Cesta privata e celebrazione su misura.' },
    ],
  },

  lastMinute: {
    eyebrow: 'Disponibilità in tempo reale',
    heading: 'Disponibilità last minute',
    seatsAvailable: '{count} posti disponibili',
  },

  faqSection: {
    eyebrow: 'Risposte chiare, aiuto locale',
    heading: 'Pianifica con sicurezza',
    subtitle:
      'I programmi di viaggio possono cambiare in fretta. Il nostro team locale è disponibile prima e dopo la prenotazione per chiarire prelievo, meteo e condizioni di cancellazione.',
    whatsappCta: 'Chiedi su WhatsApp',
    whatsappMessage: 'Salve, ho una domanda su un tour in Cappadocia.',
    reviewNote:
      'I widget delle recensioni di Google e Tripadvisor vanno attivati solo dopo aver configurato i profili aziendali verificati e l’accesso alle API.',
    items: [
      [
        'Cosa succede se il mio volo in mongolfiera viene annullato per il meteo?',
        'La sicurezza viene prima di tutto. Se l’autorità aeronautica annulla il volo, ti aiutiamo a spostarti alla prima data disponibile oppure elaboriamo il rimborso previsto dalle tue condizioni di prenotazione.',
      ],
      [
        'Il prelievo in hotel è incluso?',
        'Il prelievo è incluso nei tour indicati come «Prelievo in hotel incluso» o «Hotel selezionati inclusi». Inserisci il tuo hotel al momento della prenotazione così il nostro team può confermare la copertura.',
      ],
      [
        'Quanto dura il volo in mongolfiera?',
        'L’esperienza completa dura di solito 3–4 ore, inclusi transfer e preparazione. La durata del volo dipende dal pacchetto e dalle condizioni operative.',
      ],
      [
        'Come devo vestirmi?',
        'Indossa scarpe chiuse e vestiti a strati. In Cappadocia le mattine possono essere fresche anche nei mesi più caldi.',
      ],
      [
        'I bambini possono volare?',
        'I limiti di età e altezza dipendono dall’operatore e dalle norme di sicurezza vigenti. Inviaci età e altezza del bambino prima di prenotare.',
      ],
      [
        'Quando riceverò l’orario di prelievo?',
        'L’orario esatto di prelievo viene confermato dopo la prenotazione, di norma la sera prima dell’esperienza.',
      ],
    ],
  },

  partnersSection: {
    eyebrow: 'Con chi collaboriamo',
    heading: 'I nostri partner',
    subtitle: 'Hotel, operatori e piattaforme di fiducia con cui collaboriamo in Cappadocia.',
  },

  testimonialsSection: {
    eyebrow: 'Cosa dicono i nostri ospiti',
    heading: 'Recensioni degli ospiti',
    subtitle: 'Feedback reali dei viaggiatori che abbiamo ospitato in Cappadocia.',
  },

  map: {
    eyebrow: 'Esplora la regione',
    heading: 'Itinerari e destinazioni',
    subtitle: 'Scopri i luoghi magici che visiterai nei nostri tour',
    stopsTitle: 'Tappe del tour',
    directions: 'Come arrivare',
    fitAll: 'Mostra tutte le tappe',
    ariaLabel: 'Mappa interattiva delle tappe dei tour in Cappadocia',
    zoomIn: 'Ingrandisci',
    zoomOut: 'Riduci',
    note: 'Le tappe variano in base al tour. Selezionane una per individuarla sulla mappa; la guida conferma l’itinerario definitivo la sera prima.',
    points: [
      'Museo all’aperto di Göreme',
      'Area di decollo delle mongolfiere',
      'Castello di Uçhisar',
      'Valle dell’Amore',
      'Città sotterranea di Derinkuyu',
      'Paşabağ (Valle dei Monaci)',
    ],
    descriptions: [
      'Chiese rupestri patrimonio UNESCO con affreschi dell’XI secolo.',
      'L’area di decollo dei voli all’alba, appena a nord di Göreme.',
      'Il punto più alto della Cappadocia, con vista a 360° sulle valli.',
      'I celebri camini delle fate più alti: magnifici nell’ora dorata.',
      'Otto livelli scavati nel sottosuolo, 30 km a sud di Göreme.',
      'Camini delle fate a doppio e triplo cappello e la cappella dell’eremita.',
    ],
  },

  footer: {
    ctaTitle: 'La Cappadocia è più semplice con un esperto locale.',
    ctaSubtitle: 'Dicci le tue date e ti aiutiamo a costruire l’itinerario.',
    ctaButton: 'Parla con il nostro team locale',
    ctaMessage: 'Salve 👋 Vorrei aiuto per pianificare il mio viaggio in Cappadocia.',
    blurb:
      'Un team locale in Cappadocia per voli in mongolfiera, tour guidati, avventure e transfer aeroportuali.',
    licensedAgency: 'Agenzia di viaggi autorizzata',
    quickLinksTitle: 'Link rapidi',
    supportTitle: 'Assistenza clienti',
    contactTitle: 'Contatti',
    quick: {
      about: 'Chi siamo',
      allTours: 'Tutti i tour',
      faq: 'FAQ',
      contact: 'Contatti',
    },
    support: {
      cancellation: 'Politica di cancellazione e rimborso',
      privacy: 'Informativa sulla privacy',
      terms: 'Termini e condizioni',
      distanceSales: 'Contratto di vendita a distanza',
      kvkk: 'KVKK / Dati personali',
      cookies: 'Politica sui cookie',
    },
    rights: '© {year} {name}. Tutti i diritti riservati.',
    ssl: 'Protetto con SSL',
    secure3d: '3D Secure dove supportato',
  },

  toursPage: {
    metaTitle: 'Tutti i tour e le esperienze in Cappadocia',
    metaDescription:
      'Confronta voli in mongolfiera, escursioni guidate giornaliere, avventure all’aperto e transfer aeroportuali in Cappadocia, poi prenota con un’agenzia locale autorizzata.',
    eyebrow: 'Esperienze locali',
    heading: 'Esplora la Cappadocia',
    subtitle:
      'Confronta voli in mongolfiera, escursioni guidate giornaliere, avventure all’aperto e transfer aeroportuali.',
    heroAlt: 'Paesaggio dei tour in Cappadocia',
    categories: {
      all: 'Tutti',
      Balloon: 'Mongolfiera',
      'Daily Tour': 'Tour giornaliero',
      'Private Tour': 'Tour privato',
      Adventure: 'Avventura',
      Cultural: 'Cultura',
      Package: 'Pacchetto',
      Transfer: 'Transfer',
    },
    searchPlaceholder: 'Cerca esperienze',
    pickupAvailable: 'Prelievo disponibile',
    from: 'Da',
    viewDetails: 'Vedi dettagli',
    empty: 'Nessuna esperienza corrispondente trovata.',
  },

  tourDetail: {
    metaTitleSuffix: '{title} – Prezzo e prenotazione',
    metaDescriptionSuffix:
      '{description} Verifica disponibilità, cosa è incluso e le informazioni sul prelievo, poi prenota con supporto locale.',
    breadcrumbTours: 'Tour',
    newListing: 'Nuovo annuncio',
    overview: 'Panoramica',
    highlights: 'Punti salienti',
    included: 'Cosa è incluso',
    notIncluded: 'Non incluso',
    programTitle: 'Programma del tour / itinerario',
    programPickupTitle: 'Prelievo e briefing',
    programPickupText:
      'Confermiamo punto e orario di prelievo dopo la prenotazione. Il team locale fornisce un briefing sull’attività e sulla sicurezza prima della partenza.',
    programExperienceTitle: 'L’esperienza',
    programExperienceText:
      'Percorso e orari esatti possono variare in base a meteo, traffico e condizioni operative, per mantenere l’esperienza sicura e piacevole.',
    programReturnTitle: 'Rientro',
    programReturnText: 'Il transfer di rientro è previsto quando incluso nel pacchetto scelto al pagamento.',
    pickupTitle: 'Informazioni sul prelievo',
    pickupText:
      'Inserisci il nome del tuo hotel e il numero WhatsApp durante il pagamento. I dettagli esatti del prelievo vengono inviati dopo la conferma.',
    cancellationTitle: 'Politica di cancellazione',
    cancellationText:
      'Il termine di cancellazione applicabile è indicato prima del pagamento e sul voucher. Le cancellazioni dell’operatore dovute al meteo seguono le condizioni della prenotazione confermata.',
    faqTitle: 'Domande frequenti',
    reviewsTitle: 'Recensioni dei clienti',
    reviewsSoon: 'Recensioni verificate in arrivo',
    reviewsText:
      'Le recensioni compariranno qui dopo il collegamento dei profili verificati Google o Tripadvisor. Non pubblichiamo valutazioni inventate.',
    relatedTitle: 'Completa la tua esperienza in Cappadocia',
    balloonFaq: [
      [
        'Cosa succede se il volo viene annullato per il meteo?',
        'Ti aiutiamo a riprogrammare sul primo volo disponibile oppure applichiamo le condizioni di rimborso mostrate durante il pagamento.',
      ],
      [
        'Il prelievo in hotel è incluso?',
        'Il prelievo è incluso dove indicato. Aggiungi il tuo hotel in fase di prenotazione così il nostro team può verificarlo.',
      ],
      [
        'Come devo vestirmi?',
        'Consigliamo scarpe chiuse e abbigliamento a strati, soprattutto prima dell’alba.',
      ],
      [
        'Quando riceverò l’orario di prelievo?',
        'L’orario esatto di prelievo viene di norma confermato la sera prima del volo.',
      ],
    ],
  },

  bookingCard: {
    from: 'Da',
    perPerson: 'a persona',
    note: 'Disponibilità finale e totale vengono confermati prima del pagamento.',
    checkAvailability: 'Verifica disponibilità',
    askWhatsapp: 'Chiedi su WhatsApp',
    whatsappMessage: 'Salve, vorrei informazioni su {title}.',
    freeCancellation: 'Cancellazione gratuita dove indicato',
    secureCheckout: 'Pagamento sicuro',
    bookNow: 'PRENOTA',
  },

  booking: {
    title: 'Prenota la tua esperienza',
    subtitle: 'Completa la prenotazione in pochi passaggi',
    steps: ['Scegli il tour', 'Data', 'Partecipanti', 'Extra', 'Dati', 'Pagamento'],
    back: '← Indietro',
    continue: 'Continua →',

    selectTour: {
      heading: 'Scegli la tua esperienza',
      pickupAvailable: 'Prelievo disponibile',
      from: 'Da',
      note: 'La disponibilità viene confermata dal sistema di prenotazione prima del pagamento.',
    },

    date: {
      heading: 'Seleziona la data',
      subtitle: 'Scegli la data che preferisci',
      selected: 'Selezionata',
      lowAvailability: 'Pochi posti',
      days: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
      months: [
        'Gennaio',
        'Febbraio',
        'Marzo',
        'Aprile',
        'Maggio',
        'Giugno',
        'Luglio',
        'Agosto',
        'Settembre',
        'Ottobre',
        'Novembre',
        'Dicembre',
      ],
    },

    people: {
      heading: 'Seleziona i partecipanti',
      subtitle: 'Quante persone partecipano?',
      adults: 'Partecipanti',
      adultsAge: 'Un prezzo per partecipante',
      children: 'Bambini',
      childrenAge: 'Da 4 a 12 anni (sconto del 50%)',
      privateTitle: 'Esperienza privata',
      privateSubtitle: 'Tour esclusivo solo per il tuo gruppo (+50%)',
      capacity: 'Massimo {count} partecipanti per tour',
    },

    upsells: {
      heading: 'Arricchisci la tua esperienza',
      subtitle: 'Extra opzionali per renderla ancora più speciale',
      empty: 'Nessun extra a pagamento per questa esperienza: tutto il resto è già incluso.',
      skip: 'Salta questo passaggio →',
      defaultName: 'Pacchetto fotografico professionale',
      defaultDescription:
        'Un fotografo professionista immortala la tua esperienza con oltre 50 foto ritoccate consegnate in digitale',
    },

    userInfo: {
      heading: 'I tuoi dati',
      subtitle: 'Li useremo per confermare la prenotazione',
      fullName: 'Nome e cognome *',
      fullNamePlaceholder: 'Mario Rossi',
      email: 'Indirizzo email *',
      emailPlaceholder: 'mario@esempio.com',
      phone: 'Numero di telefono *',
      phonePlaceholder: '+39 320 000 0000',
      hotelName: 'Nome dell’hotel *',
      hotelNamePlaceholder: 'Inserisci il nome del tuo hotel',
      notes: 'Richieste particolari (facoltativo)',
      notesPlaceholder: 'Eventuali esigenze o richieste particolari...',
      requiredNote:
        '* Campi obbligatori. I tuoi dati sono protetti e verranno usati solo per la prenotazione.',
      consentPrefix: 'Ho letto l’',
      consentPrivacy: 'Informativa sulla privacy',
      consentMiddle: ', l’',
      consentKvkk: 'informativa KVKK',
      consentSuffix: 'e le condizioni di prenotazione specifiche del tour.',
      errorName: 'Inserisci nome e cognome',
      errorEmail: 'Inserisci un indirizzo email valido',
      errorPhone: 'Inserisci un numero di telefono valido',
      errorHotelName: 'Inserisci il nome del tuo hotel',
      errorConsent: 'Conferma l’informativa sulla privacy e le condizioni di prenotazione',
      continueToPayment: 'Continua al pagamento →',
    },

    payment: {
      heading: 'Pagamento',
      subtitle: 'La prenotazione non è confermata finché il pagamento non va a buon fine.',
      methodTitle: 'Scegli il metodo di pagamento',
      card: 'Carta di credito',
      cardBrands: 'Visa, Mastercard',
      iyzico: 'iyzico',
      iyzicoNote: 'Pagamento locale sicuro',
      promoLabel: 'Codice promozionale',
      promoPlaceholder: 'Inserisci il codice',
      promoNote: 'Verificato in modo sicuro',
      ssl: 'Protetto con SSL',
      secure3d: '3D Secure dove supportato',
      cardHandled: 'I dati della carta sono gestiti dal fornitore di pagamento',
      stripeDisabled:
        'Il pagamento con carta è disattivato finché non viene configurata NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.',
      continueToSecure: 'Continua al pagamento sicuro',
      secureCardHeading: 'Pagamento sicuro con carta',
      secureIyzicoHeading: 'Pagamento sicuro con iyzico',
      payButton: 'Paga {amount} in sicurezza',
      errorGeneric: 'Non è stato possibile completare il pagamento.',
      errorSetup: 'Avvio del pagamento non riuscito. Nessun addebito effettuato.',
      errorSession: 'Non è stato possibile creare la sessione di pagamento sicura.',
      errorIyzico: 'Non è stato possibile creare il pagamento iyzico.',
      pending: 'Il pagamento è in fase di conferma. Tieni aperta questa pagina.',
    },

    success: {
      heading: 'Prenotazione confermata!',
      subtitle:
        'Pagamento ricevuto. Conserva questo riepilogo e contatta il nostro team se ti serve assistenza per il prelievo.',
      detailsTitle: 'Dettagli della prenotazione',
      reservationNumber: 'Numero di prenotazione',
      processing: 'In elaborazione',
      tour: 'Tour',
      date: 'Data',
      guests: 'Partecipanti',
      totalPaid: 'Totale pagato',
      backHome: 'Torna alla home',
      printVoucher: 'Stampa / salva voucher',
      whatsappSupport: 'Assistenza WhatsApp',
      whatsappMessage: 'Salve, ho bisogno di aiuto con la prenotazione {number}.',
      needHelp: 'Ti serve aiuto? Scrivici a',
    },

    summary: {
      title: 'Riepilogo prenotazione',
      privateUpgrade: 'Upgrade a tour privato',
      total: 'Totale',
      taxesIncluded: 'Tasse incluse',
      adultsLine: '{count}x Partecipante × {price}',
      childrenLine: '{count}x Bambino × {price}',
    },

    guests: {
      adults: '{count} partecipante',
      adultsPlural: '{count} partecipanti',
      children: '{count} bambino',
      childrenPlural: '{count} bambini',
      private: '(Privato)',
    },
  },

  chat: {
    greetingTitle: 'Benvenuto in Cappadocia!',
    greetingText: 'Come possiamo aiutarti oggi?',
    closeLabel: 'Chiudi assistente',
    openLabel: 'Apri l’assistente tour su WhatsApp',
    choices: [
      'Mongolfiera',
      'Tour in quad',
      'Passeggiata a cavallo',
      'Jeep safari',
      'Escursioni giornaliere',
      'Transfer aeroporto',
    ],
    other: 'Altro / Chiedici su WhatsApp',
    otherMessage: 'Salve 👋 Ho bisogno di aiuto per scegliere un’esperienza in Cappadocia.',
  },

  cookie: {
    aria: 'Preferenze sui cookie',
    title: 'Le tue scelte sulla privacy',
    textPrefix:
      'Usiamo cookie essenziali per gestire le prenotazioni. I cookie di analisi e pubblicità vengono caricati solo dopo il tuo consenso. Consulta la nostra',
    policyLink: 'Politica sui cookie',
    textSuffix: '.',
    essentialOnly: 'Solo essenziali',
    acceptAll: 'Accetta tutti',
  },

  notFound: {
    title: 'Questo percorso ha perso la rotta.',
    text: 'L’esperienza potrebbe essere stata spostata o non essere più disponibile.',
    cta: 'Scopri i tour disponibili',
  },

  whatsapp: {
    defaultMessage:
      'Salve 👋 Benvenuto in Discovery Cappadocia!\nVorrei ricevere informazioni sui tour in Cappadocia.',
  },

  tours: toursIt,
};
