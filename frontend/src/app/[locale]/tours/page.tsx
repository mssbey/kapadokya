import type { Metadata } from 'next';
import { ToursBrowser } from '@/components/tours/ToursBrowser';
import {
  DEFAULT_LOCALE,
  getDictionary,
  isLocale,
  languageAlternates,
  localePath,
  type Locale,
} from '@/lib/i18n';

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const t = getDictionary(locale);
  return {
    title: t.toursPage.metaTitle,
    description: t.toursPage.metaDescription,
    alternates: {
      canonical: localePath(locale, '/tours'),
      languages: languageAlternates('/tours'),
    },
  };
}

export default function ToursPage() {
  return <ToursBrowser />;
}
