import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { CalendarClock, Check, Clock3, MapPin, ShieldCheck, X } from 'lucide-react';
import { ResponsivePhoto } from '@/components/ResponsivePhoto';
import { TourBookingCard } from '@/components/TourBookingCard';
import { TrackEvent } from '@/components/Analytics';
import { getPublicTour, getPublicTours, categoryLabel } from '@/lib/catalogApi';
import { DEFAULT_LOCALE, isLocale, languageAlternates, localePath, type Locale } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const locale: Locale = isLocale(resolved.locale) ? resolved.locale : DEFAULT_LOCALE;
  try {
    const { data: tour } = await getPublicTour(resolved.slug, locale);
    return { title: tour.seoTitle || tour.title, description: tour.seoDescription || tour.shortDesc, alternates: { canonical: localePath(locale, `/tours/${tour.slug}`), languages: languageAlternates(`/tours/${tour.slug}`) }, openGraph: { title: tour.title, description: tour.shortDesc, images: tour.image ? [tour.image] : [] } };
  } catch { return {}; }
}

export default async function TourPage({ params }: Props) {
  const resolved = await params;
  const locale: Locale = isLocale(resolved.locale) ? resolved.locale : DEFAULT_LOCALE;
  let envelope;
  try { envelope = await getPublicTour(resolved.slug, locale); } catch { notFound(); }
  const tour = envelope!.data;
  if (envelope!.meta?.canonicalSlug && envelope!.meta.canonicalSlug !== resolved.slug) redirect(localePath(locale, `/tours/${envelope!.meta.canonicalSlug}`));
  const related = (await getPublicTours(locale, { category: tour.category })).filter((item) => item.id !== tour.id).slice(0, 4);
  const href = (path: string) => localePath(locale, path);
  const schema = { '@context': 'https://schema.org', '@type': 'TouristTrip', name: tour.title, description: tour.description, image: tour.image, offers: { '@type': 'Offer', price: tour.basePrice, priceCurrency: tour.currency, availability: tour.isBookingEnabled ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: href(`/tours/${tour.slug}`) } };

  return <div className="bg-[#f8f6f1] pb-28 dark:bg-dark lg:pb-0"><TrackEvent name="tour_view" data={{ tour_slug: tour.slug, tour_name: tour.title }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><section className="relative min-h-[580px] overflow-hidden bg-stone-900 pt-20">{tour.image && <ResponsivePhoto src={tour.image} alt={tour.media?.[0]?.altText || tour.title} priority />}<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" /><div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-12 text-white"><Link href={href('/tours')} className="text-sm text-white/65">Tours / {categoryLabel(tour.category, locale)}</Link><h1 className="mt-3 max-w-4xl font-display text-4xl font-bold sm:text-6xl">{tour.title}</h1><div className="mt-5 flex flex-wrap gap-6 text-sm text-white/80"><span className="flex gap-2"><Clock3 className="h-5 w-5" />{tour.duration}</span>{tour.startTime && <span className="flex gap-2"><CalendarClock className="h-5 w-5" />{tour.startTime}{tour.endTime ? `–${tour.endTime}` : ''}</span>}{tour.meetingPoint && <span className="flex gap-2"><MapPin className="h-5 w-5" />{tour.meetingPoint}</span>}</div></div></section><div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1fr_360px]"><main className="space-y-12"><section><h2 className="font-display text-3xl font-bold">Overview</h2><p className="mt-4 text-lg leading-8 text-stone-600 dark:text-white/65">{tour.description}</p></section>{tour.media && tour.media.length > 1 && <section className="grid gap-4 sm:grid-cols-2">{tour.media.slice(1).map((image) => <div key={image.id} className="relative h-72 overflow-hidden rounded-3xl"><ResponsivePhoto src={image.secureUrl} alt={image.altText || tour.title} /></div>)}</section>}<section><h2 className="font-display text-3xl font-bold">Highlights</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{tour.highlights.map((item) => <p key={item} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5"><Check className="h-5 w-5 text-emerald-600" />{item}</p>)}</div></section><div className="grid gap-8 md:grid-cols-2"><section className="rounded-3xl bg-white p-6 dark:bg-white/5"><h2 className="font-display text-2xl font-bold">Included</h2>{tour.includes.map((item) => <p key={item} className="mt-3 flex gap-3"><Check className="h-5 w-5 text-emerald-600" />{item}</p>)}</section><section className="rounded-3xl bg-white p-6 dark:bg-white/5"><h2 className="font-display text-2xl font-bold">Not included</h2>{tour.excludes.map((item) => <p key={item} className="mt-3 flex gap-3"><X className="h-5 w-5 text-rose-500" />{item}</p>)}</section></div><section className="grid gap-5 sm:grid-cols-2"><div className="rounded-3xl border p-6 dark:border-white/10"><MapPin className="h-7 w-7 text-emerald-600" /><h2 className="mt-4 text-2xl font-bold">Meeting point</h2><p className="mt-3 text-stone-600 dark:text-white/60">{tour.meetingPoint || 'Hotel pickup details are confirmed after booking.'}</p></div><div className="rounded-3xl border p-6 dark:border-white/10"><ShieldCheck className="h-7 w-7 text-emerald-600" /><h2 className="mt-4 text-2xl font-bold">Cancellation</h2><p className="mt-3 text-stone-600 dark:text-white/60">{tour.cancellationPolicy || 'Contact us for the cancellation terms of this experience.'}</p></div></section><section><h2 className="font-display text-3xl font-bold">Related experiences</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{related.map((item) => <Link key={item.id} href={href(`/tours/${item.slug}`)} className="rounded-2xl border bg-white p-4 font-bold dark:border-white/10 dark:bg-white/5">{item.title} <span className="float-right">→</span></Link>)}</div></section></main><TourBookingCard tour={tour} /></div></div>;
}
