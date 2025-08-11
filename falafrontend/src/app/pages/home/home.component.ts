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
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
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