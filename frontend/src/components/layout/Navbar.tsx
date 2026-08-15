'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiteLogo } from '@/components/SiteLogo';
import { Menu, MessageCircle, X } from 'lucide-react';
import { SITE, whatsappUrl } from '@/lib/site';
import { useSitePreferences } from '@/components/SitePreferences';
import { useI18n } from '@/components/I18nProvider';
import { LOCALES, LOCALE_NAMES, type Locale } from '@/lib/i18n';

/** Locale prefix (`/tr`, `/ru`…) so route checks work in every language. */
const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`);

/**
 * Only these routes put a dark, full-bleed hero behind the fixed header. On
 * every other page the header sits on the light `#f8f6f1` background, where
 * white nav text is invisible — those get the solid treatment instead.
 */
function hasDarkHero(pathname: string) {
  const route = pathname.replace(LOCALE_PREFIX, '') || '/';
  return route === '/' || route === '/tours' || /^\/tours\/[^/]+$/.test(route);
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useSitePreferences();
  const { t, locale, href, switchLocale } = useI18n();
  const pathname = usePathname() || '/';
  const transparent = hasDarkHero(pathname) && !scrolled && !open;

  const links: [string, string][] = [
    [t.nav.experiences, href('/#experiences')],
    [t.nav.balloonFlights, href('/tours/cappadocia-hot-air-balloon')],
    [t.nav.tours, href('/tours')],
    [t.nav.faq, href('/#faq')],
    [t.nav.partners, href('/#partners')],
    [t.nav.contact, href('/#contact')],
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition ${transparent ? 'border-transparent bg-gradient-to-b from-black/60 via-black/30 to-transparent text-white' : 'border-stone-200/70 bg-white/95 text-stone-900 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#08110f]/95 dark:text-white'}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Same file as the hero's logo (already preloaded there with
            fetchPriority="high"); a second `priority` here duplicated that
            preload for an identical URL and the browser cache serves this
            one for free, so it doesn't need its own. */}
        <Link href={href('/')} aria-label={t.nav.homeAria}><SiteLogo className="h-auto w-[150px] sm:w-[165px]" /></Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label={t.nav.primaryNavAria}>
          {links.map(([label, target]) => <Link key={label} href={target} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${transparent ? 'text-white/85 hover:bg-white/10 hover:text-white' : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white'}`}>{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <label className="sr-only" htmlFor="site-language">{t.nav.languageLabel}</label>
          <select id="site-language" value={locale} onChange={(e) => switchLocale(e.target.value as Locale)} className="rounded-lg border border-current/15 bg-transparent px-2 py-2 text-xs font-bold outline-none [&>option]:text-stone-900">
            {LOCALES.map((code) => <option key={code} value={code}>{code.toUpperCase()} · {LOCALE_NAMES[code]}</option>)}
          </select>
          <label className="sr-only" htmlFor="site-currency">{t.nav.currencyLabel}</label>
          <select id="site-currency" value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)} className="rounded-lg border border-current/15 bg-transparent px-2 py-2 text-xs font-bold outline-none [&>option]:text-stone-900">
            <option value="EUR">EUR €</option><option value="USD">USD $</option><option value="GBP">GBP £</option><option value="TRY">TRY ₺</option>
          </select>
          <a href={whatsappUrl(t.whatsapp.defaultMessage)} target="_blank" rel="noreferrer" data-event="whatsapp_click" className="grid h-10 w-10 place-items-center rounded-xl border border-current/15" aria-label={`WhatsApp ${SITE.phoneDisplay}`}><MessageCircle className="h-5 w-5" /></a>
          <Link href={href('/booking')} className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-extrabold text-stone-900 hover:bg-amber-200">{t.nav.bookNow}</Link>
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-xl border border-current/15 md:hidden" onClick={() => setOpen(!open)} aria-label={t.nav.toggleNav}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="border-t border-stone-200 bg-white px-4 pb-6 pt-3 text-stone-900 dark:border-white/10 dark:bg-[#08110f] dark:text-white md:hidden">
          <nav className="flex flex-col">{links.map(([label, target]) => <Link key={label} href={target} onClick={() => setOpen(false)} className="border-b border-stone-100 py-4 font-semibold dark:border-white/10">{label}</Link>)}</nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <select aria-label={t.nav.languageLabel} value={locale} onChange={(e) => switchLocale(e.target.value as Locale)} className="rounded-xl border border-stone-200 bg-transparent p-3 text-sm dark:border-white/10">
              {LOCALES.map((code) => <option key={code} value={code}>{LOCALE_NAMES[code]}</option>)}
            </select>
            <select aria-label={t.nav.currencyLabel} value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)} className="rounded-xl border border-stone-200 bg-transparent p-3 text-sm dark:border-white/10"><option value="EUR">EUR €</option><option value="USD">USD $</option><option value="GBP">GBP £</option><option value="TRY">TRY ₺</option></select>
            <Link href={href('/booking')} onClick={() => setOpen(false)} className="col-span-2 rounded-xl bg-amber-300 p-4 text-center font-extrabold text-stone-900">{t.nav.bookNow}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
