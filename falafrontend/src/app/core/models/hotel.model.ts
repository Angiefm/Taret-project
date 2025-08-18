export interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string;
  amenities: string[];
  price: number;
  basePrice?: number;
  rating: number;
  totalReviews: number;
  imageUrls: string[];
  imageUrl?: string; // primera imagen como principal
  capacity: number;
  totalCapacity?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiHotelResponse {
  _id: string;
  name: string;
  location: string;
  description: string;
  amenities: string[];
  basePrice: number;
  rating: number;
  totalReviews: number;
  imageUrls: string[];
  isActive: boolean;
  totalCapacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchCriteria {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface HotelSearchResponse {
  hotels: Hotel[];
  total: number;
  page: number;
  totalPages: number;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'name';