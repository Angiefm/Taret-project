import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; // para usar *ngIf y *ngFor
import { Hotel } from '../../../core/models/hotel.model';

@Component({
  selector: 'app-hotel-card', //nombre
  standalone: true, //independiente o sea no necesito de modulos acqui
  imports: [CommonModule], //importo commonModule para directivas
  templateUrl: './hotel-card.component.html',
  styleUrl: './hotel-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush // pongo onpush para optimizar la detección de cambios
})
export class HotelCardComponent {
  @Input() hotel!: Hotel; //recibo hotel del componente padre
  @Output() detailsClicked = new EventEmitter<Hotel>(); //emito evento cuando hacen click en la tarjeta
  @Output() viewRoomsClicked = new EventEmitter<Hotel>(); //emito evento cuando quieren ver habitaciones

  onCardClick(): void {
    this.detailsClicked.emit(this.hotel); //le mando al padre que hicieron click en ese hotel
  }

  // aqui aviso que quieren ver habitaciones y detengo la propagación del evento
  onViewRoomsClick(event: Event): void {
    event.stopPropagation();
    this.viewRoomsClicked.emit(this.hotel);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CO'); //formato colombiano para numeros
  }

  getDisplayAmenities(): string[] {
    return this.hotel.amenities.slice(0, 3); // de todas muestro primeras 3
  }

  getAmenityIcon(amenity: string): string { //aqui emojis para que se vea lindo
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