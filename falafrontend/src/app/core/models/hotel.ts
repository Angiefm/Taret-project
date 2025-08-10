export interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  amenities: string[];
  imageUrl?: string;
  description?: string;
  capacity?: number;
}
