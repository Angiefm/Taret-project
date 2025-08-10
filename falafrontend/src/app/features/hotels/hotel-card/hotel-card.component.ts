// src/app/features/hotels/hotel-card/hotel-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hotel } from '../../../core/models/hotel';

@Component({
  selector: 'app-hotel-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hotel-card" (click)="onCardClick()">
      <!-- Hotel Image Placeholder -->
      <div class="image-container">
        <div class="image-placeholder">
          <div class="placeholder-content">
            <div class="placeholder-icon"></div>
            <p>imagen del hotel</p>
          </div>
        </div>
        
        <!-- Rating Badge -->
        <div class="rating-badge">
          <span class="star">⭐</span>
          <span class="rating-value">{{ hotel.rating }}</span>
        </div>
      </div>

      <!-- Hotel Info -->
      <div class="hotel-info">
        <!-- Hotel Name -->
        <h3 class="hotel-name">{{ hotel.name }}</h3>
        
        <!-- Location -->
        <div class="location">
          <span class="location-icon">📍</span>
          <span class="location-text">{{ hotel.location }}</span>
        </div>

        <!-- Amenities -->
        <div class="amenities">
          <div class="amenity-tag" *ngFor="let amenity of getDisplayAmenities()">
            <span class="amenity-icon">{{ getAmenityIcon(amenity) }}</span>
            <span class="amenity-text">{{ amenity }}</span>
          </div>
        </div>

        <!-- Price and Reserve Button -->
        <div class="bottom-section">
          <div class="price-section">
            <span class="price">\${{ formatPrice(hotel.price) }}</span>
            <span class="price-period">cop / noche</span>
          </div>
          <button 
            class="reserve-btn" 
            (click)="onReserveClick($event)">
            reservar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hotel-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      border-top: 4px solid #fb7185;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .hotel-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .image-container {
      position: relative;
      height: 12rem;
      background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .placeholder-content {
      text-align: center;
      color: #6b7280;
    }

    .placeholder-icon {
      width: 4rem;
      height: 4rem;
      background-color: #9ca3af;
      border-radius: 0.5rem;
      margin: 0 auto 0.5rem;
      opacity: 0.5;
    }

    .placeholder-content p {
      font-size: 0.875rem;
      margin: 0;
    }

    .rating-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: white;
      padding: 0.5rem 0.75rem;
      border-radius: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #fce7e9;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .star {
      font-size: 1rem;
      color: #fb7185;
    }

    .rating-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }

    .hotel-info {
      padding: 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .hotel-name {
      font-size: 1.25rem;
      font-family: serif;
      color: #334155;
      margin: 0 0 0.75rem 0;
      font-weight: 500;
      line-height: 1.3;
      transition: color 0.3s ease;
    }

    .hotel-card:hover .hotel-name {
      color: #0d9488;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #6b7280;
    }

    .location-icon {
      font-size: 0.875rem;
    }

    .location-text {
      font-size: 0.875rem;
    }

    .amenities {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex: 1;
    }

    .amenity-tag {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background-color: #f3f4f6;
      border: 1px solid #fce7e9;
      padding: 0.375rem 0.75rem;
      border-radius: 1.5rem;
      font-size: 0.75rem;
      color: #374151;
      transition: all 0.3s ease;
    }

    .amenity-tag:hover {
      background-color: #fef2f2;
      border-color: #fb7185;
    }

    .amenity-icon {
      font-size: 0.875rem;
      color: #fb7185;
    }

    .amenity-text {
      font-weight: 500;
    }

    .bottom-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .price-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #334155;
    }

    .price-period {
      font-size: 0.75rem;
      color: #6b7280;
      margin-left: 0.25rem;
    }

    .reserve-btn {
      background-color: #0d9488;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.025em;
    }

    .reserve-btn:hover {
      background-color: #0f766e;
      transform: translateY(-1px);
    }

    .reserve-btn:active {
      transform: translateY(0);
    }

    @media (max-width: 768px) {
      .hotel-info {
        padding: 1rem;
      }

      .hotel-name {
        font-size: 1.125rem;
      }

      .price {
        font-size: 1.25rem;
      }

      .bottom-section {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .reserve-btn {
        width: 100%;
      }
    }
  `]
})
export class HotelCardComponent {
  @Input() hotel!: Hotel;
  @Output() reserveClicked = new EventEmitter<Hotel>();
  @Output() detailsClicked = new EventEmitter<Hotel>();

  onCardClick(): void {
    this.detailsClicked.emit(this.hotel);
  }

  onReserveClick(event: Event): void {
    event.stopPropagation();
    this.reserveClicked.emit(this.hotel);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CO');
  }

  getDisplayAmenities(): string[] {
    return this.hotel.amenities.slice(0, 3);
  }

  getAmenityIcon(amenity: string): string {
    const iconMap: { [key: string]: string } = {
      'wifi': '📶',
      'estacionamiento': '🚗',
      'restaurant': '🍽️',
      'café': '☕',
      'piscina': '🏊',
      'gimnasio': '💪',
      'spa': '🧘'
    };
    return iconMap[amenity.toLowerCase()] || '✨';
  }
}