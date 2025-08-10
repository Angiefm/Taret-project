import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelCardComponent } from '../../features/hotels/hotel-card/hotel-card.component';
import { Hotel } from '../../core/models/hotel';
import { SearchCriteria } from '../../core/models/search-criteria';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HotelCardComponent],
  template: `
    <!-- Hero Section with Search -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">Encuentra tu refugio perfecto 💙</h1>
          <div class="title-accent"></div>
          <p class="hero-subtitle">
            descubre experiencias únicas en nuestros hoteles boutique ubicados 
            en los destinos más hermosos de Colombia 
          </p>
        </div>

        <!-- Search Form -->
        <div class="search-form">
          <div class="search-grid">
            <!-- Destination -->
            <div class="search-field">
              <label class="field-label">destino</label>
              <div class="field-wrapper">
                <span class="field-icon">📍</span>
                <select 
                  class="field-input"
                  [(ngModel)]="searchCriteria.destination">
                  <option value="">seleccionar ciudad</option>
                  <option value="cartagena">cartagena</option>
                  <option value="santa marta">santa marta</option>
                  <option value="san andrés">san andrés</option>
                  <option value="medellín">medellín</option>
                </select>
              </div>
            </div>

            <!-- Check-in -->
            <div class="search-field">
              <label class="field-label">llegada</label>
              <input 
                type="date" 
                class="field-input"
                [(ngModel)]="searchCriteria.checkIn">
            </div>

            <!-- Check-out -->
            <div class="search-field">
              <label class="field-label">salida</label>
              <input 
                type="date" 
                class="field-input"
                [(ngModel)]="searchCriteria.checkOut">
            </div>

            <!-- Guests -->
            <div class="search-field">
              <label class="field-label">huéspedes</label>
              <select 
                class="field-input"
                [(ngModel)]="searchCriteria.guests">
                <option value="1">1 persona</option>
                <option value="2">2 personas</option>
                <option value="3">3 personas</option>
                <option value="4">4 personas</option>
                <option value="5">5+ personas</option>
              </select>
            </div>
          </div>

          <button 
            class="search-btn btn-primary" 
            (click)="onSearch()">
            <span class="search-icon">🔍</span>
            <span>buscar hoteles</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Hotels Section -->
    <section class="hotels-section">
      <div class="hotels-container">
        <div class="section-header">
          <h2 class="section-title">nuestros hoteles destacados</h2>
          <div class="title-accent"></div>
          <p class="section-subtitle">
            cada uno de nuestros hoteles ha sido cuidadosamente seleccionado 
            para ofrecerte una experiencia única
          </p>
        </div>

        <!-- Hotels Grid -->
        <div class="hotels-grid" *ngIf="!loading && featuredHotels.length > 0">
          <app-hotel-card
            *ngFor="let hotel of featuredHotels"
            [hotel]="hotel"
            (reserveClicked)="onReserveHotel($event)"
            (detailsClicked)="onViewHotelDetails($event)">
          </app-hotel-card>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>cargando hoteles...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && featuredHotels.length === 0" class="empty-state">
          <div class="empty-icon">🏨</div>
          <h3>no hay hoteles disponibles</h3>
          <p>intenta ajustar tus criterios de búsqueda</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #334155 0%, #0d9488 50%, #334155 100%);
      padding: 5rem 0;
      color: white;
    }

    .hero-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .hero-content {
      text-align: center;
      margin-bottom: 3rem;
    }

    .hero-title {
      font-size: 3rem;
      font-family: serif;
      font-weight: 400;
      margin: 0 0 1rem 0;
      letter-spacing: 0.05em;
      color: #f1f5f9;
    }

    .title-accent {
      width: 4rem;
      height: 0.25rem;
      background-color: #fb7185; /* rosa coral */
      margin: 0 auto 1.5rem;
      border-radius: 0.125rem;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #cbd5e1;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Search Form */
    .search-form {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
      max-width: 1000px;
      margin: 0 auto;
    }

    .search-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .search-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      letter-spacing: 0.025em;
    }

    .field-wrapper {
      position: relative;
    }

    .field-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.125rem;
      color: #6b7280;
    }

    .field-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .field-wrapper .field-input {
      padding-left: 2.5rem;
    }

    .field-input:focus {
      outline: none;
      border-color: #0d9488; /* teal */
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
    }

    .search-btn {
      width: 100%;
      background-color: #0d9488; /* teal */
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      letter-spacing: 0.025em;
    }

    .search-btn:hover {
      background-color: #0f766e; /* teal más oscuro */
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(13, 148, 136, 0.3);
    }

    .search-icon {
      font-size: 1.25rem;
    }

    /* Hotels Section */
    .hotels-section {
      padding: 4rem 0;
      background-color: #d1d5db; /* gris plateado de fondo */
    }

    .hotels-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 2rem;
      font-family: serif;
      color: #334155; /* azul petróleo */
      margin: 0 0 1rem 0;
      font-weight: 500;
    }

    .section-subtitle {
      font-size: 1.125rem;
      color: #475569;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Hotels Grid */
    .hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 3rem 0;
      color: #6b7280;
    }

    .loading-spinner {
      width: 3rem;
      height: 3rem;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #0d9488; /* teal */
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem 0;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: #374151;
      margin: 0 0 0.5rem 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .search-form {
        padding: 1.5rem;
      }

      .search-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .hotels-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .section-title {
        font-size: 1.75rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  searchCriteria: SearchCriteria = {
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  };

  featuredHotels: Hotel[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.loadFeaturedHotels();
  }

  onSearch(): void {
    console.log('búsqueda con criterios:', this.searchCriteria);
    // aquí integraré con el backend posteriormente
  }

  onReserveHotel(hotel: Hotel): void {
    console.log('reservar hotel:', hotel.name);
    alert(`iniciando reserva para ${hotel.name}`);
    // aquí navegaré al formulario de reserva
  }

  onViewHotelDetails(hotel: Hotel): void {
    console.log('ver detalles del hotel:', hotel.name);
    alert(`mostrando detalles de ${hotel.name}`);
    // aquí navegaré a la página de detalles
  }

  private loadFeaturedHotels(): void {
    this.loading = true;
    
    // simulando datos mientras integro el backend
    setTimeout(() => {
      this.featuredHotels = [
        {
          id: '1',
          name: 'fala refugio cartagena',
          location: 'cartagena, colombia',
          price: 350000,
          rating: 4.8,
          amenities: ['wifi', 'estacionamiento', 'restaurant', 'café'],
          description: 'refugio elegante en el corazón de cartagena'
        },
        {
          id: '2',
          name: 'fala costa dorada',
          location: 'santa marta, colombia',
          price: 280000,
          rating: 4.6,
          amenities: ['wifi', 'restaurant', 'café', 'piscina'],
          description: 'experiencia única frente al mar caribe'
        },
        {
          id: '3',
          name: 'fala isla paraíso',
          location: 'san andrés, colombia',
          price: 420000,
          rating: 4.9,
          amenities: ['wifi', 'estacionamiento', 'restaurant', 'spa'],
          description: 'lujo tropical en el archipiélago'
        }
      ];
      this.loading = false;
    }, 1000);
  }
}