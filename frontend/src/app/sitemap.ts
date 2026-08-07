import type { MetadataRoute } from 'next';
import { CATALOG } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://discoverycappadocia.com';
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/tours`, changeFrequency: 'weekly', priority: .9 },
    ...CATALOG.map((tour) => ({ url: `${base}/tours/${tour.slug}`, changeFrequency: 'weekly' as const, priority: .8 })),
  ];
}

