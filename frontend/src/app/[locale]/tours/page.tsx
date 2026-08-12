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

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const locale: Locale = isLocale(resolved.locale) ? resolved.locale : DEFAULT_LOCALE;
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
