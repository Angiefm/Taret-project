import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { RoomService } from '../../../core/services/room.service';
import { HotelService } from '../../../core/services/hotel.service';
import { Room } from '../../../core/models/room.model';
import { Hotel } from '../../../core/models/hotel.model';

@Component({
  selector: 'app-hotel-rooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './hotel.rooms.component.html',
  styleUrls: ['./hotel.rooms.component.scss']
})
export class HotelRoomsComponent implements OnInit, OnDestroy {
  
  // inyecto mis servicios y dependencias principales
  private readonly roomService = inject(RoomService);
  private readonly hotelService = inject(HotelService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  // sujeto para manejar destruccion de observables
  private destroy$ = new Subject<void>();

  // señales reactivas para manejar estado
  private readonly roomsSignal = signal<Room[]>([]);
  private readonly hotelSignal = signal<Hotel | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // inputs de filtros (valores que cambia el usuario en el form)
  roomTypeFilter: string = '';
  priceFilter = { min: 0, max: 0 };
  amenityFilter: string = '';

  // filtros activos
  private activeFilters = signal({
    roomType: '',
    min: 0,
    max: 0
  });

  // computed para tener habitaciones filtradas
  filteredRooms = computed(() => {
    let rooms = this.roomsSignal();

    const { roomType, min, max } = this.activeFilters();

    if (roomType) {
      rooms = rooms.filter(r => r.roomType === roomType);
    }

    if (min > 0) {
      rooms = rooms.filter(r => r.pricePerNight >= min);
    }

    if (max > 0) {
      rooms = rooms.filter(r => r.pricePerNight <= max);
    }

    return rooms;
  });

  // expongo mis señales de solo lectura
  readonly hotel = this.hotelSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly rooms = this.roomsSignal.asReadonly();

  // criterios de busqueda que llegan desde la ruta
  searchCriteria = {
    checkIn: '',
    checkOut: '',
    guests: 2,
    hotelId: ''
  };

  // opciones para tipos de habitacion
  roomTypes = [
    { value: '', label: 'todos los tipos' },
    { value: 'single-1', label: 'individual 1 persona' },
    { value: 'single-2', label: 'individual 2 personas' },
    { value: 'single-3', label: 'individual 3 personas' },
    { value: 'suite', label: 'suite' },
    { value: 'suite-kid', label: 'suite familiar' }
  ];

  ngOnInit(): void {
    console.log('hotelroomscomponent inicializado');
    
    // obtengo id del hotel desde los parametros de la ruta
    const hotelId = this.route.snapshot.paramMap.get('id');
    if (!hotelId) {
      this.router.navigate(['/']);
      return;
    }
    
    this.searchCriteria.hotelId = hotelId;

    // obtengo parametros de busqueda desde query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['checkIn']) this.searchCriteria.checkIn = params['checkIn'];
      if (params['checkOut']) this.searchCriteria.checkOut = params['checkOut'];
      if (params['guests']) this.searchCriteria.guests = parseInt(params['guests']);
      
      console.log('criterios de busqueda:', this.searchCriteria);
    });

