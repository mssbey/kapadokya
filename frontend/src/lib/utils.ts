import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    BALLOON: 'Balloon Tour',
    DAILY_TOUR: 'Daily Tour',
    ADVENTURE: 'Adventure',
    TRANSFER: 'Private Transfer',
  };
  return labels[category] || category;
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    BALLOON: '🎈',
    DAILY_TOUR: '🏛️',
    ADVENTURE: '🏔️',
    TRANSFER: '🚗',
  };
  return icons[category] || '✨';
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
