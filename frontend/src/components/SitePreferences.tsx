'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Currency = 'EUR' | 'USD' | 'GBP' | 'TRY';
type Locale = 'EN' | 'TR' | 'ES' | 'IT' | 'RU';

const rates: Record<Currency, number> = { EUR: 1, USD: 1.09, GBP: 0.86, TRY: 38 };
const symbols: Record<Currency, string> = { EUR: '€', USD: '$', GBP: '£', TRY: '₺' };

type Preferences = {
  currency: Currency;
  locale: Locale;
  setCurrency: (currency: Currency) => void;
  setLocale: (locale: Locale) => void;
  price: (eur: number) => string;
};

const PreferencesContext = createContext<Preferences | null>(null);

export function SitePreferences({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [locale, setLocale] = useState<Locale>('EN');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('dc_currency') as Currency | null;
    const savedLocale = localStorage.getItem('dc_locale') as Locale | null;
    if (savedCurrency && savedCurrency in rates) setCurrency(savedCurrency);
    if (savedLocale && ['EN', 'TR', 'ES', 'IT', 'RU'].includes(savedLocale)) setLocale(savedLocale);
  }, []);

  const value = useMemo<Preferences>(() => ({
    currency,
    locale,
    setCurrency: (next) => { setCurrency(next); localStorage.setItem('dc_currency', next); },
    setLocale: (next) => { setLocale(next); localStorage.setItem('dc_locale', next); },
    price: (eur) => `${symbols[currency]}${Math.round(eur * rates[currency]).toLocaleString('en-US')}`,
  }), [currency, locale]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function useSitePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('useSitePreferences must be used within SitePreferences');
  return value;
}

