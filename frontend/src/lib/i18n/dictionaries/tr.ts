import type { Dictionary } from './en';
import { toursTr } from './tours/tr';

export const tr: Dictionary = {
  meta: {
    title: 'Discovery Cappadocia | Kapadokya Turları & Balon Uçuşları',
    titleTemplate: '%s | Discovery Cappadocia',
    description:
      'Kapadokya sıcak hava balonu uçuşları, ATV turları, at binme, günlük turlar ve havalimanı transferlerini belgeli yerel acenteyle rezerve edin.',
    ogTitle: 'Discovery Cappadocia | Yerel Turlar & Deneyimler',
    ogDescription: 'Kapadokya’nın vazgeçilmez deneyimlerini yerel destekle keşfedin ve rezerve edin.',
    keywords: [
      'Kapadokya Balon Turu',
      'Kapadokya Sıcak Hava Balonu',
      'Kapadokya ATV Turu',
      'Kapadokya At Binme',
      'Kapadokya Jeep Safari',
      'Kapadokya Yeşil Tur',
      'Kapadokya Kırmızı Tur',
      'Kapadokya Havalimanı Transferi',
    ],
  },

  nav: {
    experiences: 'Deneyimler',
    balloonFlights: 'Balon Uçuşları',
    tours: 'Turlar',
    faq: 'SSS',
    partners: 'Partnerler',
    contact: 'İletişim',
    bookNow: 'Rezervasyon yap',
    languageLabel: 'Site dili',
    currencyLabel: 'Para birimi',
    toggleNav: 'Menüyü aç/kapat',
    homeAria: 'Discovery Cappadocia ana sayfa',
    primaryNavAria: 'Ana menü',
  },

  hero: {
    badge: 'Cappadocia Kaphera Travel Agency',
    titleLead: 'Kapadokya’nın',
    titleAccent: 'Büyüsünü Keşfedin',
    subtitle:
      'Unutulmaz Kapadokya deneyimlerini belgeli yerel bir seyahat acentesiyle rezerve edin. Sıcak hava balonu, günlük turlar, ATV, at binme, jeep safari, havalimanı transferi ve daha fazlası.',
    exploreCta: 'Turları keşfet',
    whatsappCta: 'WhatsApp’tan yazın',
    securePayment: 'Güvenli ödeme',
    fastConfirmation: 'Hızlı onay',
    humanSupport: 'Gerçek insan desteği',
    helpBar: 'Karar veremediniz mi? Yerel ekibimize {phone} numarasından yazın',
  },

  trust: {
    eyebrow: 'Güvenle rezerve edin',
    heading: 'Neden bizimle?',
    licensedAgency: 'Belgeli Türk Seyahat Acentesi',
    tursab: 'TÜRSAB No: {number}',
    reasons: [
      'Belgeli yerel acente',
      'Güvenli online ödeme',
      'Anında onay',
      'Seçili turlarda otelden alım',
      '7/24 WhatsApp desteği',
      'Net, peşin fiyatlar',
      'Yerel Kapadokya ekibi',
      'Kolay iptal seçenekleri',
    ],
  },

  popular: {
    eyebrow: 'Misafir favorileri',
    heading: 'En Popüler Kapadokya Deneyimleri',
    viewAll: 'Tüm deneyimleri gör →',
    newListing: 'Yeni ilan',
    hotelPickup: 'Otelden alım',
    from: 'Başlangıç',
    viewAndBook: 'İncele & rezerve et',
    currencyNote:
      'Gösterilen döviz çevrimleri bilgi amaçlıdır. Nihai ödeme tutarınız ödeme öncesinde teyit edilir.',
    addWishlist: 'Favorilere ekle',
    removeWishlist: 'Favorilerden çıkar',
    scrollLeft: 'Sola kaydır',
    scrollRight: 'Sağa kaydır',
  },

  balloon: {
    badge: 'Kapadokya klasiği',
    heading: 'Gün Doğumunda Kapadokya’nın Üzerinde Uçun',
    subtitle:
      'Size uygun uçuş tipini seçin. Operatörü, müsaitliği ve tam alım detaylarını ödemeden önce teyit ediyoruz.',
    cta: 'Müsaitliği kontrol et',
    imageAlt: 'Gün doğumunda Kapadokya üzerinde uçan sıcak hava balonları',
    options: [
      { name: 'Standart Uçuş', detail: 'Ortak sepette klasik bir gün doğumu uçuşu.' },
      { name: 'Konfor Uçuşu', detail: 'Daha küçük grupla daha geniş kişisel alan.' },
      { name: 'Özel Uçuş', detail: 'Size özel sepet ve kişiselleştirilmiş kutlama.' },
    ],
  },

  lastMinute: {
    eyebrow: 'Canlı kontenjan',
    heading: 'Son Dakika Müsaitlik',
    seatsAvailable: '{count} kişilik yer var',
  },

  faqSection: {
    eyebrow: 'Net yanıtlar, yerel destek',
    heading: 'Güvenle planlayın',
    subtitle:
      'Seyahat planları hızla değişebilir. Yerel destek ekibimiz rezervasyon öncesi ve sonrasında alım, hava durumu ve iptal detaylarını netleştirmek için yanınızda.',
    whatsappCta: 'WhatsApp’tan sorun',
    whatsappMessage: 'Merhaba, bir Kapadokya turu hakkında sorum var.',
    reviewNote:
      'Google ve Tripadvisor yorum bileşenleri yalnızca doğrulanmış işletme profili adresleri ve API erişimi yapılandırıldıktan sonra etkinleştirilmelidir.',
    items: [
      [
        'Balon uçuşum hava koşulları nedeniyle iptal edilirse ne olur?',
        'Önce güvenlik. Sivil havacılık otoritesi uçuşu iptal ederse, en yakın uygun tarihe geçmenize yardımcı olur veya rezervasyon koşullarınızda tanımlı iadeyi işleme alırız.',
      ],
      [
        'Otelden alım dahil mi?',
        '“Otelden alım dahil” veya “Seçili oteller dahil” yazan turlarda alım dahildir. Ekibimizin kapsamı teyit edebilmesi için rezervasyon sırasında otelinizi girin.',
      ],
      [
        'Balon uçuşu ne kadar sürüyor?',
        'Transferler ve hazırlık dahil deneyimin tamamı genellikle 3–4 saattir. Uçuş süresi pakete ve operasyon koşullarına göre değişir.',
      ],
      [
        'Ne giymeliyim?',
        'Kapalı ayakkabı ve katmanlı giysi tercih edin. Kapadokya sabahları sıcak aylarda bile serin olabilir.',
      ],
      [
        'Çocuklar uçabilir mi?',
        'Yaş ve boy sınırları operatöre ve güncel güvenlik kurallarına bağlıdır. Rezervasyondan önce çocuğun yaşını ve boyunu bize iletin.',
      ],
      [
        'Alım saatimi ne zaman öğreneceğim?',
        'Kesin alım saatiniz rezervasyondan sonra, genellikle deneyiminizden bir önceki akşam teyit edilir.',
      ],
    ],
  },

  partnersSection: {
    eyebrow: 'İş birliği yaptıklarımız',
    heading: 'Partnerlerimiz',
    subtitle: 'Kapadokya genelinde birlikte çalıştığımız güvenilir oteller, operatörler ve platformlar.',
  },

  testimonialsSection: {
    eyebrow: 'Misafirlerimiz ne diyor',
    heading: 'Misafir yorumları',
    subtitle: 'Kapadokya\'da ağırladığımız gezginlerden gerçek geri bildirimler.',
  },

  map: {
    eyebrow: 'Bölgeyi keşfedin',
    heading: 'Tur Rotaları & Duraklar',
    subtitle: 'Turlarımızda göreceğiniz büyülü noktaları keşfedin',
    stopsTitle: 'Tur Durakları',
    directions: 'Yol tarifi al',
    fitAll: 'Tüm durakları göster',
    ariaLabel: 'Kapadokya tur duraklarını gösteren etkileşimli harita',
    zoomIn: 'Yakınlaştır',
    zoomOut: 'Uzaklaştır',
    note: 'Duraklar seçtiğiniz tura göre değişir. Bir durağa dokunarak haritada görebilirsiniz; kesin rota bir önceki akşam rehberiniz tarafından teyit edilir.',
    points: [
      'Göreme Açık Hava Müzesi',
      'Balon Kalkış Alanı',
      'Uçhisar Kalesi',
      'Aşk Vadisi',
      'Derinkuyu Yeraltı Şehri',
      'Paşabağ (Keşişler Vadisi)',
    ],
    descriptions: [
      'UNESCO listesindeki kaya kiliseleri ve 11. yüzyıl freskleri.',
      'Gün doğumu uçuşlarının kalktığı alan, Göreme’nin hemen kuzeyi.',
      'Kapadokya’nın en yüksek noktası; 360° vadi manzarası.',
      'Ünlü uzun peribacaları; en güzel hâli altın saatte.',
      'Yer altına oyulmuş sekiz kat; Göreme’nin 30 km güneyinde.',
      'Çift ve üç başlıklı peribacaları ile keşiş şapeli.',
    ],
  },

  footer: {
    ctaTitle: 'Kapadokya, yerel bir uzmanla çok daha kolay.',
    ctaSubtitle: 'Tarihlerinizi paylaşın, programınızı birlikte oluşturalım.',
    ctaButton: 'Yerel ekibimizle konuşun',
    ctaMessage: 'Merhaba 👋 Kapadokya gezimi planlamak için yardım istiyorum.',
    blurb:
      'Balon uçuşları, rehberli turlar, doğa aktiviteleri ve havalimanı transferleri için yerel Kapadokya rezervasyon ekibi.',
    licensedAgency: 'Belgeli Seyahat Acentesi',
    quickLinksTitle: 'Hızlı bağlantılar',
    supportTitle: 'Müşteri desteği',
    contactTitle: 'İletişim',
    quick: {
      about: 'Hakkımızda',
      allTours: 'Tüm turlar',
      faq: 'SSS',
      contact: 'İletişim',
    },
    support: {
      cancellation: 'İptal & İade Politikası',
      privacy: 'Gizlilik Politikası',
      terms: 'Kullanım Koşulları',
      distanceSales: 'Mesafeli Satış Sözleşmesi',
      kvkk: 'KVKK / Kişisel Veriler',
      cookies: 'Çerez Politikası',
    },
    rights: '© {year} {name}. Tüm hakları saklıdır.',
    ssl: 'SSL korumalı',
    secure3d: 'Desteklenen kartlarda 3D Secure',
  },

  toursPage: {
    metaTitle: 'Tüm Kapadokya Turları & Deneyimleri',
    metaDescription:
      'Kapadokya balon uçuşlarını, rehberli günlük turları, doğa aktivitelerini ve havalimanı transferlerini karşılaştırın, belgeli yerel acenteyle rezerve edin.',
    eyebrow: 'Yerel deneyimler',
    heading: 'Kapadokya’yı Keşfedin',
    subtitle: 'Balon uçuşlarını, rehberli günlük turları, doğa aktivitelerini ve transferleri karşılaştırın.',
    heroAlt: 'Kapadokya turları manzarası',
    categories: {
      all: 'Tümü',
      Balloon: 'Balon',
      'Daily Tour': 'Günlük Tur',
      'Private Tour': 'Özel Tur',
      Adventure: 'Macera',
      Cultural: 'Kültür',
      Package: 'Paket',
      Transfer: 'Transfer',
    },
    searchPlaceholder: 'Deneyim ara',
    pickupAvailable: 'Alım hizmeti mevcut',
    from: 'Başlangıç',
    viewDetails: 'Detayları gör',
    empty: 'Eşleşen deneyim bulunamadı.',
  },

  tourDetail: {
    metaTitleSuffix: '{title} – Fiyat & Rezervasyon',
    metaDescriptionSuffix:
      '{description} Müsaitliği, dahil olanları ve alım bilgilerini inceleyin, yerel destekle rezerve edin.',
    breadcrumbTours: 'Turlar',
    newListing: 'Yeni ilan',
    overview: 'Genel bakış',
    highlights: 'Öne çıkanlar',
    included: 'Fiyata dahil',
    notIncluded: 'Fiyata dahil değil',
    programTitle: 'Tur programı / güzergâh',
    programPickupTitle: 'Alım ve bilgilendirme',
    programPickupText:
      'Alım noktanızı ve saatinizi rezervasyondan sonra teyit ederiz. Yerel ekip, hareketten önce aktivite ve güvenlik bilgilendirmesi yapar.',
    programExperienceTitle: 'Deneyim',
    programExperienceText:
      'Deneyiminiz güvenli ve keyifli kalsın diye rota ve zamanlama hava durumu, trafik ve operasyon koşullarına göre değişebilir.',
    programReturnTitle: 'Dönüş',
    programReturnText: 'Dönüş transferi, ödemede seçilen pakete dahilse sağlanır.',
    pickupTitle: 'Alım bilgileri',
    pickupText:
      'Ödeme adımında otel adınızı ve WhatsApp numaranızı girin. Kesin alım detayları onaydan sonra iletilir.',
    cancellationTitle: 'İptal koşulları',
    cancellationText:
      'Geçerli iptal süresi ödeme öncesinde ve voucher’ınızda gösterilir. Hava koşulları nedeniyle operatör kaynaklı iptaller, onaylanmış rezervasyonunuzun koşullarına tabidir.',
    faqTitle: 'Sıkça sorulan sorular',
    reviewsTitle: 'Müşteri yorumları',
    reviewsSoon: 'Doğrulanmış yorumlar yakında',
    reviewsText:
      'Yorumlar, doğrulanmış Google veya Tripadvisor profilleri bağlandıktan sonra burada görünecek. Uydurma puan yayınlamıyoruz.',
    relatedTitle: 'Kapadokya deneyiminizi tamamlayın',
    balloonFaq: [
      [
        'Uçuş hava koşulları nedeniyle iptal edilirse ne olur?',
        'En yakın uygun uçuşa geçmenize yardımcı olur veya ödeme sırasında gösterilen iade koşullarını uygularız.',
      ],
      [
        'Otelden alım dahil mi?',
        'Belirtilen turlarda alım dahildir. Ekibimizin doğrulayabilmesi için rezervasyon sırasında otelinizi ekleyin.',
      ],
      [
        'Ne giymeliyim?',
        'Özellikle gün doğumu öncesi için kapalı ayakkabı ve katmanlı giysi öneriyoruz.',
      ],
      [
        'Alım saatimi ne zaman öğreneceğim?',
        'Kesin alım saati genellikle uçuşunuzdan bir önceki akşam teyit edilir.',
      ],
    ],
  },

  bookingCard: {
    from: 'Başlangıç',
    perPerson: 'kişi başı',
    note: 'Nihai müsaitlik ve toplam tutar ödeme öncesinde teyit edilir.',
    checkAvailability: 'Müsaitliği kontrol et',
    askWhatsapp: 'WhatsApp’tan sorun',
    whatsappMessage: 'Merhaba, {title} hakkında bilgi almak istiyorum.',
    freeCancellation: 'Belirtilen turlarda ücretsiz iptal',
    secureCheckout: 'Güvenli ödeme',
    bookNow: 'REZERVE ET',
  },

  booking: {
    title: 'Deneyiminizi Rezerve Edin',
    subtitle: 'Rezervasyonunuzu birkaç adımda tamamlayın',
    steps: ['Tur Seçimi', 'Tarih', 'Kişi Sayısı', 'Ekstralar', 'Bilgiler', 'Ödeme'],
    back: '← Geri',
    continue: 'Devam →',

    selectTour: {
      heading: 'Deneyiminizi seçin',
      pickupAvailable: 'Alım hizmeti mevcut',
      from: 'Başlangıç',
      note: 'Müsaitlik, ödeme öncesinde rezervasyon sisteminden teyit edilir.',
    },

    date: {
      heading: 'Tarih Seçin',
      subtitle: 'Tercih ettiğiniz gezi tarihini seçin',
      selected: 'Seçili',
      lowAvailability: 'Az yer kaldı',
      days: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
      months: [
        'Ocak',
        'Şubat',
        'Mart',
        'Nisan',
        'Mayıs',
        'Haziran',
        'Temmuz',
        'Ağustos',
        'Eylül',
        'Ekim',
        'Kasım',
        'Aralık',
      ],
    },

    people: {
      heading: 'Kişi Sayısı',
      subtitle: 'Kaç kişi katılıyor?',
      adults: 'Misafir',
      adultsAge: 'Her misafir için tek fiyat',
      children: 'Çocuk',
      childrenAge: '4-12 yaş (%50 indirim)',
      privateTitle: 'Özel Deneyim',
      privateSubtitle: 'Yalnızca sizin grubunuza özel tur (+%50)',
      capacity: 'Tur başına en fazla {count} kişi',
    },

    upsells: {
      heading: 'Deneyiminizi Zenginleştirin',
      subtitle: 'Daha özel kılmak için isteğe bağlı eklentiler',
      empty: 'Bu deneyim için ücretli eklenti yok — diğer her şey zaten dahil.',
      skip: 'Bu adımı atla →',
      defaultName: 'Profesyonel Fotoğraf Paketi',
      defaultDescription:
        'Profesyonel fotoğrafçı deneyiminizi kaydeder; 50’den fazla düzenlenmiş fotoğraf dijital olarak teslim edilir',
    },

    userInfo: {
      heading: 'Bilgileriniz',
      subtitle: 'Rezervasyonunuzu onaylamak için bu bilgileri kullanacağız',
      fullName: 'Ad Soyad *',
      fullNamePlaceholder: 'Ahmet Yılmaz',
      email: 'E-posta Adresi *',
      emailPlaceholder: 'ornek@eposta.com',
      phone: 'Telefon Numarası *',
      phonePlaceholder: '+90 555 000 0000',
      hotelName: 'Otel Adı *',
      hotelNamePlaceholder: 'Konakladığınız otelin adını girin',
      notes: 'Özel İstekler (İsteğe bağlı)',
      notesPlaceholder: 'Özel bir ihtiyaç veya isteğiniz varsa yazın...',
      requiredNote:
        '* Zorunlu alanlar. Bilgileriniz güvendedir ve yalnızca rezervasyon amacıyla kullanılır.',
      consentPrefix: 'Okudum:',
      consentPrivacy: 'Gizlilik Politikası',
      consentMiddle: ',',
      consentKvkk: 'KVKK aydınlatma metni',
      consentSuffix: 've tura özel rezervasyon koşulları.',
      errorName: 'Lütfen ad ve soyadınızı girin',
      errorEmail: 'Lütfen geçerli bir e-posta adresi girin',
      errorPhone: 'Lütfen geçerli bir telefon numarası girin',
      errorHotelName: 'Lütfen otel adını girin',
      errorConsent: 'Lütfen gizlilik bildirimini ve rezervasyon koşullarını onaylayın',
      continueToPayment: 'Ödemeye Devam →',
    },

    payment: {
      heading: 'Ödeme',
      subtitle: 'Ödeme tamamlanana kadar rezervasyonunuz onaylanmaz.',
      methodTitle: 'Ödeme yöntemi seçin',
      card: 'Kredi kartı',
      cardBrands: 'Visa, Mastercard',
      iyzico: 'iyzico',
      iyzicoNote: 'Güvenli yerel ödeme',
      promoLabel: 'Promosyon kodu',
      promoPlaceholder: 'Kodu girin',
      promoNote: 'Güvenli şekilde doğrulanır',
      ssl: 'SSL korumalı',
      secure3d: 'Desteklenen kartlarda 3D Secure',
      cardHandled: 'Kart bilgileri ödeme sağlayıcısı tarafından işlenir',
      stripeDisabled:
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY tanımlanana kadar kartla ödeme devre dışıdır.',
      continueToSecure: 'Güvenli ödemeye devam',
      secureCardHeading: 'Güvenli kart ödemesi',
      secureIyzicoHeading: 'Güvenli iyzico ödemesi',
      payButton: '{amount} güvenle öde',
      errorGeneric: 'Ödeme tamamlanamadı.',
      errorSetup: 'Ödeme başlatılamadı. Hesabınızdan tahsilat yapılmadı.',
      errorSession: 'Güvenli ödeme oturumu oluşturulamadı.',
      errorIyzico: 'iyzico ödeme sayfası oluşturulamadı.',
      pending: 'Ödemeniz onaylanıyor. Lütfen bu sayfayı açık tutun.',
    },

    success: {
      heading: 'Rezervasyon Onaylandı!',
      subtitle:
        'Ödeme alındı. Bu rezervasyon özetini saklayın; alım konusunda desteğe ihtiyacınız olursa ekibimize yazın.',
      detailsTitle: 'Rezervasyon Detayları',
      reservationNumber: 'Rezervasyon Numarası',
      processing: 'İşleniyor',
      tour: 'Tur',
      date: 'Tarih',
      guests: 'Kişi',
      totalPaid: 'Ödenen Toplam',
      backHome: 'Ana Sayfaya Dön',
      printVoucher: 'Voucher’ı Yazdır / Kaydet',
      whatsappSupport: 'WhatsApp Desteği',
      whatsappMessage: 'Merhaba, {number} numaralı rezervasyonum için yardım istiyorum.',
      needHelp: 'Yardım mı lazım? Bize ulaşın:',
    },

    summary: {
      title: 'Rezervasyon Özeti',
      privateUpgrade: 'Özel tur yükseltmesi',
      total: 'Toplam',
      taxesIncluded: 'Vergiler dahil',
      adultsLine: '{count}x Misafir × {price}',
      childrenLine: '{count}x Çocuk × {price}',
    },

    guests: {
      adults: '{count} Misafir',
      adultsPlural: '{count} Misafir',
      children: '{count} Çocuk',
      childrenPlural: '{count} Çocuk',
      private: '(Özel)',
    },
  },

  chat: {
    greetingTitle: 'Kapadokya’ya hoş geldiniz!',
    greetingText: 'Bugün size nasıl yardımcı olabiliriz?',
    closeLabel: 'Asistanı kapat',
    openLabel: 'WhatsApp tur asistanını aç',
    choices: ['Sıcak Hava Balonu', 'ATV Turu', 'At Binme', 'Jeep Safari', 'Günlük Turlar', 'Havalimanı Transferi'],
    other: 'Diğer / WhatsApp’tan sorun',
    otherMessage: 'Merhaba 👋 Kapadokya deneyimi seçmek için yardım istiyorum.',
  },

  cookie: {
    aria: 'Çerez tercihleri',
    title: 'Gizlilik tercihleriniz',
    textPrefix:
      'Rezervasyonların çalışması için zorunlu çerezler kullanıyoruz. Analiz ve reklam çerezleri yalnızca onayınızdan sonra yüklenir. Ayrıntılar:',
    policyLink: 'Çerez Politikası',
    textSuffix: '.',
    essentialOnly: 'Yalnızca zorunlu',
    acceptAll: 'Tümünü kabul et',
  },

  notFound: {
    title: 'Bu rota biraz rotadan çıktı.',
    text: 'Aradığınız deneyim taşınmış veya artık mevcut olmayabilir.',
    cta: 'Mevcut turları keşfet',
  },

  whatsapp: {
    defaultMessage:
      'Merhaba 👋 Discovery Cappadocia’ya hoş geldiniz!\nKapadokya turları hakkında bilgi almak istiyorum.',
  },

  tours: toursTr,
};
