import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getCached } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';

export const tourRouter = Router();

// Get all active tours
tourRouter.get('/', async (_req, res, next) => {
  try {
    const tours = await getCached('tours:active', 300, () =>
      prisma.tour.findMany({
        where: { isActive: true },
        include: {
          upsells: { where: { isActive: true } },
        },
        orderBy: { sortOrder: 'asc' },
      })
    );

    res.json({ success: true, data: tours });
  } catch (err) {
    next(err);
  }
});

// Get tour by slug
tourRouter.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const tour = await getCached(`tour:${slug}`, 300, () =>
      prisma.tour.findUnique({
        where: { slug },
        include: {
          upsells: { where: { isActive: true } },
          availabilities: {
            where: {
              date: { gte: new Date() },
              isBlocked: false,
            },
            orderBy: { date: 'asc' },
            take: 90,
          },
        },
      })
    );

    if (!tour) {
      throw new AppError('Tour not found', 404);
    }

    res.json({ success: true, data: tour });
  } catch (err) {
    next(err);
  }
});

// Get tours by category
tourRouter.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;

    const tours = await getCached(`tours:category:${category}`, 300, () =>
      prisma.tour.findMany({
        where: {
          isActive: true,
          category: category.toUpperCase() as any,
        },
        include: {
          upsells: { where: { isActive: true } },
        },
        orderBy: { sortOrder: 'asc' },
      })
    );

    res.json({ success: true, data: tours });
  } catch (err) {
    next(err);
  }
});
