'use client';

import { createContext, useContext, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  DEFAULT_LOCALE,
  LOCALE_TAGS,
  interpolate,
  localePath,
  stripLocale,
  type Dictionary,
  type Locale,
} from '@/lib/i18n';

type I18nValue = {
  locale: Locale;
  /** Active dictionary, handed down from the server layout. */
  t: Dictionary;
  /** BCP-47 tag for Intl formatting. */
  tag: string;
  /** Prefixes an app path with the active locale: `/tours` -> `/tr/tours`. */
  href: (path: string) => string;
  /** Fills `{name}` placeholders in a dictionary string. */
  fill: (template: string, values: Record<string, string | number>) => string;
  /** Switches language, keeping the visitor on the same page. */
  switchLocale: (next: Locale) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      t: dictionary,
      tag: LOCALE_TAGS[locale] ?? LOCALE_TAGS[DEFAULT_LOCALE],
      href: (path) => localePath(locale, path),
      fill: interpolate,
      switchLocale: (next) => {
        // Keep the visitor on the page they are reading, just in the new language.
        const target = localePath(next, stripLocale(pathname || '/'));
        document.cookie = `dc_locale=${next};path=/;max-age=31536000;samesite=lax`;
        router.push(target);
      },
    }),
    [dictionary, locale, pathname, router],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used within I18nProvider');
  return value;
}
