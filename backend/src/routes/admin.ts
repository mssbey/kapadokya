import { Router } from 'express';
import { BookingStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { invalidateCache } from '../lib/redis';
import { SUPPORTED_LOCALES, currentCatalogDate, normalizeLocale, presentTour, publicTourIncludeForDate } from '../lib/catalog';
import { assertSlugAvailable, normalizeSlug } from '../lib/slug';
import { transitionBookingStatus } from '../services/bookingStatus';
import { writeAudit } from '../lib/audit';

export const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function pagination(page: number, limit: number, total: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages, pages: totalPages };
}

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

const activeBookingStatuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED'];

// =================== DASHBOARD & ANALYTICS ===================

adminRouter.get('/dashboard', async (_req, res, next) => {
  try {
    const now = new Date();
    const today = new Date(`${now.toISOString().slice(0, 10)}T00:00:00.000Z`);
    const tomorrow = new Date(today.getTime() + 86400000);
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const end30 = new Date(today.getTime() + 30 * 86400000);

    const [
      totalBookings, todayBookings, upcomingBookings, pendingBookings, confirmedBookings, cancelledBookings,
      totalRevenue, monthRevenue, todayRevenue, completedPayments, totalUsers, activeTours,
      recentBookings, topTours, lowDates, soldOutDates, missingStats,
      monthBookings, lastMonthBookings,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { date: { gte: today, lt: tomorrow }, status: { in: activeBookingStatuses } } }),
      prisma.booking.count({ where: { date: { gte: tomorrow }, status: { in: ['PENDING', 'CONFIRMED'] } } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED', processedAt: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED', processedAt: { gte: today, lt: tomorrow } }, _sum: { amount: true } }),
      prisma.payment.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.tour.count({ where: { isActive: true, deletedAt: null } }),
      prisma.booking.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { tour: { select: { title: true } }, payment: { select: { status: true, provider: true } } },
      }),
      prisma.booking.groupBy({
        by: ['tourId'],
        where: { status: { not: 'CANCELLED' } },
        _count: { _all: true },
        _sum: { totalPrice: true },
        orderBy: { _count: { tourId: 'desc' } },
        take: 5,
      }),
      prisma.availability.count({
        where: { date: { gte: today, lte: end30 }, isBlocked: false, seatsAvailable: { gt: 0 }, seatsTotal: { gt: 0 } },
      }),
      prisma.availability.count({ where: { date: { gte: today, lte: end30 }, isBlocked: false, seatsAvailable: 0 } }),
      prisma.tour.findMany({ where: { isActive: true, deletedAt: null }, select: { id: true } }),
      prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.booking.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    ]);

    const lowCapacityDates = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count FROM "Availability"
      WHERE "date" >= ${today} AND "date" <= ${end30}
        AND "isBlocked" = false AND "seatsAvailable" > 0
        AND "seatsAvailable"::float / NULLIF("seatsTotal", 0) <= 0.2
    `;
    const availabilityRows = await prisma.availability.count({
      where: { tourId: { in: missingStats.map((tour) => tour.id) }, date: { gte: today, lte: end30 } },
    });
    const expectedRows = missingStats.length * 31;
    const tourIds = topTours.map((row) => row.tourId);
    const topTourNames = await prisma.tour.findMany({ where: { id: { in: tourIds } }, select: { id: true, title: true } });
    const names = new Map(topTourNames.map((tour) => [tour.id, tour.title]));

    res.json({
      success: true,
      data: {
        totalBookings, todayBookings, upcomingBookings, pendingBookings, confirmedBookings, cancelledBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        monthRevenue: monthRevenue._sum.amount || 0,
        todayRevenue: todayRevenue._sum.amount || 0,
        completedPayments, totalUsers, activeTours,
        monthBookings,
        bookingGrowth: lastMonthBookings ? ((monthBookings - lastMonthBookings) / lastMonthBookings) * 100 : 0,
        lowCapacityDates: Number(lowCapacityDates[0]?.count || 0),
        soldOutDates,
        missingAvailabilityDates: Math.max(0, expectedRows - availabilityRows),
        openAvailabilityDates: lowDates,
        recentBookings,
        topTours: topTours.map((row) => ({ tourId: row.tourId, title: names.get(row.tourId), bookings: row._count._all, revenue: row._sum.totalPrice || 0 })),
      },
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/analytics/revenue', async (req, res, next) => {
  try {
    const days = z.coerce.number().int().min(1).max(365).default(30).parse(req.query.days);
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - days + 1);
    startDate.setUTCHours(0, 0, 0, 0);
    const rows = await prisma.$queryRaw<Array<{ date: Date; revenue: number; payments: bigint }>>`
      SELECT DATE(COALESCE(p."processedAt", p."createdAt")) AS date,
             SUM(p."amount")::float AS revenue,
             COUNT(*)::bigint AS payments
      FROM "Payment" p
      WHERE p."status" = 'COMPLETED' AND COALESCE(p."processedAt", p."createdAt") >= ${startDate}
      GROUP BY DATE(COALESCE(p."processedAt", p."createdAt")) ORDER BY date ASC
    `;
    const categoryRows = await prisma.$queryRaw<Array<{ categoryName: string; revenue: number }>>`
      SELECT c."name" AS "categoryName", SUM(p."amount")::float AS revenue
      FROM "Payment" p JOIN "Booking" b ON b."id" = p."bookingId" JOIN "Tour" t ON t."id" = b."tourId" JOIN "Category" c ON c."id" = t."categoryId"
      WHERE p."status" = 'COMPLETED' AND COALESCE(p."processedAt", p."createdAt") >= ${startDate}
      GROUP BY c."name"
    `;
    const dailyRevenue = Object.fromEntries(rows.map((row) => [new Date(row.date).toISOString().slice(0, 10), row.revenue]));
    const categoryRevenue = Object.fromEntries(categoryRows.map((row) => [row.categoryName, row.revenue]));
    res.json({ success: true, data: { dailyRevenue, categoryRevenue, totalPayments: rows.reduce((sum, row) => sum + Number(row.payments), 0) } });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

// =================== TOURS ===================

const translationSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  title: z.string().trim().min(2).max(180),
  shortDesc: z.string().trim().min(5).max(500),
  description: z.string().trim().min(10).max(10000),
  highlights: z.array(z.string().trim().min(1)).max(50).default([]),
  includes: z.array(z.string().trim().min(1)).max(50).default([]),
  excludes: z.array(z.string().trim().min(1)).max(50).default([]),
  meetingPoint: z.string().trim().max(1000).nullable().optional(),
  cancellationPolicy: z.string().trim().nullable().optional(),
  seoTitle: z.string().trim().max(70).nullable().optional(),
  seoDescription: z.string().trim().max(170).nullable().optional(),
});

const upsellSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000),
  price: z.number().nonnegative(),
  icon: z.string().max(20).nullable().optional(),
  isActive: z.boolean().default(true),
});

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(500).nullable().optional(),
  priceDelta: z.number().default(0),
  icon: z.string().max(20).nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const tourMutationSchema = z.object({
  slug: z.string().trim().min(2).max(180),
  categoryId: z.string().uuid(),
  tourType: z.enum(['GROUP', 'PRIVATE', 'PACKAGE', 'TRANSFER', 'ACTIVITY']).default('GROUP'),
  basePrice: z.number().positive(),
  discountedPrice: z.number().positive().nullable().optional(),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()).default('EUR'),
  childPriceRate: z.number().min(0).max(1).default(0.5),
  privatePriceMultiplier: z.number().min(1).max(20).default(1.5),
  duration: z.string().trim().min(1).max(100),
  startTime: z.string().trim().max(20).nullable().optional(),
  endTime: z.string().trim().max(20).nullable().optional(),
  maxCapacity: z.number().int().positive(),
  minParticipants: z.number().int().positive().default(1),
  defaultCapacity: z.number().int().positive(),
  videoUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isBookingEnabled: z.boolean().default(true),
  badge: z.enum(['BEST_SELLER', 'LIKELY_TO_SELL_OUT']).nullable().optional(),
  sortOrder: z.number().int().default(0),
  translations: z.array(translationSchema).min(1).max(SUPPORTED_LOCALES.length),
  upsells: z.array(upsellSchema).max(50).default([]),
  variants: z.array(variantSchema).max(20).default([]),
}).superRefine((data, ctx) => {
  if (!data.translations.some((translation) => translation.locale === 'en')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['translations'], message: 'English translation is required' });
  }
  if (new Set(data.translations.map((translation) => translation.locale)).size !== data.translations.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['translations'], message: 'Each locale may appear only once' });
  }
  if (data.discountedPrice != null && data.discountedPrice >= data.basePrice) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['discountedPrice'], message: 'Discounted price must be lower than base price' });
  }
  if (data.minParticipants > data.maxCapacity || data.defaultCapacity < data.minParticipants) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['minParticipants'], message: 'Participant limits are inconsistent' });
  }
});

async function assertCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) throw new AppError('Category not found', 400);
}

const adminTourInclude = Prisma.validator<Prisma.TourInclude>()({
  translations: { orderBy: { locale: 'asc' } },
  media: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
  upsells: { orderBy: { createdAt: 'asc' } },
  variants: { orderBy: { sortOrder: 'asc' } },
  slugAliases: { orderBy: { createdAt: 'desc' } },
  category: { select: { id: true, slug: true, name: true, imageUrl: true } },
  _count: { select: { bookings: true, availabilities: true } },
});

adminRouter.get('/tours', async (req, res, next) => {
  try {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const { page, limit } = paginationSchema.parse(req.query);
    const search = z.string().trim().max(100).optional().parse(req.query.search);
    const categoryId = req.query.categoryId ? z.string().uuid().parse(req.query.categoryId) : undefined;
    const status = z.enum(['ACTIVE', 'INACTIVE', 'DELETED']).optional().parse(req.query.status);
    const where: Prisma.TourWhereInput = {
      ...(status === 'DELETED' ? { deletedAt: { not: null } } : { deletedAt: null }),
      ...(status === 'ACTIVE' ? { isActive: true } : status === 'INACTIVE' ? { isActive: false } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(search ? { OR: [
        { slug: { contains: search, mode: 'insensitive' } },
        { translations: { some: { title: { contains: search, mode: 'insensitive' } } } },
      ] } : {}),
    };
    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        include: adminTourInclude,
        orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
        ...(hasPagination ? { skip: (page - 1) * limit, take: limit } : {}),
      }),
      prisma.tour.count({ where }),
    ]);
    res.json({ success: true, data: tours, pagination: pagination(page, hasPagination ? limit : Math.max(total, 1), total) });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.get('/tours/:id', async (req, res, next) => {
  try {
    const tour = await prisma.tour.findUnique({ where: { id: req.params.id }, include: adminTourInclude });
    if (!tour) throw new AppError('Tour not found', 404);
    res.json({ success: true, data: tour });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/tours/:id/preview', async (req, res, next) => {
  try {
    const locale = normalizeLocale(req.query.locale);
    const tour = await prisma.tour.findUnique({ where: { id: req.params.id }, include: publicTourIncludeForDate() });
    if (!tour) throw new AppError('Tour not found', 404);
    res.json({ success: true, data: presentTour(tour, locale) });
  } catch (error) {
    next(error);
  }
});

const scheduledPriceDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function scheduledDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function assertFuturePriceDate(date: Date) {
  if (date < currentCatalogDate()) throw new AppError('Past dates cannot be repriced', 400);
}

adminRouter.get('/tours/:id/scheduled-prices', async (req, res, next) => {
  try {
    const tourId = z.string().uuid().parse(req.params.id);
    const query = z.object({ from: scheduledPriceDateSchema, to: scheduledPriceDateSchema }).parse(req.query);
    const from = scheduledDate(query.from);
    const to = scheduledDate(query.to);
    if (to < from) throw new AppError('End date must be on or after start date', 400);
    if ((to.getTime() - from.getTime()) / 86400000 > 366) throw new AppError('Date range cannot exceed 366 days', 400);
    const prices = await prisma.tourScheduledPrice.findMany({
      where: { tourId, date: { gte: from, lte: to } },
      orderBy: { date: 'asc' },
    });
    res.json({ success: true, data: prices.map((item) => ({ ...item, date: dateKey(item.date) })) });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError('A valid tour and date range are required', 400));
    next(error);
  }
});

adminRouter.put('/tours/:id/scheduled-prices/:date', async (req: AuthRequest, res, next) => {
  try {
    const tourId = z.string().uuid().parse(req.params.id);
    const dateKeyValue = scheduledPriceDateSchema.parse(req.params.date);
    const { price } = z.object({ price: z.number().positive() }).parse(req.body);
    const date = scheduledDate(dateKeyValue);
    assertFuturePriceDate(date);
    const row = await prisma.tourScheduledPrice.upsert({
      where: { tourId_date: { tourId, date } },
      create: { tourId, date, price },
      update: { price },
    });
    await invalidateCache('tours:*');
    await invalidateCache(`availability:${tourId}:*`);
    await writeAudit(req, 'TOUR_SCHEDULED_PRICE_UPDATED', 'Tour', tourId, { date: dateKeyValue, price });
    res.json({ success: true, data: { ...row, date: dateKeyValue } });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.delete('/tours/:id/scheduled-prices/:date', async (req: AuthRequest, res, next) => {
  try {
    const tourId = z.string().uuid().parse(req.params.id);
    const dateKeyValue = scheduledPriceDateSchema.parse(req.params.date);
    const date = scheduledDate(dateKeyValue);
    assertFuturePriceDate(date);
    await prisma.tourScheduledPrice.deleteMany({ where: { tourId, date } });
    await invalidateCache('tours:*');
    await invalidateCache(`availability:${tourId}:*`);
    await writeAudit(req, 'TOUR_SCHEDULED_PRICE_DELETED', 'Tour', tourId, { date: dateKeyValue });
    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.post('/tours/:id/scheduled-prices/bulk', async (req: AuthRequest, res, next) => {
  try {
    const tourId = z.string().uuid().parse(req.params.id);
    const data = z.object({
      startDate: scheduledPriceDateSchema,
      endDate: scheduledPriceDateSchema,
      price: z.number().positive(),
      weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
    }).parse(req.body);
    const start = scheduledDate(data.startDate);
    const end = scheduledDate(data.endDate);
    assertFuturePriceDate(start);
    if (end < start) throw new AppError('End date must be on or after start date', 400);
    if ((end.getTime() - start.getTime()) / 86400000 > 365) throw new AppError('Date range cannot exceed 365 days', 400);
    const weekdays = new Set(data.weekdays);
    const dates = eachDay(start, end).filter((date) => weekdays.has(date.getUTCDay()));
    await prisma.$transaction(dates.map((date) => prisma.tourScheduledPrice.upsert({
      where: { tourId_date: { tourId, date } },
      create: { tourId, date, price: data.price },
      update: { price: data.price },
    })));
    await invalidateCache('tours:*');
    await invalidateCache(`availability:${tourId}:*`);
    await writeAudit(req, 'TOUR_SCHEDULED_PRICE_BULK_UPDATED', 'Tour', tourId, { ...data, count: dates.length });
    res.json({ success: true, data: { count: dates.length } });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.post('/tours', async (req: AuthRequest, res, next) => {
  try {
    const data = tourMutationSchema.parse(req.body);
    const slug = normalizeSlug(data.slug);
    await assertSlugAvailable(slug);
    await assertCategoryExists(data.categoryId);
    const english = data.translations.find((translation) => translation.locale === 'en')!;
    const tour = await prisma.tour.create({
      data: {
        slug,
        title: english.title,
        shortDesc: english.shortDesc,
        description: english.description,
        highlights: english.highlights,
        includes: english.includes,
        excludes: english.excludes,
        images: [],
        categoryId: data.categoryId,
        tourType: data.tourType,
        basePrice: data.basePrice,
        discountedPrice: data.discountedPrice,
        currency: data.currency,
        childPriceRate: data.childPriceRate,
        privatePriceMultiplier: data.privatePriceMultiplier,
        duration: data.duration,
        startTime: data.startTime,
        endTime: data.endTime,
        maxCapacity: data.maxCapacity,
        minParticipants: data.minParticipants,
        defaultCapacity: data.defaultCapacity,
        videoUrl: data.videoUrl,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isBookingEnabled: data.isBookingEnabled,
        badge: data.badge ?? null,
        sortOrder: data.sortOrder,
        translations: { create: data.translations },
        upsells: { create: data.upsells.map(({ id: _id, ...upsell }) => upsell) },
        variants: { create: data.variants.map(({ id: _id, ...variant }) => variant) },
      },
      include: adminTourInclude,
    });
    await invalidateCache('tours:*');
    await writeAudit(req, 'TOUR_CREATED', 'Tour', tour.id, { slug });
    res.status(201).json({ success: true, data: tour });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.put('/tours/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = tourMutationSchema.parse(req.body);
    const current = await prisma.tour.findUnique({ where: { id: req.params.id } });
    if (!current) throw new AppError('Tour not found', 404);
    const slug = normalizeSlug(data.slug);
    await assertSlugAvailable(slug, current.id);
    await assertCategoryExists(data.categoryId);
    const english = data.translations.find((translation) => translation.locale === 'en')!;

    const tour = await prisma.$transaction(async (tx) => {
      if (slug !== current.slug) {
        await tx.tourSlugAlias.upsert({ where: { slug: current.slug }, create: { tourId: current.id, slug: current.slug }, update: { tourId: current.id } });
      }
      await tx.tourTranslation.deleteMany({ where: { tourId: current.id } });
      await tx.tourUpsell.deleteMany({ where: { tourId: current.id } });
      await tx.tourVariant.deleteMany({ where: { tourId: current.id } });
      return tx.tour.update({
        where: { id: current.id },
        data: {
          slug,
          title: english.title,
          shortDesc: english.shortDesc,
          description: english.description,
          highlights: english.highlights,
          includes: english.includes,
          excludes: english.excludes,
          categoryId: data.categoryId,
          tourType: data.tourType,
          basePrice: data.basePrice,
          discountedPrice: data.discountedPrice,
          currency: data.currency,
          childPriceRate: data.childPriceRate,
          privatePriceMultiplier: data.privatePriceMultiplier,
          duration: data.duration,
          startTime: data.startTime,
          endTime: data.endTime,
          maxCapacity: data.maxCapacity,
          minParticipants: data.minParticipants,
          defaultCapacity: data.defaultCapacity,
          videoUrl: data.videoUrl,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          isBookingEnabled: data.isBookingEnabled,
          badge: data.badge ?? null,
          sortOrder: data.sortOrder,
          translations: { create: data.translations },
          upsells: { create: data.upsells.map(({ id: _id, ...upsell }) => upsell) },
          variants: { create: data.variants.map(({ id: _id, ...variant }) => variant) },
        },
        include: adminTourInclude,
      });
    });
    await invalidateCache('tours:*');
    await invalidateCache(`tour:*:${current.id}`);
    await writeAudit(req, 'TOUR_UPDATED', 'Tour', current.id, { oldSlug: current.slug, slug });
    res.json({ success: true, data: tour });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.patch('/tours/:id/price', async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ basePrice: z.number().positive(), discountedPrice: z.number().positive().nullable().optional(), currency: z.string().length(3).optional() }).parse(req.body);
    if (data.discountedPrice && data.discountedPrice >= data.basePrice) throw new AppError('Discounted price must be lower than base price', 400);
    const tour = await prisma.tour.update({ where: { id: req.params.id }, data: { ...data, currency: data.currency?.toUpperCase() } });
    await invalidateCache('tours:*');
    await writeAudit(req, 'TOUR_PRICE_UPDATED', 'Tour', tour.id, data);
    res.json({ success: true, data: tour });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.patch('/tours/:id/toggle', async (req: AuthRequest, res, next) => {
  try {
    const current = await prisma.tour.findUnique({ where: { id: req.params.id } });
    if (!current || current.deletedAt) throw new AppError('Tour not found', 404);
    const tour = await prisma.tour.update({ where: { id: current.id }, data: { isActive: !current.isActive } });
    await invalidateCache('tours:*');
    await writeAudit(req, 'TOUR_STATUS_CHANGED', 'Tour', tour.id, { isActive: tour.isActive });
    res.json({ success: true, data: tour });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/tours/bulk/status', async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ ids: z.array(z.string().uuid()).min(1).max(100), isActive: z.boolean() }).parse(req.body);
    const result = await prisma.tour.updateMany({ where: { id: { in: data.ids }, deletedAt: null }, data: { isActive: data.isActive } });
    await invalidateCache('tours:*');
    await writeAudit(req, 'TOURS_BULK_STATUS_CHANGED', 'Tour', undefined, { ids: data.ids, isActive: data.isActive });
    res.json({ success: true, data: { count: result.count } });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.post('/tours/:id/duplicate', async (req: AuthRequest, res, next) => {
  try {
    const source = await prisma.tour.findUnique({ where: { id: req.params.id }, include: { translations: true, media: true, upsells: true } });
    if (!source) throw new AppError('Tour not found', 404);
    let slug = `${source.slug}-copy`;
    let suffix = 2;
    while (await prisma.tour.findUnique({ where: { slug }, select: { id: true } })) slug = `${source.slug}-copy-${suffix++}`;
    const copy = await prisma.tour.create({
      data: {
        title: `${source.title} (Copy)`, slug, description: source.description, shortDesc: source.shortDesc,
        categoryId: source.categoryId, tourType: source.tourType, basePrice: source.basePrice,
        discountedPrice: source.discountedPrice, currency: source.currency, childPriceRate: source.childPriceRate,
        privatePriceMultiplier: source.privatePriceMultiplier, duration: source.duration, startTime: source.startTime,
        endTime: source.endTime, maxCapacity: source.maxCapacity, minParticipants: source.minParticipants,
        defaultCapacity: source.defaultCapacity, images: source.images, videoUrl: source.videoUrl,
        highlights: source.highlights, includes: source.includes, excludes: source.excludes,
        isActive: false, isFeatured: false, isBookingEnabled: source.isBookingEnabled, sortOrder: source.sortOrder + 1,
        translations: { create: source.translations.map(({ id, tourId, createdAt, updatedAt, ...translation }) => ({ ...translation, title: translation.locale === 'en' ? `${translation.title} (Copy)` : translation.title })) },
        media: { create: source.media.map(({ id, tourId, createdAt, updatedAt, ...image }) => image) },
        upsells: { create: source.upsells.map(({ id, tourId, createdAt, updatedAt, ...upsell }) => upsell) },
      },
      include: adminTourInclude,
    });
    await invalidateCache('tours:*');
    await writeAudit(req, 'TOUR_DUPLICATED', 'Tour', copy.id, { sourceId: source.id });
    res.status(201).json({ success: true, data: copy });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/tours/:id', async (req: AuthRequest, res, next) => {
  try {
    const tour = await prisma.tour.update({ where: { id: req.params.id }, data: { isActive: false, isBookingEnabled: false, deletedAt: new Date() } });
    await invalidateCache('tours:*');
    await writeAudit(req, 'TOUR_SOFT_DELETED', 'Tour', tour.id);
    res.json({ success: true, message: 'Tour archived safely' });
  } catch (error: any) {
    if (error?.code === 'P2025') return next(new AppError('Tour not found', 404));
    next(error);
  }
});

// =================== CATEGORIES ===================

const categoryMutationSchema = z.object({
  name: z.string().trim().min(1).max(150),
  slug: z.string().trim().min(1).max(150).optional(),
  imageUrl: z.string().trim().url().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

async function assertCategorySlugAvailable(slug: string, exceptId?: string) {
  const existing = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== exceptId) throw new AppError('A category with this slug already exists', 409);
}

adminRouter.get('/categories', async (_req, res, next) => {
  try {
    const items = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { tours: true } } } });
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
});

adminRouter.post('/categories', async (req: AuthRequest, res, next) => {
  try {
    const data = categoryMutationSchema.parse(req.body);
    const slug = normalizeSlug(data.slug || data.name);
    await assertCategorySlugAvailable(slug);
    const category = await prisma.category.create({ data: { ...data, slug } });
    await invalidateCache('tours:*');
    await writeAudit(req, 'CATEGORY_CREATED', 'Category', category.id, { name: category.name });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.patch('/categories/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = categoryMutationSchema.partial().parse(req.body);
    const slug = data.slug != null ? normalizeSlug(data.slug) : undefined;
    if (slug) await assertCategorySlugAvailable(slug, req.params.id);
    const category = await prisma.category.update({ where: { id: req.params.id }, data: { ...data, ...(slug ? { slug } : {}) } });
    await invalidateCache('tours:*');
    await writeAudit(req, 'CATEGORY_UPDATED', 'Category', category.id, { name: category.name });
    res.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.delete('/categories/:id', async (req: AuthRequest, res, next) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id }, include: { _count: { select: { tours: true } } } });
    if (!category) throw new AppError('Category not found', 404);
    if (category._count.tours > 0) {
      throw new AppError(`This category still has ${category._count.tours} tour(s). Reassign or delete them first.`, 409);
    }
    await prisma.category.delete({ where: { id: category.id } });
    await invalidateCache('tours:*');
    await writeAudit(req, 'CATEGORY_DELETED', 'Category', category.id, { name: category.name });
    res.json({ success: true, data: category });
  } catch (error) { next(error); }
});

// =================== BOOKINGS ===================

const bookingListQuery = paginationSchema.extend({
  search: z.string().trim().max(100).optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  paymentStatus: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  tourId: z.string().uuid().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});

function bookingWhere(query: z.infer<typeof bookingListQuery>): Prisma.BookingWhereInput {
  return {
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentStatus ? { payment: { status: query.paymentStatus } } : {}),
    ...(query.tourId ? { tourId: query.tourId } : {}),
    ...(query.from || query.to ? { date: { ...(query.from ? { gte: new Date(`${query.from}T00:00:00.000Z`) } : {}), ...(query.to ? { lte: new Date(`${query.to}T00:00:00.000Z`) } : {}) } } : {}),
    ...(query.search ? { OR: [
      { bookingNumber: { contains: query.search, mode: 'insensitive' } },
      { guestName: { contains: query.search, mode: 'insensitive' } },
      { guestEmail: { contains: query.search, mode: 'insensitive' } },
      { guestPhone: { contains: query.search, mode: 'insensitive' } },
      { hotelName: { contains: query.search, mode: 'insensitive' } },
      { tour: { title: { contains: query.search, mode: 'insensitive' } } },
    ] } : {}),
  };
}

const bookingInclude = {
  tour: { select: { id: true, title: true, category: true, startTime: true } },
  user: { select: { id: true, name: true, email: true, phone: true } },
  payment: true,
  promoCode: { select: { code: true, type: true, value: true } },
  statusHistory: { orderBy: { createdAt: 'asc' as const }, include: { changedBy: { select: { name: true, email: true } } } },
} as const;

adminRouter.get('/bookings', async (req, res, next) => {
  try {
    const query = bookingListQuery.parse(req.query);
    const where = bookingWhere(query);
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({ where, include: bookingInclude, orderBy: { createdAt: query.sort === 'newest' ? 'desc' : 'asc' }, skip: (query.page - 1) * query.limit, take: query.limit }),
      prisma.booking.count({ where }),
    ]);
    res.json({ success: true, data: bookings, pagination: pagination(query.page, query.limit, total) });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.get('/bookings/export.csv', async (req, res, next) => {
  try {
    const query = bookingListQuery.omit({ page: true, limit: true }).parse(req.query);
    const bookings = await prisma.booking.findMany({ where: bookingWhere({ ...query, page: 1, limit: 100 } as any), include: bookingInclude, orderBy: { createdAt: query.sort === 'newest' ? 'desc' : 'asc' }, take: 10000 });
    const header = ['Booking number', 'Created', 'Tour', 'Tour date', 'Guest', 'Email', 'Phone', 'Hotel name', 'Guests', 'Private', 'Subtotal', 'Discount', 'Total', 'Currency', 'Promo', 'Payment provider', 'Payment status', 'Booking status', 'Notes', 'Admin note'];
    const lines = [header, ...bookings.map((booking) => [booking.bookingNumber, booking.createdAt.toISOString(), booking.tour.title, booking.date.toISOString().slice(0, 10), booking.guestName, booking.guestEmail, booking.guestPhone, booking.hotelName, booking.adults + booking.children, booking.isPrivate, booking.subtotal, booking.discountAmount, booking.totalPrice, booking.currency, booking.promoCode?.code, booking.payment?.provider, booking.payment?.status, booking.status, booking.notes, booking.adminNote])];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="bookings-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('\uFEFF' + lines.map((line) => line.map(csvCell).join(',')).join('\r\n'));
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.get('/bookings/:id', async (req, res, next) => {
  try {
    const booking = await prisma.booking.findFirst({ where: { OR: [{ id: req.params.id }, { bookingNumber: req.params.id }] }, include: bookingInclude });
    if (!booking) throw new AppError('Booking not found', 404);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/bookings/:id/status', async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ status: z.nativeEnum(BookingStatus), note: z.string().max(1000).optional() }).parse(req.body);
    const booking = await prisma.$transaction((tx) => transitionBookingStatus(tx, req.params.id, data.status, { changedById: req.user!.id, note: data.note || 'Changed by admin' }));
    await invalidateCache(`availability:${booking.tourId}:*`);
    await writeAudit(req, 'BOOKING_STATUS_CHANGED', 'Booking', booking.id, { status: data.status, note: data.note });
    res.json({ success: true, data: booking });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.patch('/bookings/:id/note', async (req: AuthRequest, res, next) => {
  try {
    const { adminNote } = z.object({ adminNote: z.string().max(3000).nullable() }).parse(req.body);
    const booking = await prisma.booking.update({ where: { id: req.params.id }, data: { adminNote } });
    await writeAudit(req, 'BOOKING_ADMIN_NOTE_UPDATED', 'Booking', booking.id);
    res.json({ success: true, data: booking });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

// =================== AVAILABILITY ===================

const availabilitySchema = z.object({
  tourId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  seatsAvailable: z.number().int().min(0),
  seatsTotal: z.number().int().min(1),
  priceOverride: z.number().positive().nullable().optional(),
  isBlocked: z.boolean().default(false),
});

function dateKey(date: Date) { return date.toISOString().slice(0, 10); }
function eachDay(from: Date, to: Date) {
  const values: Date[] = [];
  for (let date = new Date(from); date <= to; date.setUTCDate(date.getUTCDate() + 1)) values.push(new Date(date));
  return values;
}

async function soldGuests(tourId: string, date: Date) {
  const result = await prisma.booking.aggregate({ where: { tourId, date, status: { in: activeBookingStatuses } }, _sum: { adults: true, children: true } });
  return (result._sum.adults || 0) + (result._sum.children || 0);
}

adminRouter.post('/availability', async (req: AuthRequest, res, next) => {
  try {
    const data = availabilitySchema.parse(req.body);
    const date = new Date(`${data.date}T00:00:00.000Z`);
    const sold = await soldGuests(data.tourId, date);
    if (data.seatsTotal < sold) throw new AppError(`Capacity cannot be lower than ${sold} already-booked guests`, 409);
    if (data.seatsAvailable > data.seatsTotal - sold) throw new AppError(`Seats left cannot exceed ${data.seatsTotal - sold} after existing bookings`, 409);
    const row = await prisma.availability.upsert({
      where: { tourId_date: { tourId: data.tourId, date } },
      create: { ...data, date, priceOverride: data.priceOverride ?? null },
      update: { seatsAvailable: data.seatsAvailable, seatsTotal: data.seatsTotal, priceOverride: data.priceOverride ?? null, isBlocked: data.isBlocked },
    });
    await invalidateCache(`availability:${data.tourId}:*`);
    await writeAudit(req, 'AVAILABILITY_UPDATED', 'Availability', row.id, { date: data.date, sold });
    res.json({ success: true, data: row });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.post('/availability/bulk', async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      tourId: z.string().uuid(), startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      seatsTotal: z.number().int().min(1), priceOverride: z.number().positive().nullable().optional(), isBlocked: z.boolean().optional(),
      excludeDays: z.array(z.number().int().min(0).max(6)).max(7).default([]),
    }).parse(req.body);
    const start = new Date(`${data.startDate}T00:00:00.000Z`);
    const end = new Date(`${data.endDate}T00:00:00.000Z`);
    if (end < start) throw new AppError('End date must be on or after start date', 400);
    if ((end.getTime() - start.getTime()) / 86400000 > 365) throw new AppError('Date range cannot exceed 365 days', 400);
    const dates = eachDay(start, end).filter((date) => !data.excludeDays.includes(date.getUTCDay()));
    const bookings = await prisma.booking.groupBy({
      by: ['date'], where: { tourId: data.tourId, date: { in: dates }, status: { in: activeBookingStatuses } }, _sum: { adults: true, children: true },
    });
    const soldByDate = new Map(bookings.map((row) => [dateKey(row.date), (row._sum.adults || 0) + (row._sum.children || 0)]));
    const invalid = dates.find((date) => (soldByDate.get(dateKey(date)) || 0) > data.seatsTotal);
    if (invalid) throw new AppError(`${dateKey(invalid)} already has more guests than the requested capacity`, 409);
    await prisma.$transaction(dates.map((date) => {
      const sold = soldByDate.get(dateKey(date)) || 0;
      return prisma.availability.upsert({
        where: { tourId_date: { tourId: data.tourId, date } },
        create: { tourId: data.tourId, date, seatsTotal: data.seatsTotal, seatsAvailable: data.seatsTotal - sold, priceOverride: data.priceOverride ?? null, isBlocked: data.isBlocked ?? false },
        update: { seatsTotal: data.seatsTotal, seatsAvailable: data.seatsTotal - sold, ...(data.priceOverride !== undefined ? { priceOverride: data.priceOverride } : {}), ...(data.isBlocked !== undefined ? { isBlocked: data.isBlocked } : {}) },
      });
    }));
    await invalidateCache(`availability:${data.tourId}:*`);
    await writeAudit(req, 'AVAILABILITY_BULK_UPDATED', 'Tour', data.tourId, { startDate: data.startDate, endDate: data.endDate, count: dates.length, excludeDays: data.excludeDays });
    res.json({ success: true, data: { count: dates.length }, count: dates.length });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

type DayStatus = 'missing' | 'blocked' | 'soldOut' | 'low' | 'open';
function classify(row: { seatsAvailable: number; seatsTotal: number; isBlocked: boolean } | undefined): DayStatus {
  if (!row) return 'missing';
  if (row.isBlocked) return 'blocked';
  if (row.seatsAvailable <= 0) return 'soldOut';
  if (row.seatsAvailable / Math.max(row.seatsTotal, 1) <= 0.2) return 'low';
  return 'open';
}
const rangeSchema = z.object({ from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), days: z.coerce.number().int().min(1).max(365).default(60) });
function resolveRange(query: unknown) {
  const parsed = rangeSchema.parse(query);
  const from = new Date(`${parsed.from || new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
  const to = parsed.to ? new Date(`${parsed.to}T00:00:00.000Z`) : new Date(from.getTime() + (parsed.days - 1) * 86400000);
  if (to < from) throw new AppError('End date must be on or after start date', 400);
  return { from, to };
}

