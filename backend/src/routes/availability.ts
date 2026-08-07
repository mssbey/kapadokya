import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getCached } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';

export const availabilityRouter = Router();

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
    res.json({ success: true, data: rows });
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

    const availability = await getCached(cacheKey, 60, () =>
      prisma.availability.findMany({
        where: {
          tourId,
          date: {
            gte: startDate,
            lte: endDate,
          },
          isBlocked: false,
        },
        orderBy: { date: 'asc' },
      })
    );

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

    res.json({
      success: true,
      data: {
        available: availability.seatsAvailable > 0,
        seatsAvailable: availability.seatsAvailable,
        seatsTotal: availability.seatsTotal,
        priceOverride: availability.priceOverride,
      },
    });
  } catch (err) {
    next(err);
  }
});
