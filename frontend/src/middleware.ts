import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n/config';

/**
 * Every page lives under /<locale>/…, so anything arriving without a locale
 * prefix (old links, bare domain, shared URLs) is redirected to a real one.
 * First-time visitors always land on English; once someone explicitly picks
 * a language (the switcher sets `dc_locale`), that choice sticks on return
 * visits. Browser Accept-Language is intentionally not used to auto-pick a
 * locale — English is the deliberate default landing experience.
 */
function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get('dc_locale')?.value;
  if (isLocale(saved)) return saved;

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split('/')[1];

  if (isLocale(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === '/' ? '' : pathname}`;
  url.search = search;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, the API proxy and anything with a file extension
  // (images, favicon, robots.txt, sitemap.xml) so static assets are untouched.
  matcher: ['/((?!_next|api|health|ws|.*\\..*).*)'],
  // The Vercel "services" deploy doesn't support Edge Functions.
  runtime: 'nodejs',
};