adminRouter.get('/availability', async (req, res, next) => {
  try {
    const tourId = z.string().uuid().parse(req.query.tourId);
    const { from, to } = resolveRange(req.query);
    const tour = await prisma.tour.findUnique({ where: { id: tourId }, select: { id: true, title: true, basePrice: true, discountedPrice: true, currency: true, maxCapacity: true, defaultCapacity: true, isActive: true } });
    if (!tour) throw new AppError('Tour not found', 404);
    const [rows, bookings] = await Promise.all([
      prisma.availability.findMany({ where: { tourId, date: { gte: from, lte: to } }, orderBy: { date: 'asc' } }),
      prisma.booking.groupBy({ by: ['date'], where: { tourId, date: { gte: from, lte: to }, status: { in: activeBookingStatuses } }, _count: { _all: true }, _sum: { adults: true, children: true } }),
    ]);
    const rowMap = new Map(rows.map((row) => [dateKey(row.date), row]));
    const bookingMap = new Map(bookings.map((row) => [dateKey(row.date), { count: row._count._all, guests: (row._sum.adults || 0) + (row._sum.children || 0) }]));
    const summary: Record<DayStatus, number> = { missing: 0, blocked: 0, soldOut: 0, low: 0, open: 0 };
    const days = eachDay(from, to).map((dateValue) => {
      const key = dateKey(dateValue); const row = rowMap.get(key); const status = classify(row); const sold = bookingMap.get(key); summary[status]++;
      return { date: key, status, seatsAvailable: row?.seatsAvailable ?? null, seatsTotal: row?.seatsTotal ?? null, soldSeats: sold?.guests ?? 0, priceOverride: row?.priceOverride ?? null, isBlocked: row?.isBlocked ?? false, bookings: sold?.count ?? 0, guests: sold?.guests ?? 0 };
    });
    res.json({ success: true, data: { tour, from: dateKey(from), to: dateKey(to), days, summary } });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError('A valid tourId is required', 400));
    next(error);
  }
});

