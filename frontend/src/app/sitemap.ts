import type { MetadataRoute } from 'next';
import { TOUR_BASE } from '@/lib/site';
import { LOCALES, localePath } from '@/lib/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://discoverycappadocia.com';
  const paths: { path: string; priority: number }[] = [
    { path: '/', priority: 1 },
    { path: '/tours', priority: 0.9 },
    ...TOUR_BASE.map((tour) => ({ path: `/tours/${tour.slug}`, priority: 0.8 })),
  ];

  // Every page is listed once per language. The hreflang relationships are
  // declared in each page's <head> (see `languageAlternates`); Next 14.1 does
  // not emit xhtml:link alternates from the sitemap, so they are not repeated
  // here — the head tags are on their own a sufficient signal for Google.
  return paths.flatMap(({ path, priority }) =>
    LOCALES.map((locale) => ({
      url: `${base}${localePath(locale, path)}`,
      changeFrequency: 'weekly' as const,
      priority,
    })),
  );
}
