'use client';

import { useI18n } from '@/components/I18nProvider';

/**
 * Builds the "2 Adults, 1 Child" line. Singular/plural forms live in the
 * dictionaries so each language picks its own wording.
 */
export function useGuestLabel() {
  const { t, fill } = useI18n();

  return function guestLabel(adults: number, children: number, isPrivate = false): string {
    const parts: string[] = [];

    if (adults > 0) {
      const template = adults === 1 ? t.booking.guests.adults : t.booking.guests.adultsPlural;
      parts.push(fill(template, { count: adults }));
    }
    if (children > 0) {
      const template = children === 1 ? t.booking.guests.children : t.booking.guests.childrenPlural;
      parts.push(fill(template, { count: children }));
    }

    const label = parts.join(', ');
    return isPrivate ? `${label} ${t.booking.guests.private}` : label;
  };
}
