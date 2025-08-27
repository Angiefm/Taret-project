import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; //para formularios
import { Router } from '@angular/router';// para navegación
import { HotelCardComponent } from '../../features/hotels/hotel-card/hotel-card.component';
import { Hotel } from '../../core/models/hotel.model';
import { SearchCriteria } from '../../core/models/search-criteria';
import { HotelService } from '../../core/services/hotel.service';

@Component({
  selector: 'app-home', //nombre app home
  standalone: true,//independiente
  imports: [CommonModule, FormsModule, HotelCardComponent], //dependencias de esta clase
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit { //onLit para inicializar cuando se crea
  searchCriteria: SearchCriteria = {
    destination: '', //ciudad seleccionada
    checkIn: '', //fecha de entrada
    checkOut: '', //fecha de salida
    guests: 2 //número de huespedes default 2
  };

  featuredHotels: Hotel[] = []; //hoteles que va a mostrar
  loading: boolean = false; //esta cargando datos?
  error: string = '';//error si falla

  constructor( //pido dependencia que necesito
    private hotelService: HotelService, //servicio para comunicar con back
    private router: Router //router para navegar entre páginas
  ) {//angular que inyecte estos servicios
    }

  ngOnInit(): void { //se ejecuta cuando angular lo crea
    console.log('componente Home iniciado');
    this.loadFeaturedHotels(); //de una carga hoteles destacados
  }

  onSearch(): void { //usuario hace click en buscar
    this.loading = true; //numero spinner de carga
    this.error = '';//limpia errores anteriores
    
    console.log('búsqueda iniciada con criterios:', this.searchCriteria);
    
        // Validar criterios básicos
    if (!this.searchCriteria.destination) {//validaciones básicas antes de buscar
      this.error = 'Por favor selecciona un destino';
      this.loading = false;
      return;//no continuar si no hay destino
    }

    if (this.searchCriteria.guests < 1) {
      this.error = 'Debe haber al menos 1 huésped';
      this.loading = false;
      return;//no continuar si no hay destino
    }
    
    this.hotelService.searchHotels(this.searchCriteria).subscribe({//hacer busqueda usando servicio
      next: (hotels) => {
        console.log('búsqueda completada:', hotels); //exitosa
        this.featuredHotels = hotels; //actualizo hoteles
        this.loading = false;//quito spinner
        
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

  // cambioa ahora navego a ver habitaciones, no a reservar directamente
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

  onClearSearch(): void { //limpiar búsqueda
    this.searchCriteria = {//reseteo todos los criterios
      destination: '',
      checkIn: '',
      checkOut: '',
      guests: 2
    };
    this.error = '';
    this.loadFeaturedHotels();
  }

    //recargo hoteles
  onReloadHotels(): void {
    this.error = '';
    this.loadFeaturedHotels();
  }

  private loadFeaturedHotels(): void { //mi primer métododo principal para recargar datos
    this.loading = true; //muestra que esta cargando
    this.error = '';//limpia errores
    console.log('iniciando carga de hoteles desde el API...');
    
    this.hotelService.getAllHotels().subscribe({//usa servicio para obtener hoteles
      next: (hotels) => {
        console.log('hoteles cargados desde API:', hotels); //todo bien 
        this.featuredHotels = hotels; //guardo hoteles
        this.loading = false; //quito el spinner
        
        if (hotels.length === 0) {
          console.log('no hay hoteles en la base de datos');
          this.error = 'No hay hoteles disponibles en este momento.';
          // cargar datos mock como fallback
          this.loadMockHotels();
        }
      },
      error: (error) => {
        console.error('error cargando hoteles desde API:', error);
        this.error = `Error de conexión: ${error.message}`;
        this.loading = false;
        
        // cargo datos de prueba como respaldo
        console.log('usando datos de prueba como fallback...');
        this.loadMockHotels();
      }
    });
  }

  private loadMockHotels(): void { //hoteles
    console.log('cargando datos de prueba...');

        // Datos de prueba temporales
    this.featuredHotels = [
      {
        id: 'mock-1',
        name: 'fala refugio cartagena',
        location: 'cartagena, colombia',
        price: 350000,
        rating: 4.8,
        totalReviews: 127,
        amenities: ['wifi', 'estacionamiento', 'restaurant', 'café'],
        description: 'refugio elegante en el corazón de cartagena con vista al mar caribe',
        capacity: 4,
        imageUrls: ['/assets/images/hotel-cartagena.jpg'],
        imageUrl: '/assets/images/hotel-cartagena.jpg',
        isActive: true
      },
      {
        id: 'mock-2',
        name: 'fala costa dorada',
        location: 'santa marta, colombia',
        price: 280000,
        rating: 4.6,
        totalReviews: 89,
        amenities: ['wifi', 'restaurant', 'café', 'piscina'],
        description: 'experiencia única frente al mar caribe con acceso directo a la playa',
        capacity: 3,
        imageUrls: ['/assets/images/hotel-santa-marta.jpg'],
        imageUrl: '/assets/images/hotel-santa-marta.jpg',
        isActive: true
      },
      {
        id: 'mock-3',
        name: 'fala isla paraíso',
        location: 'san andrés, colombia',
        price: 420000,
        rating: 4.9,
        totalReviews: 203,
        amenities: ['wifi', 'estacionamiento', 'restaurant', 'spa', 'piscina'],
        description: 'lujo tropical en el archipiélago con experiencias únicas de buceo',
        capacity: 5,
        imageUrls: ['/assets/images/hotel-san-andres.jpg'],
        imageUrl: '/assets/images/hotel-san-andres.jpg',
        isActive: true
      }
    ];
    
    this.loading = false;
    this.error = 'Mostrando datos de prueba. Conecta tu backend para ver datos reales.';
    
    console.log('datos de prueba cargados:', this.featuredHotels);
  }

  formatPrice(price: number): string { //formateo para precios en pesos colombianos
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);//convierte 35000 a $350.000
  }

  //+verificar si hay errores de conexión
  isConnectionError(): boolean {
    return this.error.includes('conexión') || this.error.includes('servidor');
  }//es un error de conexión?

  isShowingMockData(): boolean {
    return this.error.includes('datos de prueba') || this.featuredHotels.some(hotel => hotel.id.startsWith('mock-'));
  } //esta mostrando datos de prueba 
}