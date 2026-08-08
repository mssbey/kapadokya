import type { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/i18n';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://discoverycappadocia.com';
  // Private areas now live under a locale prefix, so disallow every variant.
  const privatePaths = ['/admin', '/dashboard', '/booking', '/login', '/register'];
  const disallow = privatePaths.flatMap((path) => LOCALES.map((locale) => `/${locale}${path}`));

  return {
    rules: [{ userAgent: '*', allow: '/', disallow }],
    sitemap: `${base}/sitemap.xml`,
  };
}
