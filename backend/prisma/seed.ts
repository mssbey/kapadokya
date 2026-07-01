import { PrismaClient, TourCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@discoverycappadocia.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@discoverycappadocia.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+90 555 000 0000',
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
        '/images/tours/balloon-1.jpg',
        '/images/tours/balloon-2.jpg',
        '/images/tours/balloon-3.jpg',
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
      title: 'Full Day Cappadocia Tour',
      slug: 'full-day-cappadocia-tour',
      description: 'Discover the most remarkable sights of Cappadocia in a single day. Visit ancient underground cities, explore dramatic valleys, and see centuries-old cave churches with stunning frescoes. This comprehensive tour covers all the must-see attractions with an expert guide who brings the history and geology to life.',
      shortDesc: 'Complete Cappadocia exploration with expert guide',
      category: TourCategory.DAILY_TOUR,
      basePrice: 75,
      duration: '8-10 hours',
      maxCapacity: 15,
      images: [
        '/images/tours/daily-1.jpg',
        '/images/tours/daily-2.jpg',
        '/images/tours/daily-3.jpg',
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
        '/images/tours/atv-1.jpg',
        '/images/tours/atv-2.jpg',
        '/images/tours/atv-3.jpg',
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
      title: 'Private Airport/Hotel Transfer',
      slug: 'private-transfer',
      description: 'Start and end your Cappadocia journey in comfort with our premium private transfer service. Our professional drivers ensure a smooth, safe journey between the airport and your hotel in a luxury vehicle. Available 24/7 for your convenience.',
      shortDesc: 'Comfortable private transfer with professional driver',
      category: TourCategory.TRANSFER,
      basePrice: 40,
      duration: '45-60 min',
      maxCapacity: 6,
      images: [
        '/images/tours/transfer-1.jpg',
        '/images/tours/transfer-2.jpg',
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
      sortOrder: 4,
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
          {
            tourId: tour.id,
            name: 'VIP Package',
            description: 'Smaller basket (max 8 people), longer flight, premium champagne',
            price: 150,
            icon: '👑',
          },
          {
            tourId: tour.id,
            name: 'Hotel Transfer (Round Trip)',
            description: 'Private car pickup from and return to your hotel',
            price: 25,
            icon: '🚗',
          },
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