adminRouter.get('/availability/gaps', async (req, res, next) => {
  try {
    const { from, to } = resolveRange(req.query); const dates = eachDay(from, to);
    const tours = await prisma.tour.findMany({ where: { isActive: true, deletedAt: null }, select: { id: true, title: true, category: true, basePrice: true, currency: true }, orderBy: { sortOrder: 'asc' } });
    const rows = await prisma.availability.findMany({ where: { tourId: { in: tours.map((tour) => tour.id) }, date: { gte: from, lte: to } } });
    const byTour = new Map<string, Map<string, typeof rows[number]>>();
    for (const row of rows) { if (!byTour.has(row.tourId)) byTour.set(row.tourId, new Map()); byTour.get(row.tourId)!.set(dateKey(row.date), row); }
    const report = tours.map((tour) => {
      const counts: Record<DayStatus, number> = { missing: 0, blocked: 0, soldOut: 0, low: 0, open: 0 }; let firstGap: string | null = null;
      for (const date of dates) { const key = dateKey(date); const status = classify(byTour.get(tour.id)?.get(key)); counts[status]++; if (!firstGap && ['missing', 'blocked', 'soldOut'].includes(status)) firstGap = key; }
      return { ...tour, ...counts, firstGap, unsellable: counts.missing + counts.blocked + counts.soldOut };
    }).sort((a, b) => b.unsellable - a.unsellable);
    res.json({ success: true, data: { from: dateKey(from), to: dateKey(to), totalDays: dates.length, tours: report, toursWithGaps: report.filter((tour) => tour.unsellable > 0).length } });
  } catch (error) { next(error); }
});

