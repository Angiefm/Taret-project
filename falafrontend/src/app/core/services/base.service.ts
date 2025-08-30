import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { 
  Booking, 
  BookingFormData, 
  BookingResponse, 
  BookingListResponse,
  BookingSearchParams 
} from '../models/booking.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  
  private readonly apiUrl = `${environment.apiUrl}/bookings`;
  
  // estado reactivo para reservas
  private readonly bookingsSubject = new BehaviorSubject<Booking[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  
  // observables públicos
  public readonly bookings$ = this.bookingsSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  constructor() {
    console.log('BookingService inicializado');
  }

  // crear nueva reserva
  createBooking(bookingData: BookingFormData): Observable<BookingResponse> {
    console.log('Creando nueva reserva:', bookingData);
    
    this.setLoading(true);
    this.clearError();

    // preparar datos para la API con validación estricta
    const payload = this.prepareBookingPayload(bookingData);
    
    // Log para debug
    console.log('Payload enviado al backend:', payload);

    return this.http.post<BookingResponse>(this.apiUrl, payload).pipe(
      tap(response => {
        if (response.success) {
          console.log('Reserva creada exitosamente:', response.data);
          this.refreshUserBookings(); // actualizar lista si está autenticado
        } else {
          console.warn('Reserva creada con advertencias:', response.message);
        }
      }),
      catchError(error => {
        console.error('Error creando reserva:', error);
        const errorMessage = this.extractErrorMessage(error);
        this.setError(errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => this.setLoading(false))
    );
  }

  // obtener reservas del usuario autenticado
  getUserBookings(params?: BookingSearchParams): Observable<BookingListResponse> {
    console.log('Cargando reservas del usuario');
    
    if (!this.authService.isAuthenticated()) {
      const error = 'Usuario no autenticado';
      this.setError(error);
      return throwError(() => new Error(error));
    }

    this.setLoading(true);
    this.clearError();

    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<BookingListResponse>(`${this.apiUrl}/my-bookings`, { params: httpParams }).pipe(
      tap(response => {
        console.log('Reservas del usuario cargadas:', response.bookings.length);
        this.bookingsSubject.next(response.bookings);
      }),
      catchError(error => {
        console.error('Error cargando reservas del usuario:', error);
        const errorMessage = this.extractErrorMessage(error);
        this.setError(errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => this.setLoading(false))
    );
  }

  // buscar reserva por número de reserva
  getBookingByNumber(bookingNumber: string): Observable<Booking> {
    console.log('Buscando reserva por número:', bookingNumber);
    
    this.setLoading(true);
    this.clearError();

    return this.http.get<BookingResponse>(`${this.apiUrl}/search/${bookingNumber}`).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('Reserva encontrada:', response.data);
          return response.data;
        } else {
          throw new Error(response.message || 'Reserva no encontrada');
        }
      }),
      catchError(error => {
        console.error('Error buscando reserva:', error);
        const errorMessage = this.extractErrorMessage(error);
        this.setError(errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => this.setLoading(false))
    );
  }

  // actualizar reserva existente
  updateBooking(bookingId: string, updateData: Partial<BookingFormData>): Observable<BookingResponse> {
    console.log('Actualizando reserva:', bookingId, updateData);
    
    this.setLoading(true);
    this.clearError();

    return this.http.put<BookingResponse>(`${this.apiUrl}/${bookingId}`, updateData).pipe(
      tap(response => {
        if (response.success) {
          console.log('Reserva actualizada exitosamente');
          this.refreshUserBookings();
        }
      }),
      catchError(error => {
        console.error('Error actualizando reserva:', error);
        const errorMessage = this.extractErrorMessage(error);
        this.setError(errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => this.setLoading(false))
    );
  }

  // cancelar reserva
  cancelBooking(bookingId: string, reason?: string): Observable<BookingResponse> {
    console.log('Cancelando reserva:', bookingId);
    
    this.setLoading(true);
    this.clearError();

    const payload = reason ? { cancellationReason: reason } : {};

    return this.http.patch<BookingResponse>(`${this.apiUrl}/${bookingId}/cancel`, payload).pipe(
      tap(response => {
        if (response.success) {
          console.log('Reserva cancelada exitosamente');
          this.refreshUserBookings();
        }
      }),
      catchError(error => {
        console.error('Error cancelando reserva:', error);
        const errorMessage = this.extractErrorMessage(error);
        this.setError(errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => this.setLoading(false))
    );
  }

  // calcular precio total de reserva
  calculateBookingPrice(formData: Partial<BookingFormData>): Observable<{ totalPrice: number; breakdown: any }> {
    console.log('Calculando precio de reserva');
    
    const payload = {
      hotelId: formData.hotelId,
      roomId: formData.roomId,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      numberOfGuests: formData.numberOfGuests
    };

    return this.http.post<{ totalPrice: number; breakdown: any }>(`${this.apiUrl}/calculate-price`, payload).pipe(
      tap(result => console.log('Precio calculado:', result)),
      catchError(error => {
        console.error('Error calculando precio:', error);
        return throwError(() => new Error('Error calculando precio de la reserva'));
      })
    );
  }

  // enviar confirmación por email
  sendBookingConfirmation(bookingId: string): Observable<{ success: boolean }> {
    console.log('Enviando confirmación por email');
    
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/${bookingId}/send-confirmation`, {}).pipe(
      tap(response => {
        if (response.success) {
          console.log('Confirmación enviada por email');
        }
      }),
      catchError(error => {
        console.error('Error enviando confirmación:', error);
        return throwError(() => new Error('Error enviando confirmación por email'));
      })
    );
  }

  // limpiar estado
  clearError(): void {
    this.errorSubject.next(null);
  }

  clearBookings(): void {
    this.bookingsSubject.next([]);
  }

  // refrescar reservas del usuario
  private refreshUserBookings(): void {
    if (this.authService.isAuthenticated()) {
      this.getUserBookings().subscribe({
        next: () => console.log('Reservas actualizadas'),
        error: (error) => console.error('Error actualizando reservas:', error)
      });
    }
  }

  // métodos auxiliares privados - CORREGIDOS para tu estructura de BD
  private prepareBookingPayload(formData: BookingFormData): any {
    const user = this.authService.user();
    
    // Validar datos requeridos
    if (!formData.hotelId || !formData.roomId || !formData.checkInDate || !formData.checkOutDate) {
      throw new Error('Faltan datos requeridos para la reserva');
    }

    // Validar fechas
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new Error('Fechas inválidas');
    }

    if (checkOut <= checkIn) {
      throw new Error('La fecha de salida debe ser posterior a la fecha de entrada');
    }

    // Validar número de huéspedes
    if (!formData.numberOfGuests || formData.numberOfGuests < 1 || formData.numberOfGuests > 8) {
      throw new Error('Número de huéspedes inválido');
    }

    // Validar información del huésped
    if (!formData.guestInfo?.firstName?.trim() || !formData.guestInfo?.lastName?.trim()) {
      throw new Error('Nombre y apellido son requeridos');
    }

    if (!formData.guestInfo?.email?.trim() || !this.isValidEmail(formData.guestInfo?.email)) {
      throw new Error('Email válido es requerido');
    }

    if (!formData.guestInfo?.phone?.trim()) {
      throw new Error('Teléfono es requerido');
    }

    const payload = {
      hotelId: formData.hotelId.trim(),
      roomId: formData.roomId.trim(),
      checkInDate: this.formatDateForAPI(checkIn),
      checkOutDate: this.formatDateForAPI(checkOut),
      numberOfGuests: Number(formData.numberOfGuests),
      
      guestInfo: {
        firstName: formData.guestInfo?.firstName.trim(),
        lastName: formData.guestInfo?.lastName.trim(),
        phone: this.formatPhoneNumber(formData.guestInfo?.phone),
        email: formData.guestInfo?.email.trim().toLowerCase()
      },
      
      specialRequests: formData.specialRequests?.trim() || null,
      
      userId: user?.id || null,
      
      source: 'web_application',
      platform: 'angular'
    };

    return payload;
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      const errorMessages = error.error.errors
        .map((e: any) => (e.message || e.msg || e) as string)
        .filter((msg: string) => msg)
        .join(', ');
      if (errorMessages) return errorMessages;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.status) {
      switch (error.status) {
        case 400:
          return 'Datos de reserva inválidos. Verifica la información ingresada.';
        case 401:
          return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        case 403:
          return 'No tienes permisos para realizar esta acción.';
        case 404:
          return 'Hotel o habitación no encontrados.';
        case 409:
          return 'La habitación no está disponible en las fechas seleccionadas.';
        case 422:
          return 'Datos de reserva incompletos o inválidos.';
        case 500:
          return 'Error interno del servidor. Inténtalo más tarde.';
        default:
          return 'Error procesando la reserva. Inténtalo de nuevo.';
      }
    }
    
    return 'Error desconocido procesando la reserva.';
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  // métodos de utilidad mejorados
  
  // validar email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // formatear fecha para API (ISO format)
  private formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  // formatear número de teléfono colombiano
  private formatPhoneNumber(phone: string): string {
    // Remover espacios y caracteres especiales
    let cleanPhone = phone.replace(/\s|-|\(|\)/g, '');
    
    // Si empieza con +57, removerlo para procesamiento interno
    if (cleanPhone.startsWith('+57')) {
      cleanPhone = cleanPhone.substring(3);
    } else if (cleanPhone.startsWith('57')) {
      cleanPhone = cleanPhone.substring(2);
    }
    
    return cleanPhone;
  }

  // validar disponibilidad de fechas
  validateDateAvailability(checkIn: string, checkOut: string): boolean {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    
    // verificar que las fechas sean válidas
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return false;
    }
    
    // verificar que las fechas sean futuras
    if (checkInDate <= today) {
      return false;
    }
    
    // verificar que checkout sea después de checkin
    if (checkOutDate <= checkInDate) {
      return false;
    }
    
    return true;
  }

  // calcular número de noches
  calculateNumberOfNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return 0;
    }
    
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  }

  generateBookingNumber(): string {
    const prefix = 'RF'; // Refugi Fala
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
}