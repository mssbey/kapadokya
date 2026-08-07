'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, MessageCircle, X } from 'lucide-react';
import { SITE, whatsappUrl } from '@/lib/site';
import { useSitePreferences } from '@/components/SitePreferences';

const links = [
  ['Experiences', '/#experiences'],
  ['Balloon Flights', '/tours/cappadocia-hot-air-balloon'],
  ['Tours', '/tours'],
  ['FAQ', '/#faq'],
  ['Contact', '/#contact'],
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { currency, locale, setCurrency, setLocale } = useSitePreferences();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition ${scrolled || open ? 'border-stone-200/70 bg-white/95 text-stone-900 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#08110f]/95 dark:text-white' : 'border-white/10 bg-black/10 text-white backdrop-blur-sm'}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Discovery Cappadocia home"><Image src="/logo.png" width={165} height={48} alt="Discovery Cappadocia" priority className="h-auto w-[150px] sm:w-[165px]" /></Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map(([label, href]) => <Link key={label} href={href} className="rounded-lg px-3 py-2 text-sm font-semibold opacity-80 transition hover:bg-white/10 hover:opacity-100">{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <label className="sr-only" htmlFor="site-language">Support language</label>
          <select id="site-language" value={locale} onChange={(e) => setLocale(e.target.value as typeof locale)} className="rounded-lg border border-current/15 bg-transparent px-2 py-2 text-xs font-bold outline-none [&>option]:text-stone-900">
            <option value="EN">EN support</option><option value="TR">TR destek</option><option value="ES">ES ayuda</option><option value="IT">IT supporto</option><option value="RU">RU помощь</option>
          </select>
          <label className="sr-only" htmlFor="site-currency">Currency</label>
          <select id="site-currency" value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)} className="rounded-lg border border-current/15 bg-transparent px-2 py-2 text-xs font-bold outline-none [&>option]:text-stone-900">
            <option value="EUR">EUR €</option><option value="USD">USD $</option><option value="GBP">GBP £</option><option value="TRY">TRY ₺</option>
          </select>
          <a href={whatsappUrl()} target="_blank" rel="noreferrer" data-event="whatsapp_click" className="grid h-10 w-10 place-items-center rounded-xl border border-current/15" aria-label={`WhatsApp ${SITE.phoneDisplay}`}><MessageCircle className="h-5 w-5" /></a>
          <Link href="/booking" className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-extrabold text-stone-900 hover:bg-amber-200">Book now</Link>
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-xl border border-current/15 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="border-t border-stone-200 bg-white px-4 pb-6 pt-3 text-stone-900 dark:border-white/10 dark:bg-[#08110f] dark:text-white md:hidden">
          <nav className="flex flex-col">{links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)} className="border-b border-stone-100 py-4 font-semibold dark:border-white/10">{label}</Link>)}</nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <select value={locale} onChange={(e) => setLocale(e.target.value as typeof locale)} className="rounded-xl border border-stone-200 bg-transparent p-3 text-sm dark:border-white/10"><option value="EN">English</option><option value="TR">Türkçe</option><option value="ES">Español</option><option value="IT">Italiano</option><option value="RU">Русский</option></select>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)} className="rounded-xl border border-stone-200 bg-transparent p-3 text-sm dark:border-white/10"><option value="EUR">EUR €</option><option value="USD">USD $</option><option value="GBP">GBP £</option><option value="TRY">TRY ₺</option></select>
            <Link href="/booking" onClick={() => setOpen(false)} className="col-span-2 rounded-xl bg-amber-300 p-4 text-center font-extrabold text-stone-900">Book now</Link>
          </div>
        </div>
      )}
    </header>
  );
}
