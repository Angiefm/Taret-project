import { Injectable } from '@angular/core'; // traigo el decorador para servicios
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // observable para datos en tiempo real
import { catchError, retry, map } from 'rxjs/operators'; //traigo herramientas para procesar datos
import { Hotel, ApiHotelResponse } from '../models/hotel.model';
import { SearchCriteria } from '../models/search-criteria.model';
import { environment } from '../../../environments/environment';
import { normalizeDate } from '../utils/date.utils';



@Injectable({ // aqui le digo a angular que esto es un servicio
  providedIn: 'root'  //angular crea una sola vez para toda la app
})
export class HotelService {
  private readonly apiUrl = environment.apiUrl; //back donde vive
  private readonly hotelsEndpoint = `${this.apiUrl}/hotels`; //url pa los hoteles

  constructor(private http: HttpClient) {} //angular inyecta el httpClient para hacer peticiones http

  getAllHotels(): Observable<Hotel[]> { //traigo todos los hoteles
    return this.http.get<ApiHotelResponse[]>(this.hotelsEndpoint)
      .pipe( //proceso de datos paso a paso
        map(this.transformHotelsData.bind(this)), //primero transformar aqui transformo los datos del back al formato front
        retry(2),                                 //despues reintentar si algo falla
        catchError(this.handleError.bind(this))   //finalmente errores si sigue fallando manejo error
      );
  }

  searchHotels(criteria: SearchCriteria): Observable<Hotel[]> {
    const params = this.buildSearchParams(criteria);
  
    return this.http.get<{ success: boolean; total: number; hotels: ApiHotelResponse[] }>(
      `${this.hotelsEndpoint}/search`,
      { params }
    ).pipe(
      map(res => this.transformHotelsData(res.hotels)), // <- usar hotels, no data
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  getHotelById(id: string): Observable<Hotel> {
    return this.http.get<ApiHotelResponse>(`${this.hotelsEndpoint}/${id}`)
      .pipe(
        map(this.transformSingleHotelData.bind(this)),
        catchError(this.handleError.bind(this))
      );
  }

  // convierto datos del back al front
  private transformHotelsData(hotels: ApiHotelResponse[]): Hotel[] { //mapeo cada hotel del formato API al formato de la app
    return hotels.map(hotel => this.transformSingleHotelData(hotel));
  }

  private transformSingleHotelData(hotel: ApiHotelResponse): Hotel {
    return {
      id: hotel._id,
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      amenities: hotel.amenities || [],
      minPrice: hotel.minPrice || 0, //se convierte en price
      rating: hotel.rating || 4.5, //por defecto POR EL MOMENTO
      totalReviews: hotel.totalReviews || 0, //total reseñas
      imageUrls: hotel.imageUrls || [],
      imageUrl: hotel.imageUrls?.[0],
      capacity: hotel.totalCapacity || 2,
      isActive: hotel.isActive !== false, // true por defecto
      createdAt: hotel.createdAt,
      updatedAt: hotel.updatedAt
    };
  }

  private buildSearchParams(criteria: SearchCriteria): HttpParams {

  let params = new HttpParams();

  if (criteria.destination) {
    params = params.set('destination', criteria.destination);
  }
  if (criteria.checkIn) {
  params = params.set('checkIn', normalizeDate(criteria.checkIn));
}
if (criteria.checkOut) {
  params = params.set('checkOut', normalizeDate(criteria.checkOut));
}
  if (criteria.guests) {
    params = params.set('guests', criteria.guests.toString());
  }

  return params;
}


  private handleError(error: HttpErrorResponse): Observable<never> { // aqui manejo errores
    let errorMessage = 'Error desconocido en el servidor';
    
    if (error.error instanceof ErrorEvent) {
      // error del cliente/red
      errorMessage = `Error de red: ${error.error.message}`;
    } else {
      // error del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'no se puede conectar al servidor. Verifica tu conexión.';
          break;
        case 404:
          errorMessage = 'no se encontraron hoteles con esos criterios.';
          break;
        case 500:
          errorMessage = 'error interno del servidor. Inténtalo más tarde.';
          break;
        default:
          errorMessage = `error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('error en HotelService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}