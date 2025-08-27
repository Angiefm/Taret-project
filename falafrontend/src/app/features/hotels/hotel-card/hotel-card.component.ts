import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';// para usar *ngIf y *ngFor
import { Hotel } from '../../../core/models/hotel.model';

@Component({
  selector: 'app-hotel-card', //nombre
  standalone: true, //independiente o sea no necesito de modulos acqui
  imports: [CommonModule], //importo commonModule para directivas
  templateUrl: './hotel-card.component.html',
  styleUrl: './hotel-card.component.scss'
})
export class HotelCardComponent {
  @Input() hotel!: Hotel; //recibo hotel del componente padre
  @Output() detailsClicked = new EventEmitter<Hotel>();
  @Output() viewRoomsClicked = new EventEmitter<Hotel>(); // vambio ya no "reserve" sino "viewRooms"

  onCardClick(): void {
    this.detailsClicked.emit(this.hotel); //le mando al padre que hicieron click en ese hotel
  }

  // este es un cambio importante es para ver habitaciones, no reservar directamente
  onViewRoomsClick(event: Event): void {
    event.stopPropagation();
    this.viewRoomsClicked.emit(this.hotel); //aviso que quieren reservar hotel
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CO'); //formato colombiano para numeros
  }

  getDisplayAmenities(): string[] {
    return this.hotel.amenities.slice(0, 3); // de todas muestro primeras 3
  }

  getAmenityIcon(amenity: string): string { //aqui emogis para que se vea lindo
    const iconMap: { [key: string]: string } = {
      'wifi': '📶',
      'estacionamiento': '🚗',
      'restaurante': '🍽️',
      'café': '☕',
      'piscina': '🏊',
      'gimnasio': '💪',
      'spa': '🧘'
    };
    return iconMap[amenity.toLowerCase()] || '✨'; // busco en el diccionario y si no encuentro estrella
  }
}