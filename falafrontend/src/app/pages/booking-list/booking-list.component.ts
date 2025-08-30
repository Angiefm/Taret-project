import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';


import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';

import { 
  Booking, 
  BookingStatus, 
  PaymentStatus, 
  BookingSearchParams 
} from '../../core/models/booking.models';

import { BookingCancellationComponent } from '../booking-cancellation/booking-cancellation.component';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule,
    MatChipsModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss'
})
export class BookingListComponent implements OnInit, OnDestroy {

    readonly PaymentStatus = PaymentStatus;
  
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  
  private destroy$ = new Subject<void>();

  private readonly bookingsSignal = signal<Booking[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly totalBookingsSignal = signal<number>(0);
  private readonly currentPageSignal = signal<number>(0);
  private readonly pageSizeSignal = signal<number>(10);

  readonly bookings = this.bookingsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly totalBookings = this.totalBookingsSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();
  readonly hasBookings = computed(() => this.bookings().length > 0);
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  filterForm!: FormGroup;

  readonly bookingStatuses = [
    { value: '', label: 'Todos los estados' },
    { value: BookingStatus.PENDING, label: 'Pendiente' },
    { value: BookingStatus.CONFIRMED, label: 'Confirmada' },
    { value: BookingStatus.CANCELLED, label: 'Cancelada' },
    { value: BookingStatus.COMPLETED, label: 'Completada' },
    { value: BookingStatus.NO_SHOW, label: 'No show' }
  ];

  readonly paymentStatuses = [
    { value: '', label: 'Todos los pagos' },
    { value: PaymentStatus.PENDING, label: 'Pendiente' },
    { value: PaymentStatus.PAID, label: 'Pagado' },
    { value: PaymentStatus.REFUNDED, label: 'Reembolsado' },
    { value: PaymentStatus.FAILED, label: 'Fallido' }
  ];

  ngOnInit(): void {
    console.log('BookingListComponent inicializado');
    
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/mis-reservas' } 
      });
      return;
    }

    this.initializeFilterForm();
    this.setupFilterWatcher();
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      paymentStatus: [''],
      dateFrom: [''],
      dateTo: ['']
    });
  }

  private setupFilterWatcher(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPageSignal.set(0);
        this.loadBookings();
      });
  }

  private loadBookings(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const searchParams = this.buildSearchParams();

    this.bookingService.getUserBookings(searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.bookingsSignal.set(response.bookings);
          this.totalBookingsSignal.set(response.pagination.total);
          console.log('Reservas cargadas:', response.bookings.length);
        },
        error: (error) => {
          console.error('Error cargando reservas:', error);
          this.errorSignal.set(error.message);
          this.snackBar.open('Error cargando las reservas', 'Cerrar', { 
            duration: 5000 
          });
        },
        complete: () => {
          this.loadingSignal.set(false);
        }
      });
  }

  private buildSearchParams(): BookingSearchParams {
    const formValue = this.filterForm.value;
    
    const params: BookingSearchParams = {
      page: this.currentPage() + 1,
      limit: this.pageSize()
    };
  
    if (formValue?.search?.trim() && !formValue.search.includes('http')) {
      params.bookingNumber = formValue.search.trim();
    }
  
    if (formValue?.status) {
      params.status = formValue.status as BookingStatus;
    }
  
    if (formValue?.dateFrom) {
      params.dateFrom = this.formatDate(formValue.dateFrom);
    }
  
    if (formValue?.dateTo) {
      params.dateTo = this.formatDate(formValue.dateTo);
    }
  
    return params;
  }

  onPageChange(event: PageEvent): void {
    this.currentPageSignal.set(event.pageIndex);
    this.pageSizeSignal.set(event.pageSize);
    this.loadBookings();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPageSignal.set(0);
  }

  refreshBookings(): void {
    this.loadBookings();
  }

  viewBookingDetails(booking: Booking): void {
    console.log('Ver detalles de reserva:', booking.bookingNumber);
  }

  openCancellationDialog(booking: Booking): void {
    const dialogRef = this.dialog.open(BookingCancellationComponent, {
      width: '500px',
      data: { booking }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.cancelled) {
        this.snackBar.open('Reserva cancelada exitosamente', 'Cerrar', {
          duration: 3000
        });
        this.refreshBookings();
      }
    });
  }

  sendBookingConfirmation(booking: Booking): void {
    this.bookingService.sendBookingConfirmation(booking.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Confirmación enviada por email', 'Cerrar', {
              duration: 3000
            });
          }
        },
        error: (error) => {
          console.error('Error enviando confirmación:', error);
          this.snackBar.open('Error enviando confirmación', 'Cerrar', {
            duration: 5000
          });
        }
      });
  }

  canCancelBooking(booking: Booking | null): boolean {
    if (!booking) return false;
    
    if (booking.status === BookingStatus.CANCELLED || 
        booking.status === BookingStatus.COMPLETED ||
        booking.status === BookingStatus.NO_SHOW) {
      return false;
    }
  
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const checkInDate = new Date(booking.checkInDate);
      checkInDate.setHours(0, 0, 0, 0);
      
      return checkInDate > today;
    } catch (error) {
      console.error('Error checking cancellation eligibility:', error);
      return false;
    }
  }

  canResendConfirmation(booking: Booking): boolean {
    return booking.status === BookingStatus.CONFIRMED || 
           booking.status === BookingStatus.PENDING;
  }

  getStatusLabel(status: BookingStatus): string {
    const labels = {
      [BookingStatus.PENDING]: 'Pendiente',
      [BookingStatus.CONFIRMED]: 'Confirmada',
      [BookingStatus.CANCELLED]: 'Cancelada',
      [BookingStatus.COMPLETED]: 'Completada',
      [BookingStatus.NO_SHOW]: 'No show'
    };
    return labels[status] || status;
  }

  getStatusColor(status: BookingStatus): string {
    const colors = {
      [BookingStatus.PENDING]: 'warn',
      [BookingStatus.CONFIRMED]: 'primary',
      [BookingStatus.CANCELLED]: 'accent',
      [BookingStatus.COMPLETED]: 'primary',
      [BookingStatus.NO_SHOW]: 'warn'
    };
    return colors[status] || 'basic';
  }

  getPaymentStatusLabel(status: PaymentStatus | undefined): string {
   if (!status) return 'Pendiente';
   
   const labels: Record<PaymentStatus, string> = {
     [PaymentStatus.PENDING]: 'Pendiente',
     [PaymentStatus.PAID]: 'Pagado',
     [PaymentStatus.REFUNDED]: 'Reembolsado',
     [PaymentStatus.FAILED]: 'Fallido'
   };
   
   return labels[status] || 'Desconocido';
 }

  getPaymentStatusColor(status: PaymentStatus): string {
    const colors = {
      [PaymentStatus.PENDING]: 'warn',
      [PaymentStatus.PAID]: 'primary',
      [PaymentStatus.REFUNDED]: 'accent',
      [PaymentStatus.FAILED]: 'warn'
    };
    return colors[status] || 'basic';
  }

  formatDateRange(booking: Booking): string {
    const checkIn = this.formatDisplayDate(booking.checkInDate);
    const checkOut = this.formatDisplayDate(booking.checkOutDate);
    return `${checkIn} - ${checkOut}`;
  }

  formatDisplayDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  getDaysUntilCheckIn(booking: Booking): number {
    const today = new Date();
    const checkIn = new Date(booking.checkInDate);
    const diffTime = checkIn.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isUpcomingBooking(booking: Booking): boolean {
    const daysUntil = this.getDaysUntilCheckIn(booking);
    return daysUntil >= 0 && daysUntil <= 7 && 
           booking.status === BookingStatus.CONFIRMED;
  }

  isPastBooking(booking: Booking): boolean {
    const today = new Date();
    const checkOut = new Date(booking.checkOutDate);
    return checkOut < today;
  }

  createNewBooking(): void {
    this.router.navigate(['/reservar']);
  }

  trackByBookingId(index: number, booking: Booking): string {
    return booking.id;
  }
}