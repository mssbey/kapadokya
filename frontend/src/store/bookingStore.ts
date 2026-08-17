import { create } from 'zustand';
import type { BookingFormData, SelectedUpsell, SelectedVariant, Tour, Availability } from '@/types';

interface BookingState {
  step: number;
  selectedTour: Tour | null;
  selectedDate: string;
  selectedAvailability: Availability | null;
  adults: number;
  children: number;
  isPrivate: boolean;
  selectedUpsells: SelectedUpsell[];
  selectedVariant: SelectedVariant | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  hotelName: string;
  notes: string;
  totalPrice: number;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setTour: (tour: Tour) => void;
  setDate: (date: string, availability: Availability) => void;
  setPeople: (guests: number, isPrivate: boolean) => void;
  toggleUpsell: (upsell: SelectedUpsell) => void;
  setVariant: (variant: SelectedVariant | null) => void;
  setGuestInfo: (name: string, email: string, phone: string, hotelName: string, notes?: string) => void;
  calculateTotal: () => void;
  setTotalPrice: (totalPrice: number) => void;
  reset: () => void;
  getFormData: () => BookingFormData;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  step: 1,
  selectedTour: null,
  selectedDate: '',
  selectedAvailability: null,
  adults: 1,
  children: 0,
  isPrivate: false,
  selectedUpsells: [],
  selectedVariant: null,
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  hotelName: '',
  notes: '',
  totalPrice: 0,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 7) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),

  setTour: (tour) => {
    set({ selectedTour: tour, selectedDate: '', selectedAvailability: null, selectedUpsells: [], selectedVariant: null });
    get().calculateTotal();
  },

  setDate: (date, availability) => {
    set({ selectedDate: date, selectedAvailability: availability });
    get().calculateTotal();
  },

  setPeople: (adults, isPrivate) => {
    set({ adults, children: 0, isPrivate });
    get().calculateTotal();
  },

  toggleUpsell: (upsell) => {
    set((s) => {
      const exists = s.selectedUpsells.find((u) => u.id === upsell.id);
      const selectedUpsells = exists
        ? s.selectedUpsells.filter((u) => u.id !== upsell.id)
        : [...s.selectedUpsells, upsell];
      return { selectedUpsells };
    });
    get().calculateTotal();
  },

  setVariant: (variant) => {
    set({ selectedVariant: variant });
    get().calculateTotal();
  },

  setGuestInfo: (guestName, guestEmail, guestPhone, hotelName, notes = '') => {
    set({ guestName, guestEmail, guestPhone, hotelName, notes });
  },

  calculateTotal: () => {
    const state = get();
    if (!state.selectedTour) return;

    const unitPrice = state.selectedAvailability?.priceOverride || state.selectedTour.basePrice;
    let total = state.adults * unitPrice;

    if (state.isPrivate) {
      total *= state.selectedTour.privatePriceMultiplier ?? 1.5;
    }

    const upsellTotal = state.selectedUpsells.reduce((sum, u) => sum + u.price, 0);
    total += upsellTotal * state.adults;

    total += (state.selectedVariant?.priceDelta ?? 0) * state.adults;

    set({ totalPrice: Math.round(total * 100) / 100 });
  },
  setTotalPrice: (totalPrice) => set({ totalPrice }),

  reset: () =>
    set({
      step: 1,
      selectedTour: null,
      selectedDate: '',
      selectedAvailability: null,
      adults: 1,
      children: 0,
      isPrivate: false,
      selectedUpsells: [],
      selectedVariant: null,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      hotelName: '',
      notes: '',
      totalPrice: 0,
    }),

  getFormData: (): BookingFormData => {
    const s = get();
    return {
      tourId: s.selectedTour?.id || '',
      date: s.selectedDate,
      adults: s.adults,
      children: s.children,
      isPrivate: s.isPrivate,
      upsells: s.selectedUpsells,
      variantId: s.selectedVariant?.id,
      guestName: s.guestName,
      guestEmail: s.guestEmail,
      guestPhone: s.guestPhone,
      hotelName: s.hotelName,
      notes: s.notes || undefined,
    };
  },
}));
