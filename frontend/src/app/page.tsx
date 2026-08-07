import { HeroSection } from '@/components/sections/HeroSection';
import { SocialProofSection } from '@/components/sections/SocialProofSection';
import { MapSection } from '@/components/sections/MapSection';
import { TrustSection } from '@/components/sections/TrustSection';
import { PopularExperiences } from '@/components/sections/PopularExperiences';
import { BalloonFeature } from '@/components/sections/BalloonFeature';
import { LastMinuteAvailability } from '@/components/sections/LastMinuteAvailability';

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <PopularExperiences />
      <BalloonFeature />
      <LastMinuteAvailability />
      <SocialProofSection />
      <MapSection />
    </>
  );
}
