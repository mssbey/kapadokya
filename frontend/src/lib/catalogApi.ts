import type { Tour } from '@/types';
import type { Locale } from '@/lib/i18n';

function apiBaseUrl(): string {
  const configured = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || '/api';
  if (/^https?:\/\//i.test(configured)) return configured.replace(/\/$/, '');
  // Same-origin API (Vercel rewrites route /api to the backend service, or
  // NEXT_PUBLIC_API_URL/API_INTERNAL_URL is a relative path): server-side
  // fetch needs an absolute URL, so resolve it against the deployment's own
  // host. VERCEL_URL is set automatically on every Vercel deployment.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return `${siteUrl.replace(/\/$/, '')}/${configured.replace(/^\//, '')}`;
}

type ApiEnvelope<T> = { success: boolean; data: T; meta?: Record<string, unknown> };

async function request<T>(path: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers || {}) },
    next: { revalidate: 60 },
  });
  if (!response.ok) throw new Error(`Catalog API returned ${response.status}`);
  return response.json();
}

export async function getPublicTours(locale: Locale, options: { featured?: boolean; category?: string; q?: string } = {}): Promise<Tour[]> {
  const params = new URLSearchParams({ locale });
  if (options.featured) params.set('featured', 'true');
  if (options.category) params.set('category', options.category);
  if (options.q) params.set('q', options.q);
  return (await request<Tour[]>(`/tours?${params}`)).data;
}

export async function getPublicTour(slug: string, locale: Locale) {
  return request<Tour>(`/tours/${encodeURIComponent(slug)}?locale=${locale}`);
}

export function categoryLabel(category: Tour['category'], locale: Locale): string {
  const labels: Record<Locale, Record<Tour['category'], string>> = {
    en: { BALLOON: 'Balloon', DAILY_TOUR: 'Daily Tour', ADVENTURE: 'Adventure', TRANSFER: 'Transfer' },
    tr: { BALLOON: 'Balon', DAILY_TOUR: 'Günlük Tur', ADVENTURE: 'Macera', TRANSFER: 'Transfer' },
    es: { BALLOON: 'Globo', DAILY_TOUR: 'Tour diario', ADVENTURE: 'Aventura', TRANSFER: 'Traslado' },
    it: { BALLOON: 'Mongolfiera', DAILY_TOUR: 'Tour giornaliero', ADVENTURE: 'Avventura', TRANSFER: 'Transfer' },
    ru: { BALLOON: 'Воздушный шар', DAILY_TOUR: 'Однодневный тур', ADVENTURE: 'Приключение', TRANSFER: 'Трансфер' },
  };
  return labels[locale][category] || category;
}
