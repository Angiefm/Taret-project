import { Injectable } from '@angular/core'; // traigo el decorador para servicios
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // observable para datos en tiempo real
import { catchError, retry, map } from 'rxjs/operators'; //traigo herramientas para procesar datos
import { Hotel, ApiHotelResponse } from '../models/hotel.model';
import { SearchCriteria } from '../models/search-criteria';
import { environment } from '../../../environments/environment';

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

  searchHotels(criteria: SearchCriteria): Observable<Hotel[]> { //aqui busco hoteles con filtro especifico
    const params = this.buildSearchParams(criteria); //convierto los criterios en parámentros url
    return this.http.get<ApiHotelResponse[]>(`${this.hotelsEndpoint}/search`, { params }) //hago petición get a /hotels/search con parámetros
      .pipe(
        map(this.transformHotelsData.bind(this)), //transformo datos
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
      price: hotel.basePrice || 350000, //se convierte en price
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

  private buildSearchParams(criteria: SearchCriteria): HttpParams { //convierto criterios en parametros URL
    let params = new HttpParams();//parametros vacios
    
    if (criteria.destination) {
      params = params.set('location', criteria.destination); //si hay destino
    }
    if (criteria.guests) {
      params = params.set('people', criteria.guests.toString());//si hay huespedes
    }
    if (criteria.minPrice) {
      params = params.set('minPrice', criteria.minPrice.toString());// si hay precio minimo agrego minPrice:200000
    }
    if (criteria.maxPrice) {
      params = params.set('maxPrice', criteria.maxPrice.toString());// si hay precio maximo 500000
    }
    
    return params;//devuelvo algo como: ?location=cartagena&people=2&minPrice=200000
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