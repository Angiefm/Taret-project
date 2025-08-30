import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/rooms`;

  constructor() {
    console.log('RoomService inicializado');
  }

getRoomsByHotel(hotelId: string): Observable<Room[]> {
  if (!hotelId) {
    return throwError(() => new Error('Hotel ID es requerido'));
  }

  console.log('Cargando habitaciones para hotel:', hotelId);

  return this.http.get<{ success: boolean; total: number; data: Room[] }>(
    `${this.apiUrl}/hotel/${hotelId}`
  ).pipe(
    map(res => {
      if (!res.success || !Array.isArray(res.data)) {
        throw new Error('Respuesta inválida de la API');
      }

      return res.data
        .filter(room => room.isActive) // solo activas
        .map(room => ({
          ...room,
          id: (room as any)._id,
          roomType: (room as any).roomType || (room as any).type,
          amenities: room.amenities || [],
          images: (room as any).imageUrls || []
        }));
    }),
    catchError(error => {
      console.error('Error cargando habitaciones:', error);
      return throwError(() => new Error('Error cargando habitaciones del hotel'));
    })
  );
}


getAvailableRooms(hotelId: string, checkIn?: string, checkOut?: string, guests?: number): Observable<Room[]> {
  if (!hotelId) {
    return throwError(() => new Error('Hotel ID es requerido'));
  }


  let params = new HttpParams();
  if (guests) {
    params = params.set('guests', guests.toString());
  }
  if (checkIn) {
    params = params.set('checkIn', checkIn);
  }
  if (checkOut) {
    params = params.set('checkOut', checkOut);
  }

  return this.http.get<{ success: boolean; data: Room[] }>(
    `${this.apiUrl}/hotel/${hotelId}/availability`,
    { params }
  ).pipe(
    map(res => {
      if (!res.success) throw new Error('Error en la API');

      return res.data.map(room => ({
        ...room,
        id: (room as any)._id,
        roomType: (room as any).roomType || (room as any).type,
        amenities: room.amenities || [],
        images: (room as any).imageUrls || []
      }));
    }),
    catchError(error => {
      console.error('[FRONT] Error cargando habitaciones:', error);
      return throwError(() => new Error('Error cargando habitaciones del hotel'));
    })
  );
}



  getRoomById(roomId: string): Observable<Room> {
    return this.http.get<{ success: boolean; data: Room }>(
      `${this.apiUrl}/${roomId}`
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            ...response.data,
            id: (response.data as any)._id,
            roomType: (response.data as any).roomType || (response.data as any).type,
            images: (response.data as any).imageUrls || []
          };
        } else {
          throw new Error('Habitación no encontrada');
        }
      }),
      catchError(error => {
        console.error('Error obteniendo habitación:', error);
        return throwError(() => new Error('Error obteniendo información de la habitación'));
      })
    );
  }

  getRoomDisplayName(room: Room): string {
    const typeNames: { [key: string]: string } = {
      'single-1': 'Individual Estándar',
      'single-2': 'Individual Premium',
      'single-3': 'Individual Deluxe',
      'suite': 'Suite',
      'suite-kid': 'Suite Familiar'
    };
    
    const typeName = typeNames[room.roomType] || room.roomType;
    return `${typeName} - ${room.bedDetails || 'Habitación'}`;
  }

  getRoomDescription(room: Room): string {
    const displayName = this.getRoomDisplayName(room);
    return `${displayName} (Capacidad: ${room.capacity} huéspedes - ${room.pricePerNight}/noche)`;
  }

  formatRoomType(roomType: string): string {
    const typeMap: { [key: string]: string } = {
      'single-1': 'Individual Estándar',
      'single-2': 'Individual Premium', 
      'single-3': 'Individual Deluxe',
      'suite': 'Suite',
      'suite-kid': 'Suite Familiar'
    };

    return typeMap[roomType] || roomType.charAt(0).toUpperCase() + roomType.slice(1);
  }
}
