import { Component, Input, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core'; // aqui importo changeDetectionStrategy porque lo voy a usar
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router } from '@angular/router';

import { BookingService } from '../../../core/services/booking.service';
import { BookingResponse } from '../../../core/models/booking.models';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // aqui pongo onpush para optimizar la detección de cambios
})
export class BookingConfirmationComponent implements OnInit {

  private readonly bookingService = inject(BookingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // @Input() bookingResponse: BookingResponse | null = null; // ----

  private readonly bookingResponseSignal = signal<BookingResponse | null>(null); //----
  readonly bookingResponseReadonly = this.bookingResponseSignal.asReadonly();

  ngOnInit(): void {
    //if (this.bookingResponse) {
    //  this.bookingResponseSignal.set(this.bookingResponse);
    //  return;
    //}

    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.loadBooking(bookingId);
    }
  }

  private loadBooking(id: string): void {
  this.bookingService.getBookingById(id).subscribe({
    next: (res) => {
      console.log('Respuesta del backend:', res);
      this.bookingResponseSignal.set(res);
    },
    error: (err) => {
      console.error('Error cargando la reserva:', err);
      this.bookingResponseSignal.set({
        success: false,
        message: 'No se pudo cargar la reserva.'
      });
    }
  });
}

  goToMyBookings(): void {
    this.router.navigate(['/mis-reservas']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  formatBookingDate(dateString: string | Date): string {
    if (!dateString) return 'Fecha no disponible';
  
    let dateStr: string;
    if (typeof dateString === 'string') {
      dateStr = dateString.split('T')[0];
    } else {
      dateStr = dateString.toISOString().split('T')[0];
    }
  
    const [year, month, day] = dateStr.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0);
  
    return new Intl.DateTimeFormat('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }).format(localDate);
  }

}
