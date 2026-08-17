'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings } from '@/lib/catalogApi';

// Instagram (and any future site-wide setting) is edited live from the admin
// panel, so every consumer — header, footer, floating contact widget, the
// homepage balloon section — fetches it independently rather than sharing a
// prop chain from the root layout.
export function useInstagramUrl(): string | null {
  const [instagramUrl, setInstagramUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSiteSettings()
      .then((settings) => { if (active) setInstagramUrl(settings.instagramUrl); })
      .catch(() => { if (active) setInstagramUrl(null); });
    return () => { active = false; };
  }, []);

  return instagramUrl;
}
