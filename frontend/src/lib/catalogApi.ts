import type { Tour } from '@/types';
import type { Locale } from '@/lib/i18n';

function apiBaseUrl(): string {
  const configured = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || '/api';
  if (/^https?:\/\//i.test(configured)) return configured.replace(/\/$/, '');
  // This module is also imported by a few 'use client' components. In the
  // browser a relative path resolves fine against the current origin (and
  // server env vars like VERCEL_URL aren't inlined into the client bundle
  // anyway), so only server-side rendering needs an absolute URL.
  if (typeof window !== 'undefined') return configured;
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

export type LegalSection = {
  title: string;
  body?: string | null;
  list?: string[];
  table?: { head: string[]; rows: string[][] };
  footnote?: string | null;
};

export type LegalPage = {
  id: string;
  slug: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  updatedAt: string;
};

// Legal content is edited live from the admin panel, so this bypasses the
// shared `request()` helper's 60s ISR cache — an edit should be visible on
// the next page load, not up to a minute later.
export async function getLegalPage(slug: string): Promise<LegalPage> {
  const response = await fetch(`${apiBaseUrl()}/legal/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Legal API returned ${response.status}`);
  const envelope: ApiEnvelope<LegalPage> = await response.json();
  return envelope.data;
}

export type FaqItem = { id: string; question: string; answer: string };

// FAQ content is edited live from the admin panel, same reasoning as the
// legal pages fetch above — bypass ISR caching so edits show up immediately.
export async function getPublicFaqs(locale: Locale): Promise<FaqItem[]> {
  const response = await fetch(`${apiBaseUrl()}/faqs?locale=${locale}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`FAQ API returned ${response.status}`);
  const envelope: ApiEnvelope<FaqItem[]> = await response.json();
  return envelope.data;
}

export type Partner = { id: string; name: string; logoUrl: string; websiteUrl?: string | null };

// Partner logos are edited live from the admin panel, same reasoning as the
// legal pages and FAQ fetches above — bypass ISR caching.
export async function getPublicPartners(): Promise<Partner[]> {
  const response = await fetch(`${apiBaseUrl()}/partners`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Partners API returned ${response.status}`);
  const envelope: ApiEnvelope<Partner[]> = await response.json();
  return envelope.data;
}

export type Testimonial = { id: string; authorName: string; authorLocation?: string | null; rating: number; quote: string; tourName?: string | null };

// Testimonials are edited live from the admin panel, same reasoning as the
// legal pages, FAQ and partners fetches above — bypass ISR caching.
export async function getPublicTestimonials(): Promise<Testimonial[]> {
  const response = await fetch(`${apiBaseUrl()}/testimonials`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Testimonials API returned ${response.status}`);
  const envelope: ApiEnvelope<Testimonial[]> = await response.json();
  return envelope.data;
}

export type SiteSettings = { instagramUrl: string | null };

// Settings are edited live from the admin panel, same reasoning as the
// legal pages, FAQ, partners and testimonials fetches above — bypass ISR caching.
export async function getSiteSettings(): Promise<SiteSettings> {
  const response = await fetch(`${apiBaseUrl()}/settings`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Settings API returned ${response.status}`);
  const envelope: ApiEnvelope<SiteSettings> = await response.json();
  return envelope.data;
}

export type Category = { id: string; slug: string; name: string; imageUrl: string | null };

// Categories are edited live from the admin panel, same reasoning as the
// legal pages, FAQ, partners and testimonials fetches above — bypass ISR caching.
export async function getPublicCategories(): Promise<Category[]> {
  const response = await fetch(`${apiBaseUrl()}/tours/categories`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Categories API returned ${response.status}`);
  const envelope: ApiEnvelope<Category[]> = await response.json();
  return envelope.data;
}