    // cargo datos del hotel y sus habitaciones
    this.loadHotelData(hotelId);
    this.loadRooms(hotelId);
  }

  ngOnDestroy(): void {
    // limpio mis observables
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadHotelData(hotelId: string): void {
    // cargo informacion del hotel
    this.hotelService.getHotelById(hotelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hotel) => {
          console.log('hotel cargado:', hotel);
          this.hotelSignal.set(hotel);
        },
        error: (error) => {
          console.error('error cargando hotel:', error);
          this.errorSignal.set('error cargando informacion del hotel');
        }
      });
  }

  private loadRooms(hotelId: string): void {
    // inicio carga de habitaciones
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    console.log('cargando habitaciones para hotel:', hotelId);
    console.log('con criterios:', this.searchCriteria);

    this.roomService.getAvailableRooms(
      hotelId,
      this.searchCriteria.checkIn,
      this.searchCriteria.checkOut,
      this.searchCriteria.guests
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rooms: Room[]) => {
          console.log('habitaciones cargadas:', rooms);
          this.roomsSignal.set(rooms || []);
          this.initializePriceFilter();
        },
        error: (error: Error) => {
          console.error('error cargando habitaciones:', error);
          this.errorSignal.set(error.message || 'error cargando habitaciones disponibles');
          this.roomsSignal.set([]);
        },
        complete: () => {
          this.loadingSignal.set(false);
        }
      });
  }

  private initializePriceFilter(): void {
    // inicializo rango de precios para filtros
    const rooms = this.roomsSignal();
    if (rooms.length === 0) {
      this.priceFilter = { min: 0, max: 0 };
      return;
    }

    const prices = rooms.map(room => room.pricePerNight);
    const maxPrice = Math.max(...prices);
    
    this.priceFilter = {
      min: 0,
      max: maxPrice
    };
  }

  applyFiltersClick(): void {
    this.activeFilters.set({
      roomType: this.roomTypeFilter,
      min: Number(this.priceFilter.min) || 0,
      max: Number(this.priceFilter.max) || 0
    });
    console.log('Filtros aplicados:', this.activeFilters());
  }

  clearFilters(): void {
    // limpio filtros y reinicio precio
    this.roomTypeFilter = '';
    this.priceFilter = { min: 0, max: 0 };

    this.activeFilters.set({
      roomType: '',
      min: 0,
      max: 0
    });

    this.initializePriceFilter();
    console.log('filtros limpiados');
  }

  onBookRoom(room: Room): void {
    console.log('reservando habitacion:', room.id);
    
    // valido datos antes de navegar
    if (!this.hotel()) {
      console.error('no hay informacion del hotel disponible');
      if (this.searchCriteria.hotelId) {
        this.loadHotelData(this.searchCriteria.hotelId);
      }
      return;
    }

    if (!room.id) {
      console.error('informacion de habitacion incompleta');
      return;
    }

    const queryParams: any = {
      hotelId: this.searchCriteria.hotelId,
      roomId: room.id,
      guests: this.searchCriteria.guests
    };

    if (this.searchCriteria.checkIn) {
      queryParams.checkIn = this.searchCriteria.checkIn;
    }
    if (this.searchCriteria.checkOut) {
      queryParams.checkOut = this.searchCriteria.checkOut;
    }

    console.log('navegando a booking con parametros:', queryParams);
    this.router.navigate(['/booking'], { queryParams });
  }

  onRetryLoad(): void {
    // recargo habitaciones en caso de error
    if (this.searchCriteria.hotelId) {
      this.loadRooms(this.searchCriteria.hotelId);
    }
  }

  goBackToHotels(): void {
    // navego de regreso a lista de hoteles
    this.router.navigate(['/hoteles']);
  }

  goToHome(): void {
    // navego al inicio
    this.router.navigate(['/']);
  }

  formatPrice(price: number): string {
    // doy formato a precio en pesos colombianos
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDateRange(): string {
    // formateo rango de fechas de check in y check out
    if (!this.searchCriteria.checkIn || !this.searchCriteria.checkOut) {
      return '';
    }
    
    const checkIn = new Date(this.searchCriteria.checkIn);
    const checkOut = new Date(this.searchCriteria.checkOut);
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    };
    
    return `${checkIn.toLocaleDateString('es-CO', options)} - ${checkOut.toLocaleDateString('es-CO', options)}`;
  }

  calculateNights(): number {
    // calculo cantidad de noches entre las fechas
    if (!this.searchCriteria.checkIn || !this.searchCriteria.checkOut) {
      return 1;
    }
    
    const checkIn = new Date(this.searchCriteria.checkIn);
    const checkOut = new Date(this.searchCriteria.checkOut);
    
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(diffDays, 1);
  }

  getRoomTypeIcon(roomType: string): string {
    // devuelvo icono segun tipo de habitacion
    const iconMap: { [key: string]: string } = {
      'single-1': '🛏️',
      'single-2': '🏨', 
      'single-3': '🏢',
      'suite': '🏰',
      'suite-kid': '👨‍👩‍👧‍👦'
    };
    return iconMap[roomType] || '🏨';
  }

  getAmenityIcon(amenity: string): string {
    // devuelvo icono segun amenidad
    const iconMap: { [key: string]: string } = {
      'wifi': '📶',
      'tv': '📺',
      'ac': '❄️',
      'minibar': '🍷',
      'bathroom': '🛁',
      'balcony': '🌅',
      'workspace': '💼'
    };
    return iconMap[amenity.toLowerCase()] || '✨';
  }
}
