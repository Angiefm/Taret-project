import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Room, ROOM_TYPE_INFO } from '../../../core/models/room.model';
import { RoomService } from '../../../core/services/room.service';
import { HotelService } from '../../../core/services/hotel.service';
import { Hotel } from '../../../core/models/hotel.model';

@Component({
  selector: 'app-hotel-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hotel.rooms.component.html',
  styleUrls: ['./hotel.rooms.component.scss']
})
export class HotelRoomsComponent implements OnInit {
  hotelId!: string;
  hotel: Hotel | null = null;
  rooms: Room[] = [];
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id')!;
    this.loadHotelInfo();
    this.loadRooms();
  }

  loadHotelInfo(): void {
    this.hotelService.getHotelById(this.hotelId).subscribe({
      next: (hotel) => {
        this.hotel = hotel;
      },
      error: (err) => {
        console.error('Error cargando información del hotel:', err);
      }
    });
  }

  loadRooms(): void {
    this.loading = true;
    this.error = '';

    this.roomService.getRoomsByHotel(this.hotelId).subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando habitaciones:', err);
        this.error = err.message || 'No se pudieron cargar las habitaciones.';
        this.loading = false;
      }
    });
  }

  getRoomTypeInfo(type: Room['roomType']) {
    return ROOM_TYPE_INFO[type];
  }

  getRoomName(room: Room): string {
    return this.roomService.getRoomName(room);
  }

  reserveRoom(room: Room): void {
    if (!room.isAvailable) {
      return;
    }

    // Navegar al formulario de reservas con parámetros pre-llenados
    const queryParams = {
      hotelId: this.hotelId,
      roomId: room.id,
      // Opcional: puedes añadir fechas por defecto si las tienes
      // checkIn: this.formatDate(new Date()),
      // checkOut: this.formatDate(new Date(Date.now() + 86400000)), // +1 día
      guests: 1
    };

    this.router.navigate(['/booking'], { queryParams });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  goBack(): void {
    this.router.navigate(['/hotels']);
  }

  trackByRoomId(index: number, room: Room): string {
  return room.id;
}
}