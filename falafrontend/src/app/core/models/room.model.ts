export interface Room {
  id: string;
  hotelId: string;
  name: string;
  roomType: 'single-1' | 'single-2' | 'single-3' | 'suite' | 'suite-kid';
  pricePerNight: number;
  isAvailable: boolean;
  capacity: number;
  bedDetails: string;
  amenities?: string[];
  description?: string;
  imageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiRoomResponse {
  _id: string;
  hotelId: string;
  name?: string;
  roomType: 'single-1' | 'single-2' | 'single-3' | 'suite' | 'suite-kid';
  pricePerNight: number;
  isAvailable: boolean;
  capacity: number;
  bedDetails: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomSearchCriteria {
  hotelId: string;
  checkIn?: string;
  checkOut?: string;
  guests: number;
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface RoomAvailability {
  room: Room;
  isAvailable: boolean;
  totalPrice: number;
  priceBreakdown: {
    subtotal: number;
    taxes: number;
    fees: number;
    nights: number;
  };
}

export type RoomTypeDisplay = {
  [key in Room['roomType']]: {
    name: string;
    description: string;
    icon: string;
  };
};

export const ROOM_TYPE_INFO: RoomTypeDisplay = {
  'single-1': {
    name: 'Individual Estándar',
    description: 'Habitación cómoda para 1 persona',
    icon: '🛏️'
  },
  'single-2': {
    name: 'Individual Premium',
    description: 'Habitación premium para 1 persona con amenidades adicionales',
    icon: '🛏️'
  },
  'single-3': {
    name: 'Individual Deluxe',
    description: 'Habitación deluxe para 1 persona con vista privilegiada',
    icon: '🛏️'
  },
  'suite': {
    name: 'Suite',
    description: 'Amplia suite con sala de estar separada',
    icon: '🏨'
  },
  'suite-kid': {
    name: 'Suite Familiar',
    description: 'Suite especial para familias con niños',
    icon: '👨‍👩‍👧‍👦'
  }
};