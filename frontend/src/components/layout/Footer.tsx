'use client';

import { SiteLogo } from '@/components/SiteLogo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BadgeCheck, LockKeyhole, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { SITE, whatsappUrl } from '@/lib/site';
import { useI18n } from '@/components/I18nProvider';
import { stripLocale } from '@/lib/i18n';

export function Footer() {
  const pathname = usePathname();
  const { t, href, fill } = useI18n();
  // The guest is already in the funnel — no "come book with us" banner on top of it.
  const inBookingFlow = stripLocale(pathname || '/').startsWith('/booking');

  const quick: [string, string][] = [
    [t.footer.quick.about, href('/#about')],
    [t.footer.quick.allTours, href('/tours')],
    [t.footer.quick.faq, href('/#faq')],
    [t.footer.quick.contact, href('/#contact')],
  ];
  const support: [string, string][] = [
    [t.footer.support.cancellation, href('/legal/cancellation-refund')],
    [t.footer.support.privacy, href('/legal/privacy')],
    [t.footer.support.terms, href('/legal/terms')],
    [t.footer.support.distanceSales, href('/legal/distance-sales')],
    [t.footer.support.kvkk, href('/legal/kvkk')],
    [t.footer.support.cookies, href('/legal/cookie-policy')],
  ];

  return (
    <footer id="contact" className="bg-[#07110e] text-white">
      {!inBookingFlow && (
        <div className="border-b border-white/10 bg-[#102d26]">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div><p className="font-display text-2xl font-bold">{t.footer.ctaTitle}</p><p className="mt-1 text-sm text-white/60">{t.footer.ctaSubtitle}</p></div>
            <a href={whatsappUrl(t.footer.ctaMessage)} target="_blank" rel="noreferrer" data-event="whatsapp_click" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 font-extrabold"><MessageCircle className="h-5 w-5" /> {t.footer.ctaButton}</a>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <SiteLogo className="h-auto w-44" />
            <p className="mt-5 text-sm font-semibold text-white/80">{SITE.legalName}</p>
            <p className="mt-2 text-sm leading-7 text-white/55">{t.footer.blurb}</p>
            <div className="mt-5 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4"><BadgeCheck className="h-6 w-6 shrink-0 text-amber-300" /><div><p className="text-sm font-bold">{t.footer.licensedAgency}</p><p className="mt-1 text-xs text-white/45">{fill(t.trust.tursab, { number: SITE.tursabNumber })}</p></div></div>
          </div>
          <div><h3 className="font-bold">{t.footer.quickLinksTitle}</h3><ul className="mt-5 space-y-3">{quick.map(([label, target]) => <li key={label}><Link href={target} className="text-sm text-white/55 hover:text-amber-300">{label}</Link></li>)}</ul></div>
          <div><h3 className="font-bold">{t.footer.supportTitle}</h3><ul className="mt-5 space-y-3">{support.map(([label, target]) => <li key={label}><Link href={target} className="text-sm text-white/55 hover:text-amber-300">{label}</Link></li>)}</ul></div>
          <div><h3 className="font-bold">{t.footer.contactTitle}</h3><ul className="mt-5 space-y-4 text-sm text-white/55">
            <li className="flex gap-3"><MessageCircle className="h-5 w-5 shrink-0 text-emerald-400" /><a href={whatsappUrl(t.whatsapp.defaultMessage)} target="_blank" rel="noreferrer" data-event="whatsapp_click">WhatsApp: {SITE.phoneDisplay}</a></li>
            <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-emerald-400" /><a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a></li>
            <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0 text-emerald-400" /><a href={`mailto:${SITE.email}`} className="break-all">{SITE.email}</a></li>
            <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-emerald-400" /><span>{SITE.address}</span></li>
          </ul></div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-5 border-t border-white/10 pt-7 text-xs text-white/38 md:flex-row md:items-center">
          <p>{fill(t.footer.rights, { year: new Date().getFullYear(), name: SITE.name })}</p>
          <div className="flex flex-wrap items-center gap-4"><span className="flex items-center gap-1"><LockKeyhole className="h-4 w-4" /> {t.footer.ssl}</span><span>Visa</span><span>Mastercard</span><span>{t.footer.secure3d}</span></div>
        </div>
      </div>
    </footer>
  );
}
