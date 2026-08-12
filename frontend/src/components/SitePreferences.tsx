'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

type Currency = 'EUR' | 'USD' | 'GBP' | 'TRY';

const rates: Record<Currency, number> = { EUR: 1, USD: 1.09, GBP: 0.86, TRY: 38 };

type Preferences = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  /** Converts a supported source currency and formats it for the visitor. */
  price: (amount: number, sourceCurrency?: string) => string;
};

const PreferencesContext = createContext<Preferences | null>(null);

// Language now lives in the URL (see I18nProvider); this provider only owns currency.
export function SitePreferences({ children }: { children: React.ReactNode }) {
  const { tag } = useI18n();
  const [currency, setCurrency] = useState<Currency>('EUR');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('dc_currency') as Currency | null;
    if (savedCurrency && savedCurrency in rates) setCurrency(savedCurrency);
  }, []);

  const value = useMemo<Preferences>(
    () => ({
      currency,
      setCurrency: (next) => {
        setCurrency(next);
        localStorage.setItem('dc_currency', next);
      },
      price: (amount, sourceCurrency = 'EUR') =>
        new Intl.NumberFormat(tag, {
          style: 'currency',
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Math.round((amount / (rates[sourceCurrency as Currency] || 1)) * rates[currency])),
    }),
    [currency, tag],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function useSitePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('useSitePreferences must be used within SitePreferences');
  return value;
}
