import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getCached } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';

export const legalRouter = Router();

legalRouter.get('/:slug', async (req, res, next) => {
  try {
    const page = await getCached(`legal:${req.params.slug}`, 60, () =>
      prisma.legalPage.findUnique({ where: { slug: req.params.slug } }),
    );
    if (!page) throw new AppError('Legal page not found', 404);
    res.json({ success: true, data: page });
  } catch (error) { next(error); }
});
