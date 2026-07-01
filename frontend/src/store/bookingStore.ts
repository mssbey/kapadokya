import { create } from 'zustand';
import type { BookingFormData, SelectedUpsell, Tour, Availability } from '@/types';

interface BookingState {
  step: number;
  selectedTour: Tour | null;
  selectedDate: string;
  selectedAvailability: Availability | null;
  adults: number;
  children: number;
  isPrivate: boolean;
  selectedUpsells: SelectedUpsell[];
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes: string;
  totalPrice: number;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setTour: (tour: Tour) => void;
  setDate: (date: string, availability: Availability) => void;
  setPeople: (adults: number, children: number, isPrivate: boolean) => void;
  toggleUpsell: (upsell: SelectedUpsell) => void;
  setGuestInfo: (name: string, email: string, phone: string, notes?: string) => void;
  calculateTotal: () => void;
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
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  notes: '',
  totalPrice: 0,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 7) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),

  setTour: (tour) => {
    set({ selectedTour: tour, selectedDate: '', selectedAvailability: null, selectedUpsells: [] });
    get().calculateTotal();
  },

  setDate: (date, availability) => {
    set({ selectedDate: date, selectedAvailability: availability });
    get().calculateTotal();
  },

  setPeople: (adults, children, isPrivate) => {
    set({ adults, children, isPrivate });
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

  setGuestInfo: (guestName, guestEmail, guestPhone, notes = '') => {
    set({ guestName, guestEmail, guestPhone, notes });
  },

  calculateTotal: () => {
    const state = get();
    if (!state.selectedTour) return;

    const unitPrice = state.selectedAvailability?.priceOverride || state.selectedTour.basePrice;
    const childDiscount = 0.5;

    let total = state.adults * unitPrice + state.children * unitPrice * childDiscount;

    if (state.isPrivate) {
      total *= 1.5;
    }

    const totalPeople = state.adults + state.children;
    const upsellTotal = state.selectedUpsells.reduce((sum, u) => sum + u.price, 0);
    total += upsellTotal * totalPeople;

    set({ totalPrice: Math.round(total * 100) / 100 });
  },

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
      guestName: '',
      guestEmail: '',
      guestPhone: '',
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
      guestName: s.guestName,
      guestEmail: s.guestEmail,
      guestPhone: s.guestPhone,
      notes: s.notes || undefined,
    };
  },
}));
