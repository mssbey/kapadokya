'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BadgeCheck, LockKeyhole, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { SITE, whatsappUrl } from '@/lib/site';

const quick = [['About us', '/#about'], ['All tours', '/tours'], ['FAQ', '/#faq'], ['Contact', '/#contact']];
const support = [['Cancellation & Refund Policy', '/legal/cancellation-refund'], ['Privacy Policy', '/legal/privacy'], ['Terms & Conditions', '/legal/terms'], ['Distance Sales Agreement', '/legal/distance-sales'], ['KVKK / Personal Data', '/legal/kvkk'], ['Cookie Policy', '/legal/cookie-policy']];

export function Footer() {
  const pathname = usePathname();
  // The guest is already in the funnel — no "come book with us" banner on top of it.
  const inBookingFlow = pathname?.startsWith('/booking') ?? false;

  return (
    <footer id="contact" className="bg-[#07110e] text-white">
      {!inBookingFlow && (
        <div className="border-b border-white/10 bg-[#102d26]">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div><p className="font-display text-2xl font-bold">Cappadocia is easier with a local expert.</p><p className="mt-1 text-sm text-white/60">Tell us your dates and we’ll help build your itinerary.</p></div>
            <a href={whatsappUrl('Hello 👋 I would like help planning my Cappadocia trip.')} target="_blank" rel="noreferrer" data-event="whatsapp_click" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 font-extrabold"><MessageCircle className="h-5 w-5" /> Chat with our local team</a>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image src="/logo.png" width={180} height={50} alt="Discovery Cappadocia" className="h-auto w-44" />
            <p className="mt-5 text-sm font-semibold text-white/80">{SITE.legalName}</p>
            <p className="mt-2 text-sm leading-7 text-white/55">A local Cappadocia booking team for balloon flights, guided tours, adventures and airport transfers.</p>
            <div className="mt-5 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4"><BadgeCheck className="h-6 w-6 shrink-0 text-amber-300" /><div><p className="text-sm font-bold">Licensed Travel Agency</p><p className="mt-1 text-xs text-white/45">TÜRSAB No: {SITE.tursabNumber}</p></div></div>
          </div>
          <div><h3 className="font-bold">Quick links</h3><ul className="mt-5 space-y-3">{quick.map(([label, href]) => <li key={label}><Link href={href} className="text-sm text-white/55 hover:text-amber-300">{label}</Link></li>)}</ul></div>
          <div><h3 className="font-bold">Customer support</h3><ul className="mt-5 space-y-3">{support.map(([label, href]) => <li key={label}><Link href={href} className="text-sm text-white/55 hover:text-amber-300">{label}</Link></li>)}</ul></div>
          <div><h3 className="font-bold">Contact</h3><ul className="mt-5 space-y-4 text-sm text-white/55">
            <li className="flex gap-3"><MessageCircle className="h-5 w-5 shrink-0 text-emerald-400" /><a href={whatsappUrl()} target="_blank" rel="noreferrer" data-event="whatsapp_click">WhatsApp: {SITE.phoneDisplay}</a></li>
            <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-emerald-400" /><a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a></li>
            <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0 text-emerald-400" /><a href={`mailto:${SITE.email}`} className="break-all">{SITE.email}</a></li>
            <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-emerald-400" /><span>{SITE.address}</span></li>
          </ul></div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-5 border-t border-white/10 pt-7 text-xs text-white/38 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4"><span className="flex items-center gap-1"><LockKeyhole className="h-4 w-4" /> SSL secured</span><span>Visa</span><span>Mastercard</span><span>3D Secure where supported</span></div>
        </div>
      </div>
    </footer>
  );
}
