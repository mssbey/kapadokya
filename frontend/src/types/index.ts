export interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string;
  category: TourCategory;
  basePrice: number;
  currency: string;
  duration: string;
  maxCapacity: number;
  images: string[];
  videoUrl?: string;
  highlights: string[];
  includes: string[];
  excludes: string[];
  isActive: boolean;
  sortOrder: number;
  upsells: TourUpsell[];
  availabilities?: Availability[];
}

export interface TourUpsell {
  id: string;
  tourId: string;
  name: string;
  description: string;
  price: number;
  icon?: string;
  isActive: boolean;
}

export interface Availability {
  id: string;
  tourId: string;
  date: string;
  seatsAvailable: number;
  seatsTotal: number;
  priceOverride: number | null;
  isBlocked: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  tourId: string;
  date: string;
  adults: number;
  children: number;
  isPrivate: boolean;
  upsells: SelectedUpsell[] | null;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  notes?: string;
  tour: Tour;
  payment?: Payment;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerPaymentId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface SelectedUpsell {
  id: string;
  name: string;
  price: number;
}

export type TourCategory = 'BALLOON' | 'DAILY_TOUR' | 'ADVENTURE' | 'TRANSFER';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentProvider = 'STRIPE' | 'IYZICO';

export interface BookingFormData {
  tourId: string;
  date: string;
  adults: number;
  children: number;
  isPrivate: boolean;
  upsells: SelectedUpsell[];
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
