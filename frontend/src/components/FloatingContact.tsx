'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, MessageCircle, X } from 'lucide-react';
import { whatsappUrl } from '@/lib/site';
import { useI18n } from '@/components/I18nProvider';
import { useInstagramUrl } from '@/lib/useSiteSettings';
import { stripLocale } from '@/lib/i18n';

// Icons and targets are language-independent; labels come from `chat.choices`.
const choiceTargets = [
  ['🎈', '/tours/cappadocia-hot-air-balloon'],
  ['🏍️', '/tours/cappadocia-sunset-atv-tour'],
  ['🐎', '/tours/cappadocia-horse-riding'],
  ['🚙', '/tours/cappadocia-jeep-safari'],
  ['🗺️', '/tours?category=daily-tours'],
  ['✈️', '/tours/cappadocia-airport-transfer'],
] as const;

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { t, href } = useI18n();
  const instagramUrl = useInstagramUrl();
  const pathname = usePathname();
  // Never pop the panel open over the booking funnel — the button stays available.
  const inBookingFlow = stripLocale(pathname || '/').startsWith('/booking');

  useEffect(() => {
    if (inBookingFlow) {
      setOpen(false);
      return;
    }
    if (sessionStorage.getItem('dc_chat_dismissed')) return;
    const timer = window.setTimeout(() => setOpen(true), 7000);
    return () => window.clearTimeout(timer);
  }, [inBookingFlow]);

  function close() {
    setOpen(false);
    setDismissed(true);
    sessionStorage.setItem('dc_chat_dismissed', '1');
  }

  return (
    <div className="fixed bottom-5 right-4 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#101815]">
          <div className="flex items-start justify-between bg-[#123f35] p-5 text-white">
            <div><p className="font-display text-xl font-bold">👋 {t.chat.greetingTitle}</p><p className="mt-1 text-sm text-white/70">{t.chat.greetingText}</p></div>
            <button onClick={close} aria-label={t.chat.closeLabel} className="rounded-full p-1 hover:bg-white/10"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4">
            {choiceTargets.map(([icon, target], index) => (
              <Link key={target} href={href(target)} onClick={() => setOpen(false)} className="rounded-xl border border-stone-200 p-3 text-sm font-semibold text-stone-700 transition hover:border-emerald-400 hover:bg-emerald-50 dark:border-white/10 dark:text-white/75 dark:hover:bg-white/5">{icon} {t.chat.choices[index]}</Link>
            ))}
            <a href={whatsappUrl(t.chat.otherMessage)} target="_blank" rel="noreferrer" data-event="whatsapp_click" className="col-span-2 rounded-xl bg-[#25D366] p-3 text-center text-sm font-extrabold text-white">💬 {t.chat.other}</a>
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-stone-200 p-3 text-sm font-semibold text-stone-700 dark:border-white/10 dark:text-white/75">
                <Instagram className="h-4 w-4" /> {t.balloon.instagramCta}
              </a>
            )}
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} aria-label={t.chat.openLabel} className="relative grid h-16 w-16 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_35px_rgba(37,211,102,.38)] transition hover:scale-105">
        <MessageCircle className="h-8 w-8 fill-current" />
        {!open && !dismissed && <span className="absolute -right-1 -top-1 h-4 w-4 animate-pulse rounded-full border-2 border-white bg-rose-500" />}
      </button>
    </div>
  );
}
