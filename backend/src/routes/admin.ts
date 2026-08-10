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

// Get single tour (admin)
adminRouter.get('/tours/:id', async (req, res, next) => {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: req.params.id },
      include: { upsells: true, _count: { select: { bookings: true } } },
    });
    if (!tour) throw new AppError('Tour not found', 404);
    res.json({ success: true, data: tour });
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
  } catch (err: any) {
    const isForeignKeyViolation =
      err?.code === 'P2003' ||
      err?.code === 'P2014' ||
      err?.meta?.code === '23503' ||
      err?.meta?.code === '23001' ||
      /foreign key constraint/i.test(err?.message || '');

    if (isForeignKeyViolation) {
      return next(new AppError('Cannot delete a tour that has existing bookings. Deactivate it instead.', 409));
    }
    if (err?.code === 'P2025') {
      return next(new AppError('Tour not found', 404));
    }
    next(err);
  }
});

// Quick price change — the full tour form is overkill when all you want is to
// move a price, and it would round-trip every other field with it.
adminRouter.patch('/tours/:id/price', async (req, res, next) => {
  try {
    const { basePrice } = z.object({ basePrice: z.number().positive() }).parse(req.body);
    const tour = await prisma.tour.update({
      where: { id: req.params.id },
      data: { basePrice },
    });
    await invalidateCache('tours:*');
    await invalidateCache(`tour:${tour.slug}`);
    res.json({ success: true, data: tour });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors[0].message, 400));
    if ((err as any)?.code === 'P2025') return next(new AppError('Tour not found', 404));
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
          payment: { select: { status: true, provider: true, amount: true, currency: true, providerPaymentId: true } },
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

// Get single booking (full detail)
adminRouter.get('/bookings/:id', async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        tour: { select: { title: true, category: true, basePrice: true } },
        user: { select: { name: true, email: true, phone: true } },
        payment: true,
      },
    });
    if (!booking) throw new AppError('Booking not found', 404);
    res.json({ success: true, data: booking });
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
        // `null` is meaningful here: it clears an override back to base price.
        priceOverride: data.priceOverride ?? null,
        isBlocked: data.isBlocked ?? false,
      },
      update: {
        seatsAvailable: data.seatsAvailable,
        seatsTotal: data.seatsTotal,
        priceOverride: data.priceOverride ?? null,
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

/**
 * Classification used by the availability calendar. `missing` is the one that
 * matters operationally: no row at all means the tour silently cannot be
 * booked that day, which is invisible unless you go looking for it.
 */
type DayStatus = 'missing' | 'blocked' | 'soldOut' | 'low' | 'open';

function classifyDay(row: { seatsAvailable: number; seatsTotal: number; isBlocked: boolean } | undefined): DayStatus {
  if (!row) return 'missing';
  if (row.isBlocked) return 'blocked';
  if (row.seatsAvailable <= 0) return 'soldOut';
  if (row.seatsTotal > 0 && row.seatsAvailable / row.seatsTotal <= 0.2) return 'low';
  return 'open';
}

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Every YYYY-MM-DD from `from` to `to` inclusive. */
function eachDay(from: Date, to: Date): string[] {
  const days: string[] = [];
  for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(toDateKey(d));
  }
  return days;
}

const rangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  days: z.coerce.number().int().min(1).max(365).optional(),
});

/** Resolves an explicit from/to pair, or `days` forward from today. */
function resolveRange(query: unknown): { from: Date; to: Date } {
  const parsed = rangeSchema.parse(query);
  const from = parsed.from ? new Date(`${parsed.from}T00:00:00.000Z`) : new Date(`${toDateKey(new Date())}T00:00:00.000Z`);
  const to = parsed.to
    ? new Date(`${parsed.to}T00:00:00.000Z`)
    : new Date(from.getTime() + (parsed.days ?? 60) * 86400000);
  if (to < from) throw new AppError('End date must be on or after the start date', 400);
  return { from, to };
}

// Day-by-day availability for one tour — what the calendar renders.
adminRouter.get('/availability', async (req, res, next) => {
  try {
    const tourId = z.string().uuid().parse(req.query.tourId);
    const { from, to } = resolveRange(req.query);

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true, title: true, basePrice: true, currency: true, maxCapacity: true, isActive: true },
    });
    if (!tour) throw new AppError('Tour not found', 404);

    const [rows, bookings] = await Promise.all([
      prisma.availability.findMany({
        where: { tourId, date: { gte: from, lte: to } },
        orderBy: { date: 'asc' },
      }),
      prisma.booking.groupBy({
        by: ['date'],
        where: { tourId, date: { gte: from, lte: to }, status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] } },
        _count: { _all: true },
        _sum: { adults: true, children: true },
      }),
    ]);

    const rowByDate = new Map(rows.map((row) => [toDateKey(row.date), row]));
    const bookingByDate = new Map(
      bookings.map((b) => [
        toDateKey(b.date),
        { count: b._count._all, guests: (b._sum.adults || 0) + (b._sum.children || 0) },
      ]),
    );

    const summary: Record<DayStatus, number> = { missing: 0, blocked: 0, soldOut: 0, low: 0, open: 0 };
    const days = eachDay(from, to).map((date) => {
      const row = rowByDate.get(date);
      const status = classifyDay(row);
      summary[status] += 1;
      const booked = bookingByDate.get(date);
      return {
        date,
        status,
        seatsAvailable: row?.seatsAvailable ?? null,
        seatsTotal: row?.seatsTotal ?? null,
        priceOverride: row?.priceOverride ?? null,
        isBlocked: row?.isBlocked ?? false,
        bookings: booked?.count ?? 0,
        guests: booked?.guests ?? 0,
      };
    });

    res.json({
      success: true,
      data: { tour, from: toDateKey(from), to: toDateKey(to), days, summary },
    });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('A valid tourId is required', 400));
    next(err);
  }
});

