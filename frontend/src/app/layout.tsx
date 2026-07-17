import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DiscoveryCappadocia | Premium Travel & Hot Air Balloon Experiences',
  description:
    'Experience Cappadocia like never before. Book luxury hot air balloon flights, guided tours, and unforgettable adventures in one of the most magical destinations on Earth.',
  keywords: [
    'Cappadocia',
    'hot air balloon',
    'Turkey travel',
    'luxury tours',
    'adventure travel',
    'fairy chimneys',
    'Göreme',
  ],
  openGraph: {
    title: 'DiscoveryCappadocia | Premium Travel Experiences',
    description: 'Experience the sky like never before.',
    type: 'website',
    locale: 'en_US',
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem('dc_theme')||'dark';var r=t;if(t==='system'){r=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(r==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){document.documentElement.classList.add('dark')}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-white dark:bg-dark text-gray-900 dark:text-white font-body antialiased transition-colors duration-300">
        <SplashScreen>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </SplashScreen>
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
