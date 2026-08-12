import type { MetadataRoute } from 'next';
import { LOCALES, localePath } from '@/lib/i18n';
import { getPublicTours } from '@/lib/catalogApi';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://discoverycappadocia.com';
  let slugs: string[] = [];
  try { slugs = (await getPublicTours('en')).map((tour) => tour.slug); } catch { /* Keep core pages indexed if API is temporarily unavailable. */ }
  const paths = [
    { path: '/', priority: 1 },
    { path: '/tours', priority: 0.9 },
    ...slugs.map((slug) => ({ path: `/tours/${slug}`, priority: 0.8 })),
  ];
  return paths.flatMap(({ path, priority }) => LOCALES.map((locale) => ({ url: `${base}${localePath(locale, path)}`, changeFrequency: 'weekly' as const, priority })));
}
