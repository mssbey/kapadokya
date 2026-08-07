'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

declare global { interface Window { dataLayer?: unknown[] } }

export function Analytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(localStorage.getItem('dc_cookie_consent') === 'all');
    const handler = (event: Event) => setAllowed((event as CustomEvent).detail === 'all');
    window.addEventListener('dc-consent', handler);
    const clickHandler = (event: MouseEvent) => {
      const element = (event.target as HTMLElement).closest('[data-event]');
      if (element && allowed) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: element.getAttribute('data-event') });
      }
    };
    document.addEventListener('click', clickHandler);
    return () => { window.removeEventListener('dc-consent', handler); document.removeEventListener('click', clickHandler); };
  }, [allowed]);

  if (!gtmId || !allowed) return null;
  return (
    <>
      <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}</Script>
    </>
  );
}

export function TrackEvent({ name, data = {} }: { name: string; data?: Record<string, unknown> }) {
  useEffect(() => {
    if (localStorage.getItem('dc_cookie_consent') === 'all') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: name, ...data });
    }
  }, [data, name]);
  return null;
}
