import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Room, ApiRoomResponse, RoomSearchCriteria, RoomAvailability, ROOM_TYPE_INFO } from '../models/room.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly API_URL = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  // obtengo todas las habitaciones de un hotel
  getRoomsByHotel(hotelId: string): Observable<Room[]> {
    return this.http.get<ApiRoomResponse[]>(`${this.API_URL}/hotel/${hotelId}`)
      .pipe(
        map(rooms => rooms.map(room => this.transformApiRoom(room))),
        catchError(this.handleError)
      );
  }

  // busco habitaciones disponibles
  searchAvailableRooms(criteria: RoomSearchCriteria): Observable<RoomAvailability[]> {
    let params = new HttpParams()
      .set('hotelId', criteria.hotelId)
      .set('guests', criteria.guests.toString());

    if (criteria.checkIn) {
      params = params.set('checkIn', criteria.checkIn);
    }
    if (criteria.checkOut) {
      params = params.set('checkOut', criteria.checkOut);
    }
    if (criteria.roomType) {
      params = params.set('roomType', criteria.roomType);
    }
    if (criteria.minPrice) {
      params = params.set('minPrice', criteria.minPrice.toString());
    }
    if (criteria.maxPrice) {
      params = params.set('maxPrice', criteria.maxPrice.toString());
    }

    return this.http.get<any[]>(`${this.API_URL}/search-available`, { params })
      .pipe(
        map(results => results.map(result => this.transformRoomAvailability(result))),
        catchError(this.handleError)
      );
  }

  // verifico disponibilidad de una habitación específica
  checkRoomAvailability(roomId: string, checkIn: string, checkOut: string): Observable<boolean> {
    const params = new HttpParams()
      .set('roomId', roomId)
      .set('checkIn', checkIn)
      .set('checkOut', checkOut);

    return this.http.get<{available: boolean}>(`${this.API_URL}/check-availability`, { params })
      .pipe(
        map(response => response.available),
        catchError(this.handleError)
      );
  }

  // obtengo detalles de una habitación
  getRoomById(roomId: string): Observable<Room> {
    return this.http.get<ApiRoomResponse>(`${this.API_URL}/${roomId}`)
      .pipe(
        map(room => this.transformApiRoom(room)),
        catchError(this.handleError)
      );
  }

  // calcuo precio total para estadía
  calculatePrice(roomId: string, checkIn: string, checkOut: string): Observable<any> {
    const params = new HttpParams()
      .set('roomId', roomId)
      .set('checkIn', checkIn)
      .set('checkOut', checkOut);

    return this.http.get<any>(`${this.API_URL}/calculate-price`, { params })
      .pipe(catchError(this.handleError));
  }

  // aca metodos para manejar tipos y descripciones de habitaciones

  // obtengo nombre de habitación basado en el tipo
  getRoomDisplayName(roomType: Room['roomType']): string {
    return ROOM_TYPE_INFO[roomType]?.name || 'Habitación';
  }

  // obtengo descripción de habitación basado en el tipo
  getRoomDescription(roomType: Room['roomType']): string {
    return ROOM_TYPE_INFO[roomType]?.description || '';
  }

  // obtengo icon de habitación basado en el tipo
  getRoomIcon(roomType: Room['roomType']): string {
    return ROOM_TYPE_INFO[roomType]?.icon || '🛏️';
  }

  // obtengo nombre completo de la habitación (nombre personalizado o tipo)
  getRoomName(room: Room): string {
    return room.name || this.getRoomDisplayName(room.roomType);
  }

  // obtengo información completa de la habitación para mostrar
  getRoomDisplayInfo(room: Room): {
    name: string;
    type: string;
    description: string;
    icon: string;
  } {
    return {
      name: this.getRoomName(room),
      type: this.getRoomDisplayName(room.roomType),
      description: room.description || this.getRoomDescription(room.roomType),
      icon: this.getRoomIcon(room.roomType)
    };
  }

  // transformo respuesta de API a modelo frontend
  private transformApiRoom(apiRoom: ApiRoomResponse): Room {
    return {
      id: apiRoom._id,
      hotelId: apiRoom.hotelId,
      name: apiRoom.name || this.getRoomDisplayName(apiRoom.roomType),
      roomType: apiRoom.roomType,
      pricePerNight: apiRoom.pricePerNight,
      isAvailable: apiRoom.isAvailable,
      capacity: apiRoom.capacity,
      bedDetails: apiRoom.bedDetails,
      createdAt: apiRoom.createdAt,
      updatedAt: apiRoom.updatedAt
    };
  }

  private transformRoomAvailability(apiResult: any): RoomAvailability {
    return {
      room: this.transformApiRoom(apiResult.room),
      isAvailable: apiResult.isAvailable,
      totalPrice: apiResult.totalPrice,
      priceBreakdown: {
        subtotal: apiResult.priceBreakdown?.subtotal || 0,
        taxes: apiResult.priceBreakdown?.taxes || 0,
        fees: apiResult.priceBreakdown?.fees || 0,
        nights: apiResult.priceBreakdown?.nights || 1
      }
    };
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en RoomService:', error);
    let errorMessage = 'Error desconocido';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 404:
          errorMessage = 'Habitaciones no encontradas';
          break;
        case 500:
          errorMessage = 'Error del servidor';
          break;
        default:
          errorMessage = `Error HTTP: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}