// =================== PAYMENTS ===================

adminRouter.get('/payments', async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const status = z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional().parse(req.query.status);
    const provider = z.enum(['STRIPE', 'IYZICO']).optional().parse(req.query.provider);
    const search = z.string().trim().max(100).optional().parse(req.query.search);
    const where: Prisma.PaymentWhereInput = { ...(status ? { status } : {}), ...(provider ? { provider } : {}), ...(search ? { OR: [
      { providerPaymentId: { contains: search, mode: 'insensitive' } }, { booking: { bookingNumber: { contains: search, mode: 'insensitive' } } }, { booking: { guestEmail: { contains: search, mode: 'insensitive' } } },
    ] } : {}) };
    const [payments, total, totals] = await Promise.all([
      prisma.payment.findMany({ where, include: { booking: { select: { id: true, bookingNumber: true, date: true, guestName: true, guestEmail: true, tour: { select: { title: true, category: true } }, user: { select: { name: true, email: true } } } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({ where: { ...where, status: 'COMPLETED' }, _sum: { amount: true } }),
    ]);
    res.json({ success: true, data: payments, pagination: pagination(page, limit, total), totalCompleted: totals._sum.amount || 0 });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

// =================== CUSTOMERS ===================

adminRouter.get('/customers', async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const search = z.string().trim().max(100).optional().parse(req.query.search)?.toLowerCase();
    const [users, guestRows] = await Promise.all([
      prisma.user.findMany({ where: { role: 'USER', ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { phone: { contains: search, mode: 'insensitive' } }] } : {}) }, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, _count: { select: { bookings: true } } } }),
      prisma.booking.groupBy({ by: ['guestEmail', 'guestName', 'guestPhone'], where: { userId: null, ...(search ? { OR: [{ guestName: { contains: search, mode: 'insensitive' } }, { guestEmail: { contains: search, mode: 'insensitive' } }, { guestPhone: { contains: search, mode: 'insensitive' } }] } : {}) }, _count: { _all: true }, _min: { createdAt: true } }),
    ]);
    const customers = [
      ...users.map((user) => ({ ...user, source: 'USER', bookings: user._count.bookings })),
      ...guestRows.map((guest) => ({ id: `guest:${guest.guestEmail}`, name: guest.guestName, email: guest.guestEmail, phone: guest.guestPhone, role: 'GUEST', createdAt: guest._min.createdAt, source: 'GUEST', bookings: guest._count._all, _count: { bookings: guest._count._all } })),
    ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    const total = customers.length;
    res.json({ success: true, data: customers.slice((page - 1) * limit, page * limit), pagination: pagination(page, limit, total) });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.get('/customers/detail', async (req, res, next) => {
  try {
    const email = z.string().email().parse(req.query.email);
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true, phone: true, createdAt: true } });
    const bookings = await prisma.booking.findMany({ where: { OR: [{ userId: user?.id }, { guestEmail: { equals: email, mode: 'insensitive' } }] }, include: { tour: { select: { title: true } }, payment: true }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { customer: user || { email, source: 'GUEST' }, bookings } });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError('A valid customer email is required', 400));
    next(error);
  }
});