// Cross-catalogue gap report: which tours are unsellable, and from when.
adminRouter.get('/availability/gaps', async (req, res, next) => {
  try {
    const { from, to } = resolveRange(req.query);
    const dates = eachDay(from, to);

    const tours = await prisma.tour.findMany({
      where: { isActive: true },
      select: { id: true, title: true, category: true, basePrice: true, currency: true },
      orderBy: { sortOrder: 'asc' },
    });

    const rows = await prisma.availability.findMany({
      where: { tourId: { in: tours.map((t) => t.id) }, date: { gte: from, lte: to } },
      select: { tourId: true, date: true, seatsAvailable: true, seatsTotal: true, isBlocked: true },
    });

    const byTour = new Map<string, Map<string, (typeof rows)[number]>>();
    for (const row of rows) {
      if (!byTour.has(row.tourId)) byTour.set(row.tourId, new Map());
      byTour.get(row.tourId)!.set(toDateKey(row.date), row);
    }

    const report = tours.map((tour) => {
      const rowsForTour = byTour.get(tour.id);
      const counts: Record<DayStatus, number> = { missing: 0, blocked: 0, soldOut: 0, low: 0, open: 0 };
      let firstGap: string | null = null;
      for (const date of dates) {
        const status = classifyDay(rowsForTour?.get(date));
        counts[status] += 1;
        if (firstGap === null && (status === 'missing' || status === 'blocked' || status === 'soldOut')) {
          firstGap = date;
        }
      }
      return { ...tour, ...counts, firstGap, unsellable: counts.missing + counts.blocked + counts.soldOut };
    });

    // Worst offenders first — that is the order you want to work through them.
    report.sort((a, b) => b.unsellable - a.unsellable);

    res.json({
      success: true,
      data: {
        from: toDateKey(from),
        to: toDateKey(to),
        totalDays: dates.length,
        tours: report,
        toursWithGaps: report.filter((t) => t.unsellable > 0).length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// =================== PAYMENTS ===================

adminRouter.get('/payments', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const provider = req.query.provider as string;

    const where: any = {};
    if (status) where.status = status;
    if (provider) where.provider = provider;

    const [payments, total, totals] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              date: true,
              guestName: true,
              guestEmail: true,
              tour: { select: { title: true, category: true } },
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({ where: { ...where, status: 'COMPLETED' }, _sum: { amount: true } }),
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      totalCompleted: totals._sum.amount || 0,
    });
  } catch (err) {
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

// =================== PROMO CODES ===================

const promoBaseSchema = z.object({
  code: z.string().trim().toUpperCase().min(2).max(40),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.number().positive(),
  isActive: z.boolean().optional().default(true),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
});
const promoSchema = promoBaseSchema.refine((data) => data.type !== 'PERCENT' || data.value <= 100, { message: 'Percentage cannot exceed 100' });

adminRouter.get('/promo-codes', async (_req, res, next) => {
  try {
    const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: codes });
  } catch (err) { next(err); }
});

adminRouter.post('/promo-codes', async (req, res, next) => {
  try {
    const data = promoSchema.parse(req.body);
    const code = await prisma.promoCode.create({ data: { ...data, startsAt: data.startsAt ? new Date(data.startsAt) : null, endsAt: data.endsAt ? new Date(data.endsAt) : null } });
    res.status(201).json({ success: true, data: code });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors[0].message, 400));
    next(err);
  }
});

adminRouter.patch('/promo-codes/:id', async (req, res, next) => {
  try {
    const data = promoBaseSchema.partial().parse(req.body);
    if (data.type === 'PERCENT' && data.value !== undefined && data.value > 100) throw new AppError('Percentage cannot exceed 100', 400);
    const code = await prisma.promoCode.update({ where: { id: req.params.id }, data: { ...data, startsAt: data.startsAt ? new Date(data.startsAt) : data.startsAt, endsAt: data.endsAt ? new Date(data.endsAt) : data.endsAt } });
    res.json({ success: true, data: code });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors[0].message, 400));
    next(err);
  }
});
