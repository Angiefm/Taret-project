export interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string;
  amenities: string[];
  rating: number;
  totalReviews: number;
  imageUrls: string[];
  imageUrl?: string;   // primera imagen como principal
  capacity: number;
  totalCapacity?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  minPrice?: number;
}

export interface ApiHotelResponse {
  _id: string;
  name: string;
  location: string;
  description: string;
  amenities: string[];
  rating: number;
  totalReviews: number;
  imageUrls: string[];
  isActive: boolean;
  totalCapacity?: number;
  createdAt: string;
  updatedAt: string;
  minPrice?: number;
}

export interface HotelSearchResponse {
  hotels: Hotel[];
  total: number;
  page: number;
  totalPages: number;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'name';
