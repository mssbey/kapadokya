export const LOCALES = ['en', 'tr', 'es', 'it', 'ru'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Native names shown in the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
  es: 'Español',
  it: 'Italiano',
  ru: 'Русский',
};

/** BCP-47 tags for Intl formatting, <html lang> and hreflang. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: 'en-GB',
  tr: 'tr-TR',
  es: 'es-ES',
  it: 'it-IT',
  ru: 'ru-RU',
};

/** Open Graph locale identifiers. */
export const OG_LOCALES: Record<Locale, string> = {
  en: 'en_GB',
  tr: 'tr_TR',
  es: 'es_ES',
  it: 'it_IT',
  ru: 'ru_RU',
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Prefixes a locale-less app path with the active locale.
 * `localePath('tr', '/tours')` -> `/tr/tours`
 */
export function localePath(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${clean}` || '/';
}

/**
 * Strips a leading locale segment, returning the locale-less path.
 * `stripLocale('/tr/tours')` -> `/tours`
 */
export function stripLocale(pathname: string): string {
  const segments = pathname.split('/');
  if (isLocale(segments[1])) {
    const rest = segments.slice(2).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname || '/';
}

/** Reads the active locale out of a pathname, falling back to the default. */
export function localeFromPathname(pathname: string | null | undefined): Locale {
  const segment = (pathname || '').split('/')[1];
  return isLocale(segment) ? segment : DEFAULT_LOCALE;
}
