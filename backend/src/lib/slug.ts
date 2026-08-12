import { prisma } from './prisma';
import { AppError } from '../middleware/errorHandler';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function assertSlugAvailable(slug: string, exceptTourId?: string) {
  if (!SLUG_PATTERN.test(slug)) throw new AppError('Slug must contain lowercase letters, numbers and single hyphens only', 400);
  const [tour, alias] = await Promise.all([
    prisma.tour.findUnique({ where: { slug }, select: { id: true } }),
    prisma.tourSlugAlias.findUnique({ where: { slug }, select: { tourId: true } }),
  ]);
  if ((tour && tour.id !== exceptTourId) || (alias && alias.tourId !== exceptTourId)) {
    throw new AppError('Slug is already in use', 409);
  }
}

