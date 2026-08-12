/** Truly static company settings. Sellable catalog data lives in PostgreSQL. */
export const SITE = {
  name: 'Discovery Cappadocia',
  legalName: 'Cappadocia Kaphera Travel Agency',
  phoneDisplay: '+90 540 101 50 50',
  phone: '+905401015050',
  email: 'iletisim@kapheratravel.com',
  address: 'Cappadocia, Nevşehir, Türkiye',
  tursabNumber: '18577',
} as const;

export function whatsappUrl(message: string) {
  return `https://wa.me/${SITE.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
