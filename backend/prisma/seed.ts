import { PrismaClient, TourCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

  // Create tours
  const tours = [
    {
      title: 'Cappadocia Hot Air Balloon Flight',
      slug: 'hot-air-balloon-flight',
      description: 'Experience the magic of Cappadocia from above with our premium hot air balloon flight. Watch the sunrise paint the fairy chimneys in golden hues as you float silently over this UNESCO World Heritage site. Our experienced pilots ensure a safe and unforgettable journey through the stunning valleys and rock formations that make Cappadocia one of the most photographed places on Earth.',
      shortDesc: 'Sunrise balloon flight over fairy chimneys with champagne toast',
      category: TourCategory.BALLOON,
      basePrice: 250,
      duration: '3-4 hours (1 hour flight)',
      maxCapacity: 20,
      images: [
        '/images/cappadocia-hero-signature.png',
        '/images/cappadocia-sunrise-section.png',
      ],
      videoUrl: 'https://www.youtube.com/watch?v=cappadocia-balloon',
      highlights: [
        'Sunrise flight over fairy chimneys',
        'Professional pilot with 10+ years experience',
        'Champagne toast upon landing',
        'Flight certificate',
        'Hotel pickup and drop-off',
        'Light breakfast before flight',
      ],
      includes: [
        'Hotel transfers',
        'Light breakfast',
        'Insurance',
        'Champagne celebration',
        'Flight certificate',
      ],
      excludes: [
        'Personal expenses',
        'Tips',
        'Extra photos',
      ],
      sortOrder: 1,
    },
    {
      title: 'Cappadocia Green Tour',
      slug: 'cappadocia-green-tour',
      description: 'Discover the most remarkable sights of Cappadocia in a single day. Visit ancient underground cities, explore dramatic valleys, and see centuries-old cave churches with stunning frescoes. This comprehensive tour covers all the must-see attractions with an expert guide who brings the history and geology to life.',
      shortDesc: 'Complete Cappadocia exploration with expert guide',
      category: TourCategory.DAILY_TOUR,
      basePrice: 75,
      duration: '8-10 hours',
      maxCapacity: 15,
      images: [
        '/images/cappadocia-sunrise-section.png',
        '/images/cappadocia-routes-aerial.png',
      ],
      highlights: [
        'Goreme Open Air Museum',
        'Derinkuyu Underground City',
        'Uchisar Castle viewpoint',
        'Pasabag Fairy Chimneys',
        'Avanos pottery demonstration',
        'Love Valley panoramic views',
      ],
      includes: [
        'Professional English-speaking guide',
        'Air-conditioned transport',
        'Museum entrance fees',
        'Lunch at local restaurant',
        'Hotel pickup and drop-off',
      ],
      excludes: [
        'Personal expenses',
        'Tips',
        'Drinks',
      ],
      sortOrder: 2,
    },
    {
      title: 'ATV Quad Safari Adventure',
      slug: 'atv-quad-safari',
      description: 'Get your adrenaline pumping with an exciting ATV ride through the dramatic landscapes of Cappadocia. Navigate through valleys, past fairy chimneys, and across rugged terrain on powerful quad bikes. Perfect for thrill-seekers who want to experience Cappadocia off the beaten path.',
      shortDesc: 'Thrilling ATV ride through valleys and fairy chimneys',
      category: TourCategory.ADVENTURE,
      basePrice: 60,
      duration: '2-3 hours',
      maxCapacity: 10,
      images: [
        '/images/cappadocia-atv-tour.png',
        '/images/cappadocia-routes-aerial.png',
      ],
      highlights: [
        'Ride through Sword Valley',
        'Rose Valley sunset views',
        'Professional safety briefing',
        'High-quality ATV equipment',
        'Scenic photo stops',
        'Suitable for beginners',
      ],
      includes: [
        'ATV rental and fuel',
        'Helmet and goggles',
        'Professional guide',
        'Insurance',
        'Hotel pickup and drop-off',
      ],
      excludes: [
        'Personal expenses',
        'Tips',
      ],
      sortOrder: 3,
    },
    {
      title: 'Sunrise or Sunset Horse Riding',
      slug: 'cappadocia-horse-riding',
      description: 'Ride quiet Cappadocia trails through valleys and rock formations with a local guide. Departure timing is matched to sunrise or sunset conditions.',
      shortDesc: 'Guided horse riding through Cappadocia valleys',
      category: TourCategory.ADVENTURE,
      basePrice: 50,
      duration: '2 hours',
      maxCapacity: 10,
      images: ['/images/cappadocia-blue-hour-section.png', '/images/cappadocia-rose-valley-section.png'],
      highlights: ['Sunrise or sunset departure', 'Small-group trail', 'Safety briefing', 'Scenic photo stops'],
      includes: ['Horse and equipment', 'Helmet', 'Local guide', 'Selected hotel pickup'],
      excludes: ['Personal expenses', 'Photos', 'Tips'],
      sortOrder: 4,
    },
    {
      title: 'Cappadocia Jeep Safari',
      slug: 'cappadocia-jeep-safari',
      description: 'Reach rugged valleys and panoramic viewpoints on a guided off-road Jeep safari through Cappadocia.',
      shortDesc: 'Off-road adventure to hidden viewpoints',
      category: TourCategory.ADVENTURE,
      basePrice: 65,
      duration: '2-3 hours',
      maxCapacity: 16,
      images: ['/images/cappadocia-routes-aerial.png', '/images/cappadocia-rose-valley-section.png'],
      highlights: ['Off-road valley route', 'Panoramic stops', 'Local driver-guide', 'Flexible departure options'],
      includes: ['Jeep and driver', 'Fuel', 'Insurance', 'Selected hotel pickup'],
      excludes: ['Food and drinks', 'Personal expenses', 'Tips'],
      sortOrder: 5,
    },
    {
      title: 'Cappadocia Red Tour',
      slug: 'cappadocia-red-tour',
      description: 'Explore northern Cappadocia with a licensed guide, comfortable transport and the region’s best-known landscape and cultural stops.',
      shortDesc: 'Full-day guided northern Cappadocia route',
      category: TourCategory.DAILY_TOUR,
      basePrice: 70,
      duration: '7-8 hours',
      maxCapacity: 15,
      images: ['/images/cappadocia-tours-hero.png', '/images/cappadocia-routes-aerial.png'],
      highlights: ['Göreme region', 'Fairy chimney valleys', 'Cultural stop', 'Professional guide'],
      includes: ['Licensed guide', 'Transport', 'Lunch', 'Stated museum entries'],
      excludes: ['Drinks', 'Personal expenses', 'Tips'],
      sortOrder: 6,
    },
    {
      title: 'Private Airport/Hotel Transfer',
      slug: 'private-transfer',
      description: 'Start and end your Cappadocia journey in comfort with our premium private transfer service. Our professional drivers ensure a smooth, safe journey between the airport and your hotel in a luxury vehicle. Available 24/7 for your convenience.',
      shortDesc: 'Comfortable private transfer with professional driver',
      category: TourCategory.TRANSFER,
      basePrice: 40,
      duration: '45-60 min',
      maxCapacity: 6,
      images: [
        '/images/cappadocia-routes-aerial.png',
      ],
      highlights: [
        'Meet & greet at airport',
        'Luxury vehicle',
        'Professional driver',
        'Available 24/7',
        'Child seat available',
        'Free cancellation',
      ],
      includes: [
        'Private vehicle',
        'Professional driver',
        'Meet & greet',
        'Luggage assistance',
      ],
      excludes: [
        'Tips',
      ],
      sortOrder: 7,
    },
  ];

  for (const tourData of tours) {
    const tour = await prisma.tour.upsert({
      where: { slug: tourData.slug },
      update: tourData,
      create: tourData,
    });
    console.log(`✅ Tour created: ${tour.title}`);

    // Create upsells for balloon tour
    if (tour.category === TourCategory.BALLOON) {
      await prisma.tourUpsell.createMany({
        data: [
          {
            tourId: tour.id,
            name: 'Professional Photography Package',
            description: 'Professional photographer captures your flight with 50+ edited photos',
            price: 75,
            icon: '📸',
          },
          // VIP Package and Hotel Transfer are included free of charge — not sold as add-ons.
        ],
        skipDuplicates: true,
      });
    }

    // Create availability for next 90 days
    const today = new Date();
    for (let i = 1; i <= 90; i++) {
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
