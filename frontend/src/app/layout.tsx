import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SitePreferences } from '@/components/SitePreferences';
import { FloatingContact } from '@/components/FloatingContact';
import { CookieConsent } from '@/components/CookieConsent';
import { Analytics } from '@/components/Analytics';
import { SITE } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://discoverycappadocia.com'),
  title: { default: 'Discovery Cappadocia | Tours & Hot Air Balloon Flights', template: '%s | Discovery Cappadocia' },
  description: 'Book Cappadocia hot air balloon flights, ATV tours, horse riding, daily tours and airport transfers with a licensed local travel agency.',
  keywords: ['Cappadocia Hot Air Balloon', 'Cappadocia Balloon Tour', 'Cappadocia ATV Tour', 'Cappadocia Horse Riding', 'Cappadocia Jeep Safari', 'Cappadocia Green Tour', 'Cappadocia Red Tour', 'Cappadocia Airport Transfer'],
  openGraph: { title: 'Discovery Cappadocia | Local Tours & Experiences', description: 'Explore and book Cappadocia’s essential experiences with local support.', type: 'website', locale: 'en_US', images: ['/images/cappadocia-hero-signature.png'] },
  alternates: { canonical: '/' },
};

const themeScript = `(function(){try{var t=localStorage.getItem('dc_theme')||'light';var r=t;if(t==='system'){r=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(r==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schema = { '@context': 'https://schema.org', '@type': 'TravelAgency', name: SITE.name, url: process.env.NEXT_PUBLIC_SITE_URL || 'https://discoverycappadocia.com', telephone: SITE.phone, email: SITE.email, areaServed: 'Cappadocia, Türkiye' };
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </head>
      <body className="bg-white font-body text-gray-900 antialiased transition-colors dark:bg-dark dark:text-white">
        <SitePreferences>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <FloatingContact />
          <CookieConsent />
          <Analytics />
        </SitePreferences>
        <Toaster position="top-right" toastOptions={{ style: { background: 'var(--color-toast-bg)', color: 'var(--color-toast-text)', border: '1px solid var(--color-toast-border)', borderRadius: '12px' } }} />
      </body>
    </html>
  );
}

