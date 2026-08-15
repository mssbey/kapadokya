import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getCached } from '../lib/redis';

export const testimonialRouter = Router();

testimonialRouter.get('/', async (_req, res, next) => {
  try {
    const items = await getCached('testimonials', 60, () =>
      prisma.testimonial.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, authorName: true, authorLocation: true, rating: true, quote: true, tourName: true },
      }),
    );
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
});
