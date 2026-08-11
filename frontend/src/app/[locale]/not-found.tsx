'use client';

import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';

export default function NotFound() {
  const { t, href } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f6f1] px-4 pt-20 text-center dark:bg-dark">
      <div>
        <p className="font-display text-8xl font-bold text-emerald-700">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold">{t.notFound.title}</h1>
        <p className="mt-3 text-stone-500 dark:text-white/50">{t.notFound.text}</p>
        <Link href={href('/tours')} className="mt-7 inline-block rounded-xl bg-[#123f35] px-6 py-4 font-bold text-white">{t.notFound.cta}</Link>
      </div>
    </div>
  );
}
