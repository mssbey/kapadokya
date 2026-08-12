import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import '../globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { I18nProvider } from '@/components/I18nProvider';
import { SitePreferences } from '@/components/SitePreferences';
import { FloatingContact } from '@/components/FloatingContact';
import { CookieConsent } from '@/components/CookieConsent';
import { Analytics } from '@/components/Analytics';
import { SITE } from '@/lib/site';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_TAGS,
  OG_LOCALES,
  getDictionary,
  isLocale,
  languageAlternates,
  localePath,
  type Locale,
} from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://discoverycappadocia.com';

type LocaleParams = { locale: string };
type Props = { children: React.ReactNode; params: Promise<LocaleParams> };

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
  const resolved = await params;
  const locale: Locale = isLocale(resolved.locale) ? resolved.locale : DEFAULT_LOCALE;
  const t = getDictionary(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: t.meta.titleTemplate },
    description: t.meta.description,
    keywords: t.meta.keywords,
    openGraph: {
      title: t.meta.ogTitle,
      description: t.meta.ogDescription,
      type: 'website',
      locale: OG_LOCALES[locale],
      images: ['/images/cappadocia-hero-signature.webp'],
    },
    alternates: {
      canonical: localePath(locale, '/'),
      languages: languageAlternates('/'),
    },
    icons: { icon: '/logo.png', apple: '/logo.png' },
  };
}

const themeScript = `(function(){try{var t=localStorage.getItem('dc_theme')||'light';var r=t;if(t==='system'){r=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(r==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`;

export default async function LocaleLayout({ children, params }: Props) {
  const resolved = await params;
  if (!isLocale(resolved.locale)) notFound();
  const locale = resolved.locale;
  const dictionary = getDictionary(locale);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE.name,
    url: SITE_URL,
    telephone: SITE.phone,
    email: SITE.email,
    areaServed: 'Cappadocia, Türkiye',
  };

  return (
    <html lang={LOCALE_TAGS[locale]} className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </head>
      <body className="bg-white font-body text-gray-900 antialiased transition-colors dark:bg-dark dark:text-white">
        <I18nProvider locale={locale} dictionary={dictionary}>
          <SitePreferences>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <FloatingContact />
            <CookieConsent />
            <Analytics />
          </SitePreferences>
        </I18nProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-toast-bg)',
              color: 'var(--color-toast-text)',
              border: '1px solid var(--color-toast-border)',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}
