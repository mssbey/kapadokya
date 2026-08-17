import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// `locale` is a BCP-47 tag (see LOCALE_TAGS). Callers in localized UI pass the
// active tag from useI18n(); the default keeps non-localized surfaces working.
export function formatPrice(amount: number, currency: string = 'EUR', locale: string = 'en-GB'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, locale: string = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date, locale: string = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

// Keyed by category slug. New admin-created categories fall back to a
// generic sparkle rather than needing an icon assigned up front.
export function getCategoryIcon(categorySlug: string): string {
  const icons: Record<string, string> = {
    'hot-air-balloon': '🎈',
    'daily-tours': '🏛️',
    adventure: '🏔️',
    'airport-transfer': '🚗',
  };
  return icons[categorySlug] || '✨';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'text-yellow-400',
    CONFIRMED: 'text-emerald-400',
    CANCELLED: 'text-red-400',
    COMPLETED: 'text-blue-400',
  };
  return colors[status] || 'text-white/60';
}