// =================== PROMO CODES ===================

const promoBaseSchema = z.object({
  code: z.string().trim().toUpperCase().min(2).max(40), type: z.enum(['PERCENT', 'FIXED']), value: z.number().positive(),
  isActive: z.boolean().default(true), startsAt: z.string().datetime().nullable().optional(), endsAt: z.string().datetime().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(), minCartTotal: z.number().nonnegative().nullable().optional(), currency: z.string().length(3).nullable().optional(),
  validTourIds: z.array(z.string().uuid()).max(200).default([]),
});
const promoSchema = promoBaseSchema.superRefine((data, ctx) => {
  if (data.type === 'PERCENT' && data.value > 100) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value'], message: 'Percentage cannot exceed 100' });
  if (data.startsAt && data.endsAt && data.endsAt < data.startsAt) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endsAt'], message: 'End date must follow start date' });
});

adminRouter.get('/promo-codes', async (_req, res, next) => {
  try { res.json({ success: true, data: await prisma.promoCode.findMany({ include: { tours: { select: { id: true, title: true } } }, orderBy: { createdAt: 'desc' } }) }); }
  catch (error) { next(error); }
});

adminRouter.post('/promo-codes', async (req: AuthRequest, res, next) => {
  try {
    const data = promoSchema.parse(req.body);
    const promo = await prisma.promoCode.create({ data: { code: data.code, type: data.type, value: data.value, isActive: data.isActive, startsAt: data.startsAt ? new Date(data.startsAt) : null, endsAt: data.endsAt ? new Date(data.endsAt) : null, maxUses: data.maxUses, minCartTotal: data.minCartTotal, currency: data.currency?.toUpperCase(), tours: { connect: data.validTourIds.map((id) => ({ id })) } }, include: { tours: { select: { id: true, title: true } } } });
    await writeAudit(req, 'PROMO_CREATED', 'PromoCode', promo.id, { code: promo.code });
    res.status(201).json({ success: true, data: promo });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.patch('/promo-codes/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = promoBaseSchema.partial().parse(req.body);
    if (data.type === 'PERCENT' && data.value !== undefined && data.value > 100) throw new AppError('Percentage cannot exceed 100', 400);
    const promo = await prisma.promoCode.update({ where: { id: req.params.id }, data: { ...data, startsAt: data.startsAt ? new Date(data.startsAt) : data.startsAt, endsAt: data.endsAt ? new Date(data.endsAt) : data.endsAt, currency: data.currency?.toUpperCase(), validTourIds: undefined, ...(data.validTourIds ? { tours: { set: data.validTourIds.map((id) => ({ id })) } } : {}) } as any, include: { tours: { select: { id: true, title: true } } } });
    await writeAudit(req, 'PROMO_UPDATED', 'PromoCode', promo.id, { code: promo.code });
    res.json({ success: true, data: promo });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

// =================== LEGAL PAGES ===================

const legalSectionSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().nullable().optional(),
  list: z.array(z.string().trim().min(1)).max(50).optional(),
  table: z
    .object({
      head: z.array(z.string().trim().max(200)).max(10),
      rows: z.array(z.array(z.string().trim().max(500)).max(10)).max(100),
    })
    .optional(),
  footnote: z.string().trim().nullable().optional(),
});

const legalPageMutationSchema = z.object({
  title: z.string().trim().min(1).max(200),
  intro: z.string().trim().min(1),
  sections: z.array(legalSectionSchema).min(1).max(50),
});

adminRouter.get('/legal', async (_req, res, next) => {
  try {
    const pages = await prisma.legalPage.findMany({ orderBy: { slug: 'asc' } });
    res.json({ success: true, data: pages });
  } catch (error) { next(error); }
});

adminRouter.get('/legal/:slug', async (req, res, next) => {
  try {
    const page = await prisma.legalPage.findUnique({ where: { slug: req.params.slug } });
    if (!page) throw new AppError('Legal page not found', 404);
    res.json({ success: true, data: page });
  } catch (error) { next(error); }
});

adminRouter.put('/legal/:slug', async (req: AuthRequest, res, next) => {
  try {
    const data = legalPageMutationSchema.parse(req.body);
    const page = await prisma.legalPage.upsert({
      where: { slug: req.params.slug },
      update: { title: data.title, intro: data.intro, sections: data.sections as any },
      create: { slug: req.params.slug, title: data.title, intro: data.intro, sections: data.sections as any },
    });
    await invalidateCache(`legal:${req.params.slug}`);
    await writeAudit(req, 'LEGAL_PAGE_UPDATED', 'LegalPage', page.id, { slug: page.slug });
    res.json({ success: true, data: page });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

// =================== FAQ ===================

const faqMutationSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

adminRouter.get('/faqs', async (req, res, next) => {
  try {
    const locale = normalizeLocale(req.query.locale as string | undefined);
    const items = await prisma.faq.findMany({ where: { locale }, orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
});

adminRouter.post('/faqs', async (req: AuthRequest, res, next) => {
  try {
    const data = faqMutationSchema.parse(req.body);
    const faq = await prisma.faq.create({ data });
    await invalidateCache(`faqs:${data.locale}`);
    await writeAudit(req, 'FAQ_CREATED', 'Faq', faq.id, { locale: faq.locale });
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.patch('/faqs/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = faqMutationSchema.partial().parse(req.body);
    const faq = await prisma.faq.update({ where: { id: req.params.id }, data });
    await invalidateCache(`faqs:${faq.locale}`);
    await writeAudit(req, 'FAQ_UPDATED', 'Faq', faq.id, { locale: faq.locale });
    res.json({ success: true, data: faq });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.delete('/faqs/:id', async (req: AuthRequest, res, next) => {
  try {
    const faq = await prisma.faq.delete({ where: { id: req.params.id } });
    await invalidateCache(`faqs:${faq.locale}`);
    await writeAudit(req, 'FAQ_DELETED', 'Faq', faq.id, { locale: faq.locale });
    res.json({ success: true, data: faq });
  } catch (error) { next(error); }
});

// =================== PARTNERS ===================

const partnerMutationSchema = z.object({
  name: z.string().trim().min(1).max(150),
  logoUrl: z.string().trim().url(),
  websiteUrl: z.string().trim().url().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

adminRouter.get('/partners', async (_req, res, next) => {
  try {
    const items = await prisma.partner.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
});

adminRouter.post('/partners', async (req: AuthRequest, res, next) => {
  try {
    const data = partnerMutationSchema.parse(req.body);
    const partner = await prisma.partner.create({ data });
    await invalidateCache('partners');
    await writeAudit(req, 'PARTNER_CREATED', 'Partner', partner.id, { name: partner.name });
    res.status(201).json({ success: true, data: partner });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.patch('/partners/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = partnerMutationSchema.partial().parse(req.body);
    const partner = await prisma.partner.update({ where: { id: req.params.id }, data });
    await invalidateCache('partners');
    await writeAudit(req, 'PARTNER_UPDATED', 'Partner', partner.id, { name: partner.name });
    res.json({ success: true, data: partner });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.delete('/partners/:id', async (req: AuthRequest, res, next) => {
  try {
    const partner = await prisma.partner.delete({ where: { id: req.params.id } });
    await invalidateCache('partners');
    await writeAudit(req, 'PARTNER_DELETED', 'Partner', partner.id, { name: partner.name });
    res.json({ success: true, data: partner });
  } catch (error) { next(error); }
});

// =================== TESTIMONIALS ===================

const testimonialMutationSchema = z.object({
  authorName: z.string().trim().min(1).max(150),
  authorLocation: z.string().trim().max(150).nullable().optional(),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  quote: z.string().trim().min(1).max(2000),
  tourName: z.string().trim().max(150).nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

adminRouter.get('/testimonials', async (_req, res, next) => {
  try {
    const items = await prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
});

adminRouter.post('/testimonials', async (req: AuthRequest, res, next) => {
  try {
    const data = testimonialMutationSchema.parse(req.body);
    const testimonial = await prisma.testimonial.create({ data });
    await invalidateCache('testimonials');
    await writeAudit(req, 'TESTIMONIAL_CREATED', 'Testimonial', testimonial.id, { authorName: testimonial.authorName });
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.patch('/testimonials/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = testimonialMutationSchema.partial().parse(req.body);
    const testimonial = await prisma.testimonial.update({ where: { id: req.params.id }, data });
    await invalidateCache('testimonials');
    await writeAudit(req, 'TESTIMONIAL_UPDATED', 'Testimonial', testimonial.id, { authorName: testimonial.authorName });
    res.json({ success: true, data: testimonial });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.delete('/testimonials/:id', async (req: AuthRequest, res, next) => {
  try {
    const testimonial = await prisma.testimonial.delete({ where: { id: req.params.id } });
    await invalidateCache('testimonials');
    await writeAudit(req, 'TESTIMONIAL_DELETED', 'Testimonial', testimonial.id, { authorName: testimonial.authorName });
    res.json({ success: true, data: testimonial });
  } catch (error) { next(error); }
});

// =================== SITE SETTINGS ===================

const settingsMutationSchema = z.object({
  instagramUrl: z.string().trim().url().nullable().optional(),
});

adminRouter.get('/settings', async (_req, res, next) => {
  try {
    const settings = await prisma.siteSettings.upsert({ where: { id: 'singleton' }, create: { id: 'singleton' }, update: {} });
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
});

adminRouter.patch('/settings', async (req: AuthRequest, res, next) => {
  try {
    const data = settingsMutationSchema.parse(req.body);
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data },
      update: data,
    });
    await invalidateCache('settings:public');
    await writeAudit(req, 'SETTINGS_UPDATED', 'SiteSettings', settings.id, data);
    res.json({ success: true, data: settings });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminRouter.get('/audit-logs', async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ include: { actor: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.auditLog.count(),
    ]);
    res.json({ success: true, data: logs, pagination: pagination(page, limit, total) });
  } catch (error) { next(error); }
});
