'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(!localStorage.getItem('dc_cookie_consent')), []);
  if (!visible) return null;

  function choose(value: 'essential' | 'all') {
    localStorage.setItem('dc_cookie_consent', value);
    window.dispatchEvent(new CustomEvent('dc-consent', { detail: value }));
    setVisible(false);
  }

  return (
    <aside className="fixed bottom-4 left-4 z-[80] w-[min(430px,calc(100vw-2rem))] rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#101815]" aria-label="Cookie preferences">
      <p className="font-bold text-stone-900 dark:text-white">Your privacy choices</p>
      <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-white/60">We use essential cookies to operate bookings. Analytics and advertising cookies are loaded only after your consent. See our <Link href="/legal/cookie-policy" className="underline">Cookie Policy</Link>.</p>
      <div className="mt-4 flex gap-2">
        <button onClick={() => choose('essential')} className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-bold dark:border-white/20">Essential only</button>
        <button onClick={() => choose('all')} className="flex-1 rounded-xl bg-[#123f35] px-4 py-2.5 text-sm font-bold text-white">Accept all</button>
      </div>
    </aside>
  );
}

