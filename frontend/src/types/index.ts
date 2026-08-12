export interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string;
  category: TourCategory;
  basePrice: number;
  regularPrice?: number;
  discountedPrice?: number | null;
  currency: string;
  tourType?: 'GROUP' | 'PRIVATE' | 'PACKAGE' | 'TRANSFER' | 'ACTIVITY';
  childPriceRate?: number;
  privatePriceMultiplier?: number;
  duration: string;
  startTime?: string | null;
  endTime?: string | null;
  maxCapacity: number;
  minParticipants?: number;
  defaultCapacity?: number;
  images: string[];
  image?: string | null;
  media?: TourImage[];
  videoUrl?: string;
  highlights: string[];
  includes: string[];
  excludes: string[];
  isActive: boolean;
  isFeatured?: boolean;
  isBookingEnabled?: boolean;
  meetingPoint?: string | null;
  cancellationPolicy?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  contentLocale?: string;
  sortOrder: number;
  upsells: TourUpsell[];
  availabilities?: Availability[];
}

export interface TourImage {
  id: string;
  secureUrl: string;
  altText?: string | null;
  isCover: boolean;
  sortOrder: number;
  width?: number | null;
  height?: number | null;
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
    totalPages: number;
    pages: number;
  };
}
