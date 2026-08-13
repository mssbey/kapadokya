'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

type Currency = 'EUR' | 'USD' | 'GBP' | 'TRY';

const rates: Record<Currency, number> = { EUR: 1, USD: 1.09, GBP: 0.86, TRY: 38 };

/** Currency a visitor sees by default for each site language, before they pick one manually. */
const LOCALE_CURRENCY: Record<string, Currency> = { tr: 'TRY' };
const DEFAULT_CURRENCY: Currency = 'EUR';

type Preferences = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  /** Converts a supported source currency and formats it for the visitor. */
  price: (amount: number, sourceCurrency?: string) => string;
};

const PreferencesContext = createContext<Preferences | null>(null);

// Language now lives in the URL (see I18nProvider); this provider only owns currency.
export function SitePreferences({ children }: { children: React.ReactNode }) {
  const { tag, locale } = useI18n();
  const [currency, setCurrencyState] = useState<Currency>(LOCALE_CURRENCY[locale] || DEFAULT_CURRENCY);
  // Once a visitor picks a currency by hand, that choice sticks across language
  // switches instead of being overridden by the locale default below.
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('dc_currency') as Currency | null;
    const wasManual = localStorage.getItem('dc_currency_manual') === '1';
    if (savedCurrency && savedCurrency in rates && wasManual) {
      setManual(true);
      setCurrencyState(savedCurrency);
    }
  }, []);

  // A guest reading the Turkish site sees Turkish Lira automatically, and
  // switching back to another language reverts to EUR — unless they've
  // manually chosen a currency, which always wins.
  useEffect(() => {
    if (manual) return;
    setCurrencyState(LOCALE_CURRENCY[locale] || DEFAULT_CURRENCY);
  }, [locale, manual]);

  const value = useMemo<Preferences>(
    () => ({
      currency,
      setCurrency: (next) => {
        setManual(true);
        setCurrencyState(next);
        localStorage.setItem('dc_currency', next);
        localStorage.setItem('dc_currency_manual', '1');
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
