import { HeroSection } from '@/components/sections/HeroSection';
import { ExperiencesSection } from '@/components/sections/ExperiencesSection';
import { LiveAvailabilitySection } from '@/components/sections/LiveAvailabilitySection';
import { SocialProofSection } from '@/components/sections/SocialProofSection';
import { MapSection } from '@/components/sections/MapSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ExperiencesSection />
      <LiveAvailabilitySection />
      <SocialProofSection />
      <MapSection />
    </>
  );
}
