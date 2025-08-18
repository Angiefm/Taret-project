import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelCardComponent } from '../hotel-card/hotel-card.component'; //hijo
import { Hotel } from '../../../core/models/hotel.model';
import { SearchCriteria } from '../../../core/models/search-criteria';
import { HotelService } from '../../../core/services/hotel.service';

//tipos especiales para mi componente
export type ViewMode = 'grid' | 'list'; //solo list o grid
export type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc'; //opcion de ordenamiento

@Component({
  selector: 'app-hotel-list', //nombre
  standalone: true,
  imports: [CommonModule, HotelCardComponent], //necesito los dos
  templateUrl: './hotel-list.component.html',
  styleUrls: ['./hotel-list.component.scss']
})
export class HotelListComponent implements OnInit, OnChanges { //implemento OnInit y OnChanges para reaccionar a cambios
  //papa da
  @Input() hotels: Hotel[] = []; //papa da lista de hoteles
  @Input() loading: boolean = false; //si esta cargando
  @Input() error: string = ''; //si hay errores
  @Input() searchCriteria?: SearchCriteria; //criterios de busqueda
  @Input() showFilters: boolean = true; //si muestra filtros
  @Input() showSorting: boolean = true; // si muestra ordenamienta
  @Input() viewMode: ViewMode = 'grid'; //vista grid o lista
  
  //eventos al componente padre
  @Output() hotelSelected = new EventEmitter<Hotel>(); //seleccionaron hotel
  @Output() reserveHotel = new EventEmitter<Hotel>();//quieren reservar
  @Output() retryLoad = new EventEmitter<void>();//reintentar carga
  @Output() sortChanged = new EventEmitter<SortOption>();//cambio ordenamiento
  @Output() viewModeChanged = new EventEmitter<ViewMode>(); //cambio vista

  //estado interno
  filteredHotels: Hotel[] = []; //hoteles despues de filtrar
  currentSort: SortOption = 'rating-desc';//ordenamiento actual
  isFiltering: boolean = false;//esta filtrando?
  skeletonItems: number[] = [1, 2, 3, 4, 5, 6];//items para skelton loading

  //opciones de ordenamiento que tengo por el momento
  sortOptions = [
    { value: 'rating-desc', label: 'Mejor calificación' },
    { value: 'price-asc', label: 'Precio: menor a mayor' },
    { value: 'price-desc', label: 'Precio: mayor a menor' },
    { value: 'name-asc', label: 'Nombre A-Z' }
  ];

  //pido el hotelService
  constructor(private hotelService: HotelService) {}//que angular inyecte el servicio de hoteles

  ngOnInit(): void { //ejecuto cuando angular crea
    console.log('HotelList component iniciado');
    this.processHotels();//proceso hoteles
  }

  ngOnChanges(changes: SimpleChanges): void {//ejecuto cuando cambia los @input
    if (changes['hotels'] || changes['searchCriteria']) {//si cambiaron hoteles o criterios de busqueda
      this.processHotels();//vuelvo a proesar
    }
  }

  private processHotels(): void {//cerebro principal
    if (!this.hotels || this.hotels.length === 0) { //sin hoteles nada
      this.filteredHotels = [];
      return;
    }

    this.isFiltering = true; //esta trabajando
    
    let filtered = [...this.hotels]; //copia lista original
    
    if (this.searchCriteria) { //aplica criterios de bus
      filtered = this.applySearchFilters(filtered);
    }
    
    filtered = this.applySorting(filtered);//aplico ordenamiento
    
    this.filteredHotels = filtered; //gaurdo result
    this.isFiltering = false; //terminó
    
    console.log(`hoteles procesados: ${filtered.length} de ${this.hotels.length}`);
  }

  private applySearchFilters(hotels: Hotel[]): Hotel[] { // filtro hoteles segun criterio
    if (!this.searchCriteria) return hotels;

    return hotels.filter(hotel => {//por cada hotel miro si cumple todos los criterios
      if (this.searchCriteria!.destination) {
        const matchesDestination = hotel.location
          .toLowerCase()
          .includes(this.searchCriteria!.destination.toLowerCase());
        if (!matchesDestination) return false;//no coincide destino
      }

      if (this.searchCriteria!.guests) {
        if (hotel.capacity && hotel.capacity < this.searchCriteria!.guests) {
          return false;//no hay capacidad de huesped
        }
      }

      if (this.searchCriteria!.minPrice) {
        if (hotel.price < this.searchCriteria!.minPrice) {
          return false;//precio muy bajo
        }
      }

      if (this.searchCriteria!.maxPrice) {
        if (hotel.price > this.searchCriteria!.maxPrice) {
          return false;//precio muy alto
        }
      }

      return true; //cumple todos los criterios
    });
  }

  private applySorting(hotels: Hotel[]): Hotel[] {
    return hotels.sort((a, b) => {//comparo hoteles de a pares a vs b
      switch (this.currentSort) {
        case 'price-asc':
          return a.price - b.price;//ascendente
        case 'price-desc':
          return b.price - a.price;//descedente
        case 'rating-desc':
          return b.rating - a.rating;//ratin descendente
        case 'name-asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;// no cambia orden
      }
    });
  }

  onSortChange(sortOption: SortOption): void {//usuario cambia ordenamiento
    console.log('cambiando ordenamiento a:', sortOption);
    this.currentSort = sortOption;//guarda nueva opción
    this.processHotels();//vuelve a procesar
    this.sortChanged.emit(sortOption);//aviso a papi
  }

  onViewModeChange(mode: ViewMode): void {
    console.log('cambiando vista a:', mode);
    this.viewMode = mode; //guardo la nueva vista
    this.viewModeChanged.emit(mode); //aviso a papa
  }

  onHotelCardClick(hotel: Hotel): void {//usuario hizo click en tarjeta
    console.log('hotel seleccionado:', hotel.name);
    this.hotelSelected.emit(hotel);//paso hotel a papi
  }

  onReserveClick(hotel: Hotel): void {
    console.log('reserva solicitada para:', hotel.name);
    this.reserveHotel.emit(hotel);
  }

  onRetryClick(): void {
    console.log('reintentando carga de hoteles');
    this.retryLoad.emit();//le paso a papi que reintente
  }

  hasResults(): boolean {
    return this.filteredHotels.length > 0; //tengo results?
  }

  isLoading(): boolean {
    return this.loading || this.isFiltering;//estoy cargando?
  }

  hasError(): boolean {
    return !!this.error && !this.loading;//las dos
  }

  isEmpty(): boolean {
    return !this.loading && !this.error && this.filteredHotels.length === 0;//vacio?
  }

  getResultsText(): string { //texto descriptivo
    const total = this.filteredHotels.length;
    if (total === 0) return 'No se encontraron hoteles';
    if (total === 1) return '1 hotel encontrado';
    return `${total} hoteles encontrados`;
  }

  getErrorIcon(): string { //error en emoji segun tipo de error
    if (this.error.includes('conexión') || this.error.includes('red')) {
      return '🌐';
    }
    if (this.error.includes('servidor')) {
      return '🔧';
    }
    return '❌';
  }

  trackByHotelId(index: number, hotel: Hotel): string {//optimización para ngFor, angular usa esto para saber si un hotel cambio
    return hotel.id; //identifico hotel por el id
  }

  trackByIndex(index: number): number {//optimizacion para skeleton loadin
    return index;//identifico cada skeleton por indice
  }
}