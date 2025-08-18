export interface BookingFormData {
  // info del usuario
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  
  // info de la reserva
  hotelId: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  
  // info adicional
  specialRequests?: string;
  totalPrice: number;
}

export interface Booking {
  id: string;
  userId?: string; // Si está autenticado
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
    type: string;
    capacity: number;
    pricePerNight: number;
  };
  
  // fechas y duración
  checkInDate: Date;
  checkOutDate: Date;
  numberOfNights: number;
  numberOfGuests: number;
  
  // precios
  priceBreakdown: {
    roomRate: number;
    taxes: number;
    fees: number;
    total: number;
  };
  
  // estado y metadatos
  status: BookingStatus;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Información de pago (si se implementa)
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
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
  bookings: Booking[];
  total: number;
  page: number;
  totalPages: number;
}