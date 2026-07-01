import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { invalidateCache } from '../lib/redis';

export const adminRouter = Router();

// All admin routes require authentication + admin role
adminRouter.use(authenticate);
adminRouter.use(requireAdmin);

// =================== DASHBOARD ===================

adminRouter.get('/dashboard', async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [totalBookings, monthBookings, lastMonthBookings, totalRevenue, monthRevenue, totalUsers, activeTours, upcomingBookings] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.booking.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.user.count(),
      prisma.tour.count({ where: { isActive: true } }),
      prisma.booking.count({ where: { date: { gte: now }, status: { in: ['CONFIRMED', 'PENDING'] } } }),
    ]);

    res.json({
      success: true,
      data: {
        totalBookings,
        monthBookings,
        lastMonthBookings,
        bookingGrowth: lastMonthBookings > 0 ? ((monthBookings - lastMonthBookings) / lastMonthBookings) * 100 : 0,
        totalRevenue: totalRevenue._sum.amount || 0,
        monthRevenue: monthRevenue._sum.amount || 0,
        totalUsers,
        activeTours,
        upcomingBookings,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Revenue analytics
adminRouter.get('/analytics/revenue', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      include: {
        booking: {
          include: { tour: { select: { title: true, category: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const dailyRevenue: Record<string, number> = {};
    const categoryRevenue: Record<string, number> = {};

    payments.forEach((p) => {
      const dateKey = p.createdAt.toISOString().split('T')[0];
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + p.amount;

      const cat = p.booking.tour.category;
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + p.amount;
    });

    res.json({
      success: true,
      data: { dailyRevenue, categoryRevenue, totalPayments: payments.length },
    });
  } catch (err) {
    next(err);
  }
});

// =================== TOURS MANAGEMENT ===================

const tourSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  shortDesc: z.string().min(5),
  category: z.enum(['BALLOON', 'DAILY_TOUR', 'ADVENTURE', 'TRANSFER']),
  basePrice: z.number().positive(),
  currency: z.string().default('USD'),
  duration: z.string(),
  maxCapacity: z.number().int().positive(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// List all tours (admin)
adminRouter.get('/tours', async (_req, res, next) => {
  try {
    const tours = await prisma.tour.findMany({
      include: { _count: { select: { bookings: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: tours });
  } catch (err) {
    next(err);
  }
});

// Create tour
adminRouter.post('/tours', async (req, res, next) => {
  try {
    const data = tourSchema.parse(req.body);
    const tour = await prisma.tour.create({ data: data as any });
    await invalidateCache('tours:*');
    res.status(201).json({ success: true, data: tour });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors[0].message, 400));
    next(err);
  }
});

// Update tour
adminRouter.put('/tours/:id', async (req, res, next) => {
  try {
    const data = tourSchema.partial().parse(req.body);
    const tour = await prisma.tour.update({
      where: { id: req.params.id },
      data: data as any,
    });
    await invalidateCache('tours:*');
    await invalidateCache(`tour:${tour.slug}`);
    res.json({ success: true, data: tour });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors[0].message, 400));
    next(err);
  }
});

// Toggle tour active
adminRouter.patch('/tours/:id/toggle', async (req, res, next) => {
  try {
    const tour = await prisma.tour.findUnique({ where: { id: req.params.id } });
    if (!tour) throw new AppError('Tour not found', 404);

    const updated = await prisma.tour.update({
      where: { id: req.params.id },
      data: { isActive: !tour.isActive },
    });

    await invalidateCache('tours:*');
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// Delete tour
adminRouter.delete('/tours/:id', async (req, res, next) => {
  try {
    await prisma.tour.delete({ where: { id: req.params.id } });
    await invalidateCache('tours:*');
    res.json({ success: true, message: 'Tour deleted' });
  } catch (err) {
    next(err);
  }
});

// =================== BOOKINGS MANAGEMENT ===================

adminRouter.get('/bookings', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const where: any = {};
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          tour: { select: { title: true, category: true } },
          user: { select: { name: true, email: true } },
          payment: { select: { status: true, provider: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// Update booking status
adminRouter.patch('/bookings/:id/status', async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']) }).parse(req.body);

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: { tour: true },
    });

    // If cancelled, restore seats
    if (status === 'CANCELLED') {
      const totalPeople = booking.adults + booking.children;
      await prisma.availability.update({
        where: {
          tourId_date: { tourId: booking.tourId, date: booking.date },
        },
        data: { seatsAvailable: { increment: totalPeople } },
      });
      await invalidateCache(`availability:${booking.tourId}:*`);
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors[0].message, 400));
    next(err);
  }
});

// =================== AVAILABILITY MANAGEMENT ===================

const availabilitySchema = z.object({
  tourId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  seatsAvailable: z.number().int().min(0),
  seatsTotal: z.number().int().min(1),
  priceOverride: z.number().positive().optional().nullable(),
  isBlocked: z.boolean().optional(),
});

// Set availability
adminRouter.post('/availability', async (req, res, next) => {
  try {
    const data = availabilitySchema.parse(req.body);
    const bookingDate = new Date(data.date);

    const availability = await prisma.availability.upsert({
      where: {
        tourId_date: { tourId: data.tourId, date: bookingDate },
      },
      create: {
        tourId: data.tourId,
        date: bookingDate,
        seatsAvailable: data.seatsAvailable,
        seatsTotal: data.seatsTotal,
        priceOverride: data.priceOverride ?? undefined,
        isBlocked: data.isBlocked ?? false,
      },
      update: {
        seatsAvailable: data.seatsAvailable,
        seatsTotal: data.seatsTotal,
        priceOverride: data.priceOverride ?? undefined,
        isBlocked: data.isBlocked ?? false,
      },
    });

    await invalidateCache(`availability:${data.tourId}:*`);
    res.json({ success: true, data: availability });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors[0].message, 400));
    next(err);
  }
});

// Bulk set availability
adminRouter.post('/availability/bulk', async (req, res, next) => {
  try {
    const schema = z.object({
      tourId: z.string().uuid(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      seatsTotal: z.number().int().min(1),
      priceOverride: z.number().positive().optional().nullable(),
      excludeDays: z.array(z.number().int().min(0).max(6)).optional(),
    });

    const data = schema.parse(req.body);
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const results = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (data.excludeDays?.includes(dayOfWeek)) continue;

      const dateStr = new Date(d);
      const avail = await prisma.availability.upsert({
        where: {
          tourId_date: { tourId: data.tourId, date: dateStr },
        },
        create: {
          tourId: data.tourId,
          date: dateStr,
          seatsAvailable: data.seatsTotal,
          seatsTotal: data.seatsTotal,
          priceOverride: data.priceOverride ?? undefined,
        },
        update: {
          seatsTotal: data.seatsTotal,
          priceOverride: data.priceOverride ?? undefined,
        },
      });
      results.push(avail);
    }

    await invalidateCache(`availability:${data.tourId}:*`);
    res.json({ success: true, data: results, count: results.length });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors[0].message, 400));
    next(err);
  }
});

// =================== CUSTOMERS ===================

adminRouter.get('/customers', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});
