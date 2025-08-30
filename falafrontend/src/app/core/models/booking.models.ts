import { Room } from './room.model';

export interface BookingFormData {
  guestInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };

  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface Booking {
  id: string;
  userId?: string;
  bookingNumber: string;

  // info del huésped
  guestInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };

  // info de la reserva
  hotel: {
    id: string;
    name: string;
    location: string;
  };

  room: {
    id: string;
    roomType: string;
    capacity: number;
    pricePerNight: number;
    bedDetails: string;
  };

  // fechas y duración
  checkInDate: Date;
  checkOutDate: Date;
  numberOfNights: number;
  numberOfGuests: number;

  // precios
  priceBreakdown: {
    subtotal: number;
    taxes: number;
    fees: number;
    total: number;
  };

  // estado y metadatos
  status: BookingStatus;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;

  payment?: {
    status: PaymentStatus;
    method: string;
    transactionId?: string;
    paidAt?: Date;
  };

  cancellation?: {
    cancelledAt: Date;
    reason: string;
    refundAmount?: number;
    refundedAt?: Date;
  };

  confirmations?: {
    emailSent: boolean;
    emailSentAt?: Date;
    whatsappSent: boolean;
    whatsappSentAt?: Date;
  };
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

export interface BookingResponse {
  success: boolean;
  data?: Booking;
  message: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface BookingSearchParams {
  userId?: string;
  email?: string;
  bookingNumber?: string;
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface BookingListResponse {
  success: boolean;
  bookings: Booking[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export interface PriceCalculationRequest {
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
}

export interface PriceCalculationResponse {
  success: boolean;
  totalPrice: number;
  breakdown: {
    pricePerNight: number;
    numberOfNights: number;
    subtotal: number;
    taxes: number;
    fees: number;
    total: number;
  };
}