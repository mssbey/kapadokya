import { en, type Dictionary, type TourSlug } from './dictionaries/en';
import { tr } from './dictionaries/tr';
import { es } from './dictionaries/es';
import { it } from './dictionaries/it';
import { ru } from './dictionaries/ru';
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, localePath, type Locale } from './config';

const DICTIONARIES: Record<Locale, Dictionary> = { en, tr, es, it, ru };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * Fills `{name}` placeholders. Kept deliberately tiny — the dictionaries only
 * ever interpolate a handful of values (price, count, phone, year).
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * hreflang map for a locale-less path, so Google indexes each language as its
 * own page and knows they are translations of one another.
 */
export function languageAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of LOCALES) {
    alternates[LOCALE_TAGS[locale]] = localePath(locale, path);
  }
  alternates['x-default'] = localePath(DEFAULT_LOCALE, path);
  return alternates;
}

export type { Dictionary, TourSlug };
export * from './config';
