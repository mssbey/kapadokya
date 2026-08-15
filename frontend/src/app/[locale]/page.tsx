import { HeroSection } from '@/components/sections/HeroSection';
import { SocialProofSection } from '@/components/sections/SocialProofSection';
import { MapSection } from '@/components/sections/MapSection';
import { TrustSection } from '@/components/sections/TrustSection';
import { PopularExperiences } from '@/components/sections/PopularExperiences';
import { BalloonFeature } from '@/components/sections/BalloonFeature';
import { LastMinuteAvailability } from '@/components/sections/LastMinuteAvailability';
import { PartnersSection } from '@/components/sections/PartnersSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { getPublicFaqs, getPublicPartners, getPublicTestimonials } from '@/lib/catalogApi';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

export default async function Home({ params }: Props) {
  const resolved = await params;
  const locale: Locale = isLocale(resolved.locale) ? resolved.locale : DEFAULT_LOCALE;
  // Admin-managed content; fall back gracefully if the API is unreachable —
  // FAQ falls back to its static dictionary copy, partners/testimonials just hide the section.
  const [faqs, partners, testimonials] = await Promise.all([
    getPublicFaqs(locale).catch(() => []),
    getPublicPartners().catch(() => []),
    getPublicTestimonials().catch(() => []),
  ]);

  return (
    <>
      <HeroSection />
      <TrustSection />
      <PopularExperiences />
      <BalloonFeature />
      <LastMinuteAvailability />
      <TestimonialsSection locale={locale} testimonials={testimonials} />
      <SocialProofSection faqs={faqs} />
      <PartnersSection locale={locale} partners={partners} />
      <MapSection />
    </>
  );
}
