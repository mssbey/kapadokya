import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarClock, Check, Clock3, Languages, MapPin, ShieldCheck, Star, X } from 'lucide-react';
import { CATALOG } from '@/lib/site';
import { TourBookingCard } from '@/components/TourBookingCard';
import { TrackEvent } from '@/components/Analytics';

type Props = { params: { slug: string } };

export function generateStaticParams() { return CATALOG.map(({ slug }) => ({ slug })); }

export function generateMetadata({ params }: Props): Metadata {
  const tour = CATALOG.find((item) => item.slug === params.slug);
  if (!tour) return {};
  return {
    title: `${tour.title} – Price & Booking`,
    description: `${tour.description} Check availability, inclusions, pickup information and book with local support.`,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: { title: tour.title, description: tour.description, images: [tour.image] },
  };
}

const balloonFaq = [
  ['What happens if the flight is cancelled due to weather?', 'We help you reschedule to the next available flight or apply the refund terms shown during checkout.'],
  ['Is hotel pickup included?', 'Pickup is included where stated. Add your hotel during booking so our team can verify it.'],
  ['What should I wear?', 'Closed shoes and layered clothing are recommended, especially before sunrise.'],
  ['When will I receive my pickup time?', 'The exact pickup time is normally confirmed by the evening before your flight.'],
];

export default function TourPage({ params }: Props) {
  const tour = CATALOG.find((item) => item.slug === params.slug);
  if (!tour) notFound();
  const related = CATALOG.filter((item) => item.slug !== tour.slug).slice(0, 4);
  const schema = { '@context': 'https://schema.org', '@type': 'TouristTrip', name: tour.title, description: tour.description, image: tour.image, offers: { '@type': 'Offer', price: tour.price, priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: `/tours/${tour.slug}` } };

  return (
    <div className="bg-[#f8f6f1] pb-28 pt-20 dark:bg-dark lg:pb-0">
      <TrackEvent name="tour_view" data={{ tour_slug: tour.slug, tour_name: tour.title }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="relative min-h-[500px] overflow-hidden bg-stone-900">
        <Image src={tour.image} alt={`${tour.title} in Cappadocia`} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-12 text-white sm:px-6 lg:px-8">
          <Link href="/tours" className="text-sm text-white/65 hover:text-white">Tours / {tour.category}</Link>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold sm:text-5xl lg:text-6xl">{tour.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80">
            <span className="flex gap-2"><Star className="h-5 w-5 text-amber-300" /> New listing</span>
            <span className="flex gap-2"><Clock3 className="h-5 w-5" /> {tour.duration}</span>
            <span className="flex gap-2"><CalendarClock className="h-5 w-5" /> {tour.startTime}</span>
            <span className="flex gap-2"><Languages className="h-5 w-5" /> {tour.languages}</span>
            <span className="flex gap-2"><MapPin className="h-5 w-5" /> {tour.pickup}</span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <main className="space-y-12">
          <section><h2 className="font-display text-3xl font-bold">Overview</h2><p className="mt-4 text-lg leading-8 text-stone-600 dark:text-white/65">{tour.description}</p></section>
          <section><h2 className="font-display text-3xl font-bold">Highlights</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{tour.highlights.map((item) => <p key={item} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> {item}</p>)}</div></section>
          <div className="grid gap-8 md:grid-cols-2">
            <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-white/5"><h2 className="font-display text-2xl font-bold">What’s included</h2><div className="mt-5 space-y-3">{tour.included.map((item) => <p key={item} className="flex gap-3 text-sm text-stone-600 dark:text-white/65"><Check className="h-5 w-5 text-emerald-600" />{item}</p>)}</div></section>
            <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-white/5"><h2 className="font-display text-2xl font-bold">Not included</h2><div className="mt-5 space-y-3">{tour.notIncluded.map((item) => <p key={item} className="flex gap-3 text-sm text-stone-600 dark:text-white/65"><X className="h-5 w-5 text-rose-500" />{item}</p>)}</div></section>
          </div>
          <section><h2 className="font-display text-3xl font-bold">Tour program / itinerary</h2><div className="mt-5 border-l-2 border-emerald-600 pl-6"><h3 className="font-bold">Pickup and briefing</h3><p className="mt-2 text-stone-600 dark:text-white/60">We confirm your pickup point and time after booking. The local team provides an activity and safety briefing before departure.</p><h3 className="mt-7 font-bold">The experience</h3><p className="mt-2 text-stone-600 dark:text-white/60">The exact route and timing may adjust for weather, traffic and operating conditions so your experience remains safe and enjoyable.</p><h3 className="mt-7 font-bold">Return</h3><p className="mt-2 text-stone-600 dark:text-white/60">Return transfer is provided where included in the package selected at checkout.</p></div></section>
          <section className="grid gap-5 sm:grid-cols-2"><div className="rounded-3xl border border-stone-200 p-6 dark:border-white/10"><MapPin className="h-7 w-7 text-emerald-600" /><h2 className="mt-4 font-display text-2xl font-bold">Pickup information</h2><p className="mt-3 text-sm leading-6 text-stone-600 dark:text-white/60">Enter your hotel name and WhatsApp number during checkout. Exact pickup details are sent after confirmation.</p></div><div className="rounded-3xl border border-stone-200 p-6 dark:border-white/10"><ShieldCheck className="h-7 w-7 text-emerald-600" /><h2 className="mt-4 font-display text-2xl font-bold">Cancellation policy</h2><p className="mt-3 text-sm leading-6 text-stone-600 dark:text-white/60">The applicable cancellation window is shown before payment and on your voucher. Weather-related operator cancellations follow the terms of your confirmed booking.</p></div></section>
          {tour.category === 'Balloon' && <section><h2 className="font-display text-3xl font-bold">Frequently asked questions</h2><div className="mt-5 divide-y divide-stone-200 rounded-3xl bg-white px-6 dark:divide-white/10 dark:bg-white/5">{balloonFaq.map(([q, a]) => <div key={q} className="py-5"><h3 className="font-bold">{q}</h3><p className="mt-2 text-sm leading-6 text-stone-600 dark:text-white/60">{a}</p></div>)}</div></section>}
          <section><h2 className="font-display text-3xl font-bold">Customer reviews</h2><div className="mt-5 rounded-3xl border border-dashed border-stone-300 p-7 text-stone-600 dark:border-white/15 dark:text-white/55"><p className="font-bold text-stone-900 dark:text-white">Verified reviews coming soon</p><p className="mt-2 text-sm">Reviews will appear here after verified Google or Tripadvisor profiles are connected. We do not publish fabricated ratings.</p></div></section>
          <section><h2 className="font-display text-3xl font-bold">Complete your Cappadocia experience</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{related.map((item) => <Link key={item.slug} href={`/tours/${item.slug}`} className="rounded-2xl border border-stone-200 bg-white p-4 font-bold hover:border-emerald-500 dark:border-white/10 dark:bg-white/5">{item.title} <span className="float-right">→</span></Link>)}</div></section>
        </main>
        <TourBookingCard tour={tour} />
      </div>
    </div>
  );
}
