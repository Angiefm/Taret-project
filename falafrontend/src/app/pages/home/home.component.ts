import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; //para formularios
import { Router } from '@angular/router';// para navegación
import { HotelCardComponent } from '../../features/hotels/hotel-card/hotel-card.component';
import { Hotel } from '../../core/models/hotel.model';
import { SearchCriteria } from '../../core/models/search-criteria.model';
import { HotelService } from '../../core/services/hotel.service';

@Component({
  selector: 'app-home', //nombre app home
  standalone: true,//independiente
  imports: [CommonModule, FormsModule, HotelCardComponent], //dependencias de esta clase
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit { //onInit para inicializar cuando se crea
  searchCriteria: SearchCriteria = {
    destination: '', //ciudad seleccionada
    checkIn: '', //fecha de entrada
    checkOut: '', //fecha de salida
    guests: 2 //número de huespedes default 2
  };

  featuredHotels: Hotel[] = []; //hoteles que va a mostrar
  loading: boolean = false; //esta cargando datos?
  error: string = '';//error si falla

  constructor(
    private hotelService: HotelService, //servicio para comunicar con back
    private router: Router //router para navegar entre páginas
  ) {}

  ngOnInit(): void {
    console.log('componente Home iniciado');
    this.loadFeaturedHotels();
  }

  onSearch(): void {
    this.loading = true;
    this.error = '';
    
    console.log('búsqueda iniciada con criterios:', this.searchCriteria);
    
    // Validar criterios básicos
    if (!this.searchCriteria.destination) {
      this.error = 'Por favor selecciona un destino';
      this.loading = false;
      return;
    }

    if (this.searchCriteria.guests < 1) {
      this.error = 'Debe haber al menos 1 huésped';
      this.loading = false;
      return;
    }

    if(this.searchCriteria.checkIn && this.searchCriteria.checkOut) {
      const checkInDate = new Date(this.searchCriteria.checkIn);
      const checkOutDate = new Date(this.searchCriteria.checkOut);

      if (checkInDate >= checkOutDate) {
        this.error = "La fecha de salida debe ser posterior a la de entrada";
        this.loading = false;
        return;
      }
    }
    
    this.hotelService.searchHotels(this.searchCriteria).subscribe({
      next: (hotels) => {
        console.log('búsqueda completada:', hotels);
        this.featuredHotels = hotels;
        this.loading = false;
        
        if (hotels.length === 0) {
          this.error = 'No se encontraron hoteles con esos criterios. Intenta con otros filtros.';
        }
      },
      error: (error) => {
        console.error('error en búsqueda:', error);
        this.error = error.message || 'Error al buscar hoteles. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  onViewHotelRooms(hotel: Hotel): void {
    console.log('viendo habitaciones del hotel:', hotel.name);
    
    this.router.navigate(['/hotel', hotel.id, 'rooms'], {
      queryParams: {
        checkIn: this.searchCriteria.checkIn || '',
        checkOut: this.searchCriteria.checkOut || '',
        guests: this.searchCriteria.guests || 2
      }
    });
  }

  onClearSearch(): void {
    this.searchCriteria = {
      destination: '',
      checkIn: '',
      checkOut: '',
      guests: 1
    };
    this.error = '';
    this.loadFeaturedHotels();
  }

  onReloadHotels(): void {
    this.error = '';
    this.loadFeaturedHotels();
  }

  private loadFeaturedHotels(): void {
    this.loading = true;
    this.error = '';
    console.log('iniciando carga de hoteles desde el API...');
    
    this.hotelService.getAllHotels().subscribe({
      next: (hotels) => {
        console.log('hoteles cargados desde API:', hotels);
        this.featuredHotels = hotels;
        this.loading = false;
        
        if (hotels.length === 0) {
          console.log('no hay hoteles en la base de datos');
          this.error = 'No hay hoteles disponibles en este momento.';
        }
      },
      error: (error) => {
        console.error('error cargando hoteles desde API:', error);
        this.error = `Error de conexión: ${error.message}`;
        this.loading = false;
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  isConnectionError(): boolean {
    return this.error.includes('conexión') || this.error.includes('servidor');
  }
}