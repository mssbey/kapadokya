import { prisma } from './prisma';
import { Prisma } from '@prisma/client';

export const SUPPORTED_LOCALES = ['en', 'tr', 'es', 'it', 'ru'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export function normalizeLocale(value: unknown): SupportedLocale {
  return typeof value === 'string' && SUPPORTED_LOCALES.includes(value as SupportedLocale)
    ? (value as SupportedLocale)
    : DEFAULT_LOCALE;
}

export const publicTourInclude = Prisma.validator<Prisma.TourInclude>()({
  translations: true,
  media: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
  upsells: { where: { isActive: true }, orderBy: { createdAt: 'asc' } },
});

/**
 * Converts the relational tour record into the stable public API shape. The
 * selected locale falls back to English and then to the migrated legacy copy.
 */
export function presentTour(tour: any, locale: SupportedLocale) {
  const translation =
    tour.translations?.find((item: any) => item.locale === locale) ||
    tour.translations?.find((item: any) => item.locale === DEFAULT_LOCALE) ||
    tour.translations?.[0];

  const media = [...(tour.media || [])].sort((a: any, b: any) => {
    if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
  const legacyImages: string[] = Array.isArray(tour.images) ? tour.images : [];
  const images = media.length ? media.map((item: any) => item.secureUrl) : legacyImages;
  const regularPrice = tour.basePrice;
  const effectivePrice = tour.discountedPrice ?? regularPrice;

  return {
    id: tour.id,
    slug: tour.slug,
    category: tour.category,
    tourType: tour.tourType,
    title: translation?.title ?? tour.title,
    shortDesc: translation?.shortDesc ?? tour.shortDesc,
    description: translation?.description ?? tour.description,
    highlights: translation?.highlights ?? tour.highlights ?? [],
    includes: translation?.includes ?? tour.includes ?? [],
    excludes: translation?.excludes ?? tour.excludes ?? [],
    meetingPoint: translation?.meetingPoint ?? null,
    cancellationPolicy: translation?.cancellationPolicy ?? null,
    seoTitle: translation?.seoTitle ?? translation?.title ?? tour.title,
    seoDescription: translation?.seoDescription ?? translation?.shortDesc ?? tour.shortDesc,
    requestedLocale: locale,
    contentLocale: translation?.locale ?? DEFAULT_LOCALE,
    basePrice: effectivePrice,
    regularPrice,
    discountedPrice: tour.discountedPrice,
    currency: tour.currency,
    childPriceRate: tour.childPriceRate,
    privatePriceMultiplier: tour.privatePriceMultiplier,
    duration: tour.duration,
    startTime: tour.startTime,
    endTime: tour.endTime,
    maxCapacity: tour.maxCapacity,
    minParticipants: tour.minParticipants,
    defaultCapacity: tour.defaultCapacity,
    videoUrl: tour.videoUrl,
    images,
    image: images[0] ?? null,
    media,
    isActive: tour.isActive,
    isFeatured: tour.isFeatured,
    isBookingEnabled: tour.isBookingEnabled,
    sortOrder: tour.sortOrder,
    upsells: tour.upsells ?? [],
    updatedAt: tour.updatedAt,
  };
}

export async function findTourBySlug(slug: string) {
  const current = await prisma.tour.findFirst({
    where: { slug, deletedAt: null },
    include: publicTourInclude,
  });
  if (current) return { tour: current, redirectedFrom: null as string | null };

  const alias = await prisma.tourSlugAlias.findUnique({
    where: { slug },
    include: { tour: { include: publicTourInclude } },
  });
  if (!alias || alias.tour.deletedAt) return null;
  return { tour: alias.tour, redirectedFrom: slug };
}
