import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { getCached } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';
import { currentCatalogDate, findTourBySlug, normalizeLocale, presentTour, publicTourIncludeForDate } from '../lib/catalog';

export const tourRouter = Router();

const listQuerySchema = z.object({
  locale: z.string().optional(),
  category: z.string().trim().max(100).optional(),
  featured: z.enum(['true', 'false']).optional(),
  q: z.string().trim().max(100).optional(),
});
tourRouter.get('/', async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const locale = normalizeLocale(query.locale);
    const catalogDate = currentCatalogDate();
    const priceDay = catalogDate.toISOString().slice(0, 10);
    const cacheKey = `tours:public:${priceDay}:${locale}:${query.category || 'all'}:${query.featured || 'all'}:${query.q || ''}`;
    const tours = await getCached(cacheKey, 60, () =>
      prisma.tour.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          ...(query.category ? { category: { slug: query.category } } : {}),
          ...(query.featured === 'true' ? { isFeatured: true } : {}),
          ...(query.q
            ? {
                OR: [
                  { slug: { contains: query.q, mode: 'insensitive' } },
                  { translations: { some: { locale: { in: [locale, 'en'] }, OR: [
                    { title: { contains: query.q, mode: 'insensitive' } },
                    { shortDesc: { contains: query.q, mode: 'insensitive' } },
                    { description: { contains: query.q, mode: 'insensitive' } },
                  ] } } },
                ],
              }
            : {}),
        },
        include: publicTourIncludeForDate(catalogDate),
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
    );
    res.json({ success: true, data: tours.map((tour) => presentTour(tour, locale)) });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

// Static routes must stay above /:slug so Express cannot treat "category" or
// "categories" as a slug.
tourRouter.get('/categories', async (_req, res, next) => {
  try {
    const categories = await getCached('tours:categories', 60, () =>
      prisma.category.findMany({
        where: { isActive: true, tours: { some: { isActive: true, deletedAt: null } } },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, slug: true, name: true, imageUrl: true },
      }),
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

tourRouter.get('/category/:category', async (req, res, next) => {
  try {
    const categorySlug = z.string().trim().min(1).max(100).parse(req.params.category.toLowerCase());
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) throw new AppError('Category not found', 404);
    const locale = normalizeLocale(req.query.locale);
    const catalogDate = currentCatalogDate();
    const priceDay = catalogDate.toISOString().slice(0, 10);
    const tours = await getCached(`tours:category:${priceDay}:${categorySlug}:${locale}`, 60, () =>
      prisma.tour.findMany({
        where: { isActive: true, deletedAt: null, categoryId: category.id },
        include: publicTourIncludeForDate(catalogDate),
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
    );
    res.json({ success: true, data: tours.map((tour) => presentTour(tour, locale)) });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError('Invalid tour category', 400));
    next(error);
  }
});

tourRouter.get('/:slug', async (req, res, next) => {
  try {
    const locale = normalizeLocale(req.query.locale);
    const result = await findTourBySlug(req.params.slug);
    if (!result || !result.tour.isActive) throw new AppError('Tour not found', 404);
    const data = presentTour(result.tour, locale);
    res.json({
      success: true,
      data,
      meta: {
        canonicalSlug: result.tour.slug,
        redirectedFrom: result.redirectedFrom,
        translationFallback: data.contentLocale !== locale,
      },
    });
  } catch (error) {
    next(error);
  }
});
