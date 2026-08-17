import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getCached } from '../lib/redis';

export const settingsRouter = Router();

settingsRouter.get('/', async (_req, res, next) => {
  try {
    const settings = await getCached('settings:public', 60, () =>
      prisma.siteSettings.findUnique({ where: { id: 'singleton' }, select: { instagramUrl: true } }),
    );
    res.json({ success: true, data: settings || { instagramUrl: null } });
  } catch (error) {
    next(error);
  }
});
