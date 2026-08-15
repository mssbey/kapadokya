import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getCached } from '../lib/redis';
import { normalizeLocale } from '../lib/catalog';

export const faqRouter = Router();

faqRouter.get('/', async (req, res, next) => {
  try {
    const locale = normalizeLocale(req.query.locale as string | undefined);
    const items = await getCached(`faqs:${locale}`, 60, () =>
      prisma.faq.findMany({
        where: { locale, isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, question: true, answer: true },
      }),
    );
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
});
