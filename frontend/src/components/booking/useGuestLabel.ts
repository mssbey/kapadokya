'use client';

import { useI18n } from '@/components/I18nProvider';

/**
 * Builds the single-price guest count line.
 */
export function useGuestLabel() {
  const { t, fill } = useI18n();

  return function guestLabel(guests: number, isPrivate = false): string {
    const template = guests === 1 ? t.booking.guests.adults : t.booking.guests.adultsPlural;
    const label = fill(template, { count: guests });
    return isPrivate ? `${label} ${t.booking.guests.private}` : label;
  };
}
