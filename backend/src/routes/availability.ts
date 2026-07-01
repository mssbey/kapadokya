import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getCached } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';

export const availabilityRouter = Router();

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
