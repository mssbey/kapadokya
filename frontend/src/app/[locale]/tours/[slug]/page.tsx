import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarClock, Check, Clock3, Languages, MapPin, ShieldCheck, Star, X } from 'lucide-react';
import { TOUR_BASE, getRelated, getTour } from '@/lib/site';
import { TourBookingCard } from '@/components/TourBookingCard';
import { TrackEvent } from '@/components/Analytics';
import {
  DEFAULT_LOCALE,
  LOCALES,
  getDictionary,
  interpolate,
  isLocale,
  languageAlternates,
  localePath,
  type Locale,
} from '@/lib/i18n';

type Props = { params: { locale: string; slug: string } };

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => TOUR_BASE.map(({ slug }) => ({ locale, slug })));
}

export function generateMetadata({ params }: Props): Metadata {
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const t = getDictionary(locale);
  const tour = getTour(t, params.slug);
  if (!tour) return {};

  return {
    title: interpolate(t.tourDetail.metaTitleSuffix, { title: tour.title }),
    description: interpolate(t.tourDetail.metaDescriptionSuffix, { description: tour.description }),
    alternates: {
      canonical: localePath(locale, `/tours/${tour.slug}`),
      languages: languageAlternates(`/tours/${tour.slug}`),
    },
    openGraph: { title: tour.title, description: tour.description, images: [tour.image] },
  };
}

export default function TourPage({ params }: Props) {
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const t = getDictionary(locale);
  const tour = getTour(t, params.slug);
  if (!tour) notFound();

  const href = (path: string) => localePath(locale, path);
  // Same-category suggestions first: with 28 products, "related" has to mean
  // something or it is just the top of the catalogue on every page.
  const relatedTours = getRelated(t, tour).map((item) => ({ slug: item.slug, title: item.title }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.description,
    image: tour.image,
    offers: {
      '@type': 'Offer',
      price: tour.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: href(`/tours/${tour.slug}`),
    },
  };

  return (
    <div className="bg-[#f8f6f1] pb-28 pt-20 dark:bg-dark lg:pb-0">
      <TrackEvent name="tour_view" data={{ tour_slug: tour.slug, tour_name: tour.title }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="relative min-h-[500px] overflow-hidden bg-stone-900">
        <Image src={tour.image} alt={tour.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-12 text-white sm:px-6 lg:px-8">
          <Link href={href('/tours')} className="text-sm text-white/65 hover:text-white">{t.tourDetail.breadcrumbTours} / {tour.category}</Link>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold sm:text-5xl lg:text-6xl">{tour.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80">
            <span className="flex gap-2"><Star className="h-5 w-5 text-amber-300" /> {t.tourDetail.newListing}</span>
            <span className="flex gap-2"><Clock3 className="h-5 w-5" /> {tour.duration}</span>
            <span className="flex gap-2"><CalendarClock className="h-5 w-5" /> {tour.startTime}</span>
            <span className="flex gap-2"><Languages className="h-5 w-5" /> {tour.languages}</span>
            <span className="flex gap-2"><MapPin className="h-5 w-5" /> {tour.pickup}</span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <main className="space-y-12">
          <section><h2 className="font-display text-3xl font-bold">{t.tourDetail.overview}</h2><p className="mt-4 text-lg leading-8 text-stone-600 dark:text-white/65">{tour.description}</p></section>
          <section><h2 className="font-display text-3xl font-bold">{t.tourDetail.highlights}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{tour.highlights.map((item) => <p key={item} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> {item}</p>)}</div></section>
          <div className="grid gap-8 md:grid-cols-2">
            <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-white/5"><h2 className="font-display text-2xl font-bold">{t.tourDetail.included}</h2><div className="mt-5 space-y-3">{tour.included.map((item) => <p key={item} className="flex gap-3 text-sm text-stone-600 dark:text-white/65"><Check className="h-5 w-5 text-emerald-600" />{item}</p>)}</div></section>
            <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-white/5"><h2 className="font-display text-2xl font-bold">{t.tourDetail.notIncluded}</h2><div className="mt-5 space-y-3">{tour.notIncluded.map((item) => <p key={item} className="flex gap-3 text-sm text-stone-600 dark:text-white/65"><X className="h-5 w-5 text-rose-500" />{item}</p>)}</div></section>
          </div>
          <section>
            <h2 className="font-display text-3xl font-bold">{t.tourDetail.programTitle}</h2>
            <div className="mt-5 border-l-2 border-emerald-600 pl-6">
              <h3 className="font-bold">{t.tourDetail.programPickupTitle}</h3>
              <p className="mt-2 text-stone-600 dark:text-white/60">{t.tourDetail.programPickupText}</p>
              <h3 className="mt-7 font-bold">{t.tourDetail.programExperienceTitle}</h3>
              <p className="mt-2 text-stone-600 dark:text-white/60">{t.tourDetail.programExperienceText}</p>
              <h3 className="mt-7 font-bold">{t.tourDetail.programReturnTitle}</h3>
              <p className="mt-2 text-stone-600 dark:text-white/60">{t.tourDetail.programReturnText}</p>
            </div>
          </section>
          <section className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-3xl border border-stone-200 p-6 dark:border-white/10"><MapPin className="h-7 w-7 text-emerald-600" /><h2 className="mt-4 font-display text-2xl font-bold">{t.tourDetail.pickupTitle}</h2><p className="mt-3 text-sm leading-6 text-stone-600 dark:text-white/60">{t.tourDetail.pickupText}</p></div>
            <div className="rounded-3xl border border-stone-200 p-6 dark:border-white/10"><ShieldCheck className="h-7 w-7 text-emerald-600" /><h2 className="mt-4 font-display text-2xl font-bold">{t.tourDetail.cancellationTitle}</h2><p className="mt-3 text-sm leading-6 text-stone-600 dark:text-white/60">{t.tourDetail.cancellationText}</p></div>
          </section>
          {tour.categoryKey === 'Balloon' && (
            <section>
              <h2 className="font-display text-3xl font-bold">{t.tourDetail.faqTitle}</h2>
              <div className="mt-5 divide-y divide-stone-200 rounded-3xl bg-white px-6 dark:divide-white/10 dark:bg-white/5">
                {t.tourDetail.balloonFaq.map(([question, answer]) => (
                  <div key={question} className="py-5"><h3 className="font-bold">{question}</h3><p className="mt-2 text-sm leading-6 text-stone-600 dark:text-white/60">{answer}</p></div>
                ))}
              </div>
            </section>
          )}
          <section><h2 className="font-display text-3xl font-bold">{t.tourDetail.reviewsTitle}</h2><div className="mt-5 rounded-3xl border border-dashed border-stone-300 p-7 text-stone-600 dark:border-white/15 dark:text-white/55"><p className="font-bold text-stone-900 dark:text-white">{t.tourDetail.reviewsSoon}</p><p className="mt-2 text-sm">{t.tourDetail.reviewsText}</p></div></section>
          <section><h2 className="font-display text-3xl font-bold">{t.tourDetail.relatedTitle}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{relatedTours.map((item) => <Link key={item.slug} href={href(`/tours/${item.slug}`)} className="rounded-2xl border border-stone-200 bg-white p-4 font-bold hover:border-emerald-500 dark:border-white/10 dark:bg-white/5">{item.title} <span className="float-right">→</span></Link>)}</div></section>
        </main>
        <TourBookingCard tour={tour} />
      </div>
    </div>
  );
}
