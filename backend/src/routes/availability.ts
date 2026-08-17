import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getCached } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';

export const availabilityRouter = Router();

/**
 * TourScheduledPrice ("Gelecek fiyatları" in admin) is a capacity-independent
 * seasonal price layer. It only takes effect where no explicit per-day
 * Availability.priceOverride has been set — the override always wins.
 */
async function fillScheduledPrices<T extends { tourId: string; date: Date; priceOverride: number | null }>(
  rows: T[],
): Promise<T[]> {
  const missing = rows.filter((row) => row.priceOverride == null);
  if (!missing.length) return rows;
  const tourIds = [...new Set(missing.map((row) => row.tourId))];
  const dates = missing.map((row) => row.date);
  const scheduled = await prisma.tourScheduledPrice.findMany({
    where: { tourId: { in: tourIds }, date: { in: dates } },
  });
  if (!scheduled.length) return rows;
  const byKey = new Map(scheduled.map((item) => [`${item.tourId}:${item.date.toISOString()}`, item.price]));
  return rows.map((row) => {
    if (row.priceOverride != null) return row;
    const price = byKey.get(`${row.tourId}:${row.date.toISOString()}`);
    return price != null ? { ...row, priceOverride: price } : row;
  });
}

// Real today/tomorrow availability only. Admins control this through availability records.
availabilityRouter.get('/last-minute/list', async (_req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    const rows = await prisma.availability.findMany({
      where: { date: { gte: start, lt: end }, isBlocked: false, seatsAvailable: { gt: 0 }, tour: { isActive: true } },
      include: { tour: { select: { title: true, slug: true, basePrice: true, currency: true } } },
      orderBy: [{ date: 'asc' }, { seatsAvailable: 'asc' }],
      take: 6,
    });
    res.json({ success: true, data: await fillScheduledPrices(rows) });
  } catch (err) { next(err); }
});

// Get availability for a tour
availabilityRouter.get('/:tourId', async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const { month, year } = req.query;

    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0);

    if (month && year) {
      const m = parseInt(month as string) - 1;
      const y = parseInt(year as string);
      startDate = new Date(y, m, 1);
      endDate = new Date(y, m + 1, 0);
    }

    const cacheKey = `availability:${tourId}:${startDate.toISOString()}:${endDate.toISOString()}`;

    const availability = await getCached(cacheKey, 60, async () => {
      const rows = await prisma.availability.findMany({
        where: {
          tourId,
          date: {
            gte: startDate,
            lte: endDate,
          },
          isBlocked: false,
        },
        orderBy: { date: 'asc' },
      });
      return fillScheduledPrices(rows);
    });

    res.json({ success: true, data: availability });
  } catch (err) {
    next(err);
  }
});

// Check specific date availability
availabilityRouter.get('/:tourId/:date', async (req, res, next) => {
  try {
    const { tourId, date } = req.params;
    const bookingDate = new Date(date);

    if (isNaN(bookingDate.getTime())) {
      throw new AppError('Invalid date', 400);
    }

    const availability = await prisma.availability.findUnique({
      where: {
        tourId_date: {
          tourId,
          date: bookingDate,
        },
      },
    });

    if (!availability || availability.isBlocked) {
      return res.json({
        success: true,
        data: { available: false, seatsAvailable: 0 },
      });
    }

    const [withScheduledPrice] = await fillScheduledPrices([availability]);

    res.json({
      success: true,
      data: {
        available: availability.seatsAvailable > 0,
        seatsAvailable: availability.seatsAvailable,
        seatsTotal: availability.seatsTotal,
        priceOverride: withScheduledPrice.priceOverride,
      },
    });
  } catch (err) {
    next(err);
  }
});
