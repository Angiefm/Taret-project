import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { HotelService } from '../../core/services/hotel.service';
import { RoomService } from '../../core/services/room.service';

import { BookingResponse } from '../../core/models/booking.models';
import { Hotel } from '../../core/models/hotel.model';
import { Room } from '../../core/models/room.model';

export interface CanComponentDeactivate {
  canDeactivate(): boolean;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCheckboxModule,
    MatIconModule,
    MatStepperModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  private readonly fb = inject(FormBuilder);
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly hotelService = inject(HotelService);
  private readonly roomService = inject(RoomService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  // reactive state
  private readonly selectedHotelSignal = signal<Hotel | null>(null);
  private readonly selectedRoomSignal = signal<Room | null>(null);
  private readonly isSubmittingSignal = signal<boolean>(false);
  private readonly showSuccessDialogSignal = signal<boolean>(false);
  private readonly bookingResultSignal = signal<BookingResponse | null>(null);

  readonly selectedHotel = this.selectedHotelSignal.asReadonly();
  readonly selectedRoom = this.selectedRoomSignal.asReadonly();
  readonly isSubmitting = this.isSubmittingSignal.asReadonly();
  readonly showSuccessDialog = this.showSuccessDialogSignal.asReadonly();
  readonly bookingResult = this.bookingResultSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  // forms
  guestForm!: FormGroup;
  bookingForm!: FormGroup;
  mainForm!: FormGroup;

  private formDirty = false;

  ngOnInit(): void {
    this.initializeForms();
    this.handleRouteParams();
    this.setupFormWatchers();
    this.prefillUserDataIfAuthenticated();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // canComponentDeactivate impl
  canDeactivate(): boolean {
    if (this.formDirty && !this.showSuccessDialog()) {
      return confirm('¿Está seguro de que desea salir? Los datos del formulario se perderán.');
    }
    return true;
  }

  private initializeForms(): void {
    // formulario de info del huésped
    this.guestForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      requests: ['', Validators.maxLength(500)]
    });

    // solo para datos que vienen de queryParams (no visibles en form)
    this.bookingForm = this.fb.group({
      hotelId: ['', Validators.required],
      roomId: ['', Validators.required],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      numberOfGuests: [2, [Validators.required, Validators.min(1), Validators.max(8)]]
    });

    this.mainForm = this.fb.group({
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  private handleRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['hotelId']) this.bookingForm.patchValue({ hotelId: params['hotelId'] });
        if (params['roomId']) this.bookingForm.patchValue({ roomId: params['roomId'] });
        if (params['checkIn']) this.bookingForm.patchValue({ checkInDate: new Date(params['checkIn']) });
        if (params['checkOut']) this.bookingForm.patchValue({ checkOutDate: new Date(params['checkOut']) });
        if (params['guests']) this.bookingForm.patchValue({ numberOfGuests: parseInt(params['guests']) });
      });
  }

  private setupFormWatchers(): void {
    this.guestForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.formDirty = true);
  }

  private prefillUserDataIfAuthenticated(): void {
    if (this.isAuthenticated()) {
      const user = this.authService.user();
      if (user) {
        this.guestForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        });
      }
    }
  }

  submitBooking(): void {
  if (!this.canSubmit()) return;

  this.isSubmittingSignal.set(true);

  const checkIn = this.bookingForm.get('checkInDate')?.value;
  const checkOut = this.bookingForm.get('checkOutDate')?.value;

  if (!checkIn || !checkOut) {
    this.snackBar.open('Debes seleccionar fechas válidas', 'Cerrar', { duration: 5000 });
    this.isSubmittingSignal.set(false);
    return;
  }

  const payload = {
    guestInfo: {
      firstName: this.guestForm.value.firstName,
      lastName: this.guestForm.value.lastName,
      phone: this.guestForm.value.phone,
      email: this.guestForm.value.email,
    },
    hotelId: this.bookingForm.get('hotelId')?.value,
    roomId: this.bookingForm.get('roomId')?.value,
    checkInDate: this.formatDate(checkIn),
    checkOutDate: this.formatDate(checkOut),
    numberOfGuests: this.bookingForm.get('numberOfGuests')?.value,
    specialRequests: this.guestForm.value.requests || ''
  };

  console.log('Payload final enviado al back:', JSON.stringify(payload, null, 2));

  this.bookingService.createBooking(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.success && response.data) {
          console.log('Reserva creada:', response.data);
          this.formDirty = false;

          this.router.navigate(['/booking/confirmation', response.data.id]);
        } 
        
        else {
          this.snackBar.open('No se pudo crear la reserva', 'Cerrar', { duration: 5000 });
        }
      },
      error: (error) => {
        console.error('Error creando reserva:', error);

        if (error.error?.errors && Array.isArray(error.error.errors)) {
          const errorMessages = error.error.errors.map((err: any) => err.message).join(', ');
          this.snackBar.open(`Error: ${errorMessages}`, 'Cerrar', { duration: 8000 });
        } else {
          this.snackBar.open('Error procesando la reserva', 'Cerrar', { duration: 5000 });
        }
      },
      complete: () => this.isSubmittingSignal.set(false)
    });
}


  canSubmit(): boolean {
    return this.guestForm.valid && this.bookingForm.valid && this.mainForm.get('acceptTerms')?.value === true;
  }

  closeSuccessDialog(): void {
    this.showSuccessDialogSignal.set(false);
  }

  goToMyBookings(): void {
    this.closeSuccessDialog();
    if (this.isAuthenticated()) {
      this.router.navigate(['/mis-reservas']);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/mis-reservas' } });
    }
  }

  goToHome(): void {
    this.closeSuccessDialog();
    this.router.navigate(['/']);
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T12:00:00.000Z`;
  }
  
  formatDateRange(): string {
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;
  
    if (!checkIn || !checkOut) return '';
  
    const checkInDate = checkIn instanceof Date ? checkIn : new Date(checkIn);
    const checkOutDate = checkOut instanceof Date ? checkOut : new Date(checkOut);
  
    return `${this.formatDate(checkInDate)} - ${this.formatDate(checkOutDate)}`;
  }
}