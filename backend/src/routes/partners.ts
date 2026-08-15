import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getCached } from '../lib/redis';

export const partnerRouter = Router();

partnerRouter.get('/', async (_req, res, next) => {
  try {
    const items = await getCached('partners', 60, () =>
      prisma.partner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, logoUrl: true, websiteUrl: true },
      }),
    );
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
});
