'use client';

import { useSitePreferences } from '@/components/SitePreferences';
import type { Tour } from '@/types';

type Props = {
  tour: Tour;
  fromLabel: string;
};

export function TourCardPrice({ tour, fromLabel }: Props) {
  const { price } = useSitePreferences();
  const hasDiscount = tour.discountedPrice != null && tour.regularPrice != null && tour.discountedPrice < tour.regularPrice;

  return (
    <div>
      <p className="text-xs text-stone-400">{fromLabel}</p>
      {hasDiscount && (
        <p className="mt-0.5 text-sm font-semibold text-stone-400 line-through decoration-stone-500 decoration-2 dark:text-white/40">
          {price(tour.regularPrice!, tour.currency)}
        </p>
      )}
      <p className={`${hasDiscount ? 'mt-0.5 text-emerald-700 dark:text-emerald-400' : 'mt-1'} text-2xl font-extrabold`}>
        {price(hasDiscount ? tour.discountedPrice! : tour.basePrice, tour.currency)}
      </p>
    </div>
  );
}
