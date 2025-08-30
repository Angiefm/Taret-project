export interface Room {
  id: string;
  hotelId: string;
  roomType: 'single-1' | 'single-2' | 'single-3' | 'suite' | 'suite-kid';
  pricePerNight: number;
  isActive: boolean;
  capacity: number;
  bedDetails: string;
  amenities: string[];
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
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
    description: 'Habitación premium con amenidades adicionales',
    icon: '🛏️'
  },
  'single-3': {
    name: 'Individual Deluxe',
    description: 'Habitación deluxe con vista privilegiada',
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
