'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ResponsivePhoto } from '@/components/ResponsivePhoto';
import { useI18n } from '@/components/I18nProvider';
import { getPublicCategories, type Category } from '@/lib/catalogApi';

const CATEGORY_ASSETS: Record<string, { src: string; positionClassName?: string }> = {
  'hot-air-balloon': {
    src: '/images/category-hot-air-balloon.webp',
    positionClassName: 'object-[46%_center]',
  },
  'daily-tours': {
    src: '/images/category-daily-tours.webp',
    positionClassName: 'object-[56%_center]',
  },
  adventure: {
    src: '/images/category-adventure.webp',
    positionClassName: 'object-[48%_center]',
  },
  'airport-transfer': {
    src: '/images/category-airport-transfer.webp',
    positionClassName: 'object-[58%_center]',
  },
};

const GENERIC_CATEGORY_ASSET = '/images/cappadocia-routes-aerial.webp';

export function CategoryShowcase() {
  const { t, href } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden bg-[#f3f0e9] py-20 dark:bg-[#07100e] md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-emerald-400/[0.08] blur-3xl dark:bg-emerald-400/[0.06]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-8 md:mb-12">
          <div className="max-w-4xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-emerald-600 dark:bg-emerald-400" />
              <p className="text-[11px] font-bold uppercase tracking-[.28em] text-emerald-700 dark:text-emerald-400">
                {t.categories.eyebrow}
              </p>
            </div>
            <h2 className="text-balance font-display text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-stone-950 dark:text-white sm:text-5xl lg:text-6xl">
              {t.categories.heading}
            </h2>
          </div>
          <div aria-hidden="true" className="mb-2 hidden items-center gap-4 lg:flex">
            <span className="h-px w-20 bg-stone-300 dark:bg-white/15" />
            <span className="font-body text-[11px] font-semibold tracking-[.24em] text-stone-400 dark:text-white/35">
              01 &mdash; {String(loading ? 4 : categories.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[22rem] animate-pulse rounded-[1.75rem] border border-stone-200/80 bg-stone-200/70 dark:border-white/10 dark:bg-white/5 lg:h-[23rem]"
                />
              ))
            : categories.map((category, index) => {
                const asset = CATEGORY_ASSETS[category.slug];
                const imageSrc = category.imageUrl || asset?.src || GENERIC_CATEGORY_ASSET;

                return (
                  <Link
                    key={category.id}
                    href={href(`/tours?category=${category.slug}`)}
                    aria-label={category.name}
                    className="group relative flex h-[22rem] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-black/5 bg-emerald-950 shadow-[0_18px_50px_-28px_rgba(25,35,30,0.6)] outline-none transition duration-500 hover:-translate-y-1.5 hover:border-emerald-500/30 hover:shadow-[0_28px_65px_-30px_rgba(5,46,34,0.75)] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f3f0e9] dark:border-white/10 dark:focus-visible:ring-offset-[#07100e] lg:h-[23rem]"
                  >
                    <ResponsivePhoto
                      src={imageSrc}
                      alt={category.name}
                      positionClassName={category.imageUrl ? undefined : asset?.positionClassName}
                      className="scale-[1.015] transition duration-700 ease-out group-hover:scale-[1.075]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/0 to-black/90" />
                    <div className="absolute inset-0 bg-emerald-950/0 transition duration-500 group-hover:bg-emerald-950/10" />

                    <div className="relative flex items-center justify-between p-5 sm:p-6">
                      <span className="rounded-full border border-white/25 bg-black/10 px-3 py-1.5 font-body text-[10px] font-bold tracking-[.2em] text-white/90 backdrop-blur-md">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px w-8 bg-white/45 transition-all duration-500 group-hover:w-12 group-hover:bg-emerald-300" />
                    </div>

                    <div className="relative p-5 pt-10 sm:p-6 sm:pt-12">
                      <div className="mb-4 h-px w-full bg-white/20" />
                      <div className="flex items-end justify-between gap-4">
                        <h3 className="max-w-[12rem] font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-white">
                          {category.name}
                        </h3>
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition duration-500 group-hover:rotate-45 group-hover:border-emerald-300 group-hover:bg-emerald-400 group-hover:text-emerald-950">
                          <ArrowUpRight className="h-5 w-5" strokeWidth={1.8} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
