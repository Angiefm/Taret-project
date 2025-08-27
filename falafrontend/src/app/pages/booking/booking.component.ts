import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { HotelService } from '../../core/services/hotel.service';
import { RoomService } from '../../core/services/room.service';

import { BookingFormData, BookingResponse } from '../../core/models/booking.models';
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatStepperModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCheckboxModule
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
  private readonly availableHotelsSignal = signal<Hotel[]>([]);
  private readonly selectedHotelSignal = signal<Hotel | null>(null);
  private readonly availableRoomsSignal = signal<Room[]>([]);
  private readonly selectedRoomSignal = signal<Room | null>(null);
  private readonly isSubmittingSignal = signal<boolean>(false);
  private readonly showSuccessDialogSignal = signal<boolean>(false);
  private readonly bookingResultSignal = signal<BookingResponse | null>(null);
  private readonly estimatedPriceSignal = signal<number | null>(null);
  private readonly finalPriceSignal = signal<any>(null);
  private readonly userDataLoadedSignal = signal<boolean>(false);

  // computed values
  readonly availableHotels = this.availableHotelsSignal.asReadonly();
  readonly selectedHotel = this.selectedHotelSignal.asReadonly();
  readonly availableRooms = this.availableRoomsSignal.asReadonly();
  readonly selectedRoom = this.selectedRoomSignal.asReadonly();
  readonly isSubmitting = this.isSubmittingSignal.asReadonly();
  readonly showSuccessDialog = this.showSuccessDialogSignal.asReadonly();
  readonly bookingResult = this.bookingResultSignal.asReadonly();
  readonly estimatedPrice = this.estimatedPriceSignal.asReadonly();
  readonly finalPrice = this.finalPriceSignal.asReadonly();
  readonly userDataLoaded = this.userDataLoadedSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  // forms
  guestForm!: FormGroup;
  bookingForm!: FormGroup;
  mainForm!: FormGroup;

  // date constraints
  minDate = new Date();
  minCheckOutDate = computed(() => {
    const checkInDate = this.bookingForm?.get('checkInDate')?.value;
    if (checkInDate) {
      const minDate = new Date(checkInDate);
      minDate.setDate(minDate.getDate() + 1);
      return minDate;
    }
    return new Date();
  });

  // Form state
  private formDirty = false;

  ngOnInit(): void {
    console.log('BookingComponent inicializado');
    this.initializeForms();
    this.loadAvailableHotels();
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
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^(\+57|57)?[\s-]?[3][0-9]{9}$|^(\+57|57)?[\s-]?[6][0-9]{8}$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });

    // formulario de detalles de la reserva
    this.bookingForm = this.fb.group({
      hotelId: ['', Validators.required],
      roomId: ['', Validators.required],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      numberOfGuests: [2, [Validators.required, Validators.min(1), Validators.max(8)]],
      specialRequests: ['', Validators.maxLength(500)]
    });

    // formulario principal con términos
    this.mainForm = this.fb.group({
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  private loadAvailableHotels(): void {
    console.log('🏨 Cargando hoteles disponibles');
    
    this.hotelService.getAllHotels()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hotels) => {
          this.availableHotelsSignal.set(hotels);
          console.log('Hoteles cargados:', hotels.length);
        },
        error: (error) => {
          console.error('Error cargando hoteles:', error);
          this.snackBar.open('Error cargando hoteles disponibles', 'Cerrar', { duration: 5000 });
        }
      });
  }

  private loadAvailableRooms(hotelId: string): void {
    if (!hotelId) return;
    
    console.log('cargando habitaciones para hotel:', hotelId);
    
    this.roomService.getRoomsByHotel(hotelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rooms) => {
          this.availableRoomsSignal.set(rooms);
          console.log('Habitaciones cargadas:', rooms.length);
        },
        error: (error) => {
          console.error('Error cargando habitaciones:', error);
          this.snackBar.open('Error cargando habitaciones disponibles', 'Cerrar', { duration: 5000 });
          this.availableRoomsSignal.set([]);
        }
      });
  }

  private handleRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['hotelId']) {
          this.bookingForm.patchValue({ hotelId: params['hotelId'] });
          this.onHotelChange(params['hotelId']);
        }
        if (params['roomId']) {
          this.bookingForm.patchValue({ roomId: params['roomId'] });
        }
        if (params['checkIn']) {
          this.bookingForm.patchValue({ checkInDate: new Date(params['checkIn']) });
        }
        if (params['checkOut']) {
          this.bookingForm.patchValue({ checkOutDate: new Date(params['checkOut']) });
        }
        if (params['guests']) {
          this.bookingForm.patchValue({ numberOfGuests: parseInt(params['guests']) });
        }
      });
  }

  private setupFormWatchers(): void {
    this.guestForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.formDirty = true);

    this.bookingForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.formDirty = true);

    this.bookingForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        if (this.bookingForm.valid) {
          this.calculatePrice();
        }
      });
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
        this.userDataLoadedSignal.set(true);
      }
    }
  }

  fillUserData(): void {
    const user = this.authService.user();
    if (user) {
      this.guestForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      this.userDataLoadedSignal.set(true);
      this.snackBar.open('Datos de usuario cargados', 'Cerrar', { duration: 3000 });
    }
  }

  onHotelChange(hotelId: string): void {
    const hotel = this.availableHotels().find(h => h.id === hotelId);
    if (hotel) {
      this.selectedHotelSignal.set(hotel);
      console.log('Hotel seleccionado:', hotel.name);
      
      this.bookingForm.patchValue({ roomId: '' });
      this.selectedRoomSignal.set(null);
      
      this.loadAvailableRooms(hotelId);
    }
  }

  onRoomChange(roomId: string): void {
    const room = this.availableRooms().find(r => r.id === roomId);
    if (room) {
      this.selectedRoomSignal.set(room);
      console.log('Habitación seleccionada:', room.name);
    }
  }

  onDateChange(): void {
    // calidar fechas y calcular precio
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;
    
    if (checkIn && checkOut && checkOut <= checkIn) {
      this.bookingForm.get('checkOutDate')?.setValue('');
    }
    
    if (this.bookingForm.valid) {
      this.calculatePrice();
    }
  }

  private calculatePrice(): void {
    const formData = {
      ...this.bookingForm.value,
      checkInDate: this.formatDate(this.bookingForm.get('checkInDate')?.value),
      checkOutDate: this.formatDate(this.bookingForm.get('checkOutDate')?.value)
    };

    if (formData.hotelId && formData.roomId && formData.checkInDate && formData.checkOutDate) {
      this.bookingService.calculateBookingPrice(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.estimatedPriceSignal.set(result.totalPrice);
            this.finalPriceSignal.set(result.breakdown);
            console.log('Precio calculado:', result);
          },
          error: (error) => {
            console.error('Error calculando precio:', error);
          }
        });
    }
  }

  submitBooking(): void {
    if (!this.canSubmit()) {
      return;
    }

    this.isSubmittingSignal.set(true);

    const bookingData: BookingFormData = {
      ...this.guestForm.value,
      ...this.bookingForm.value,
      checkInDate: this.formatDate(this.bookingForm.get('checkInDate')?.value),
      checkOutDate: this.formatDate(this.bookingForm.get('checkOutDate')?.value),
      totalPrice: this.finalPrice()?.total || this.estimatedPrice() || 0
    };

    console.log('📝 Enviando reserva:', bookingData);

    this.bookingService.createBooking(bookingData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Reserva creada exitosamente:', response);
          this.bookingResultSignal.set(response);
          this.showSuccessDialogSignal.set(true);
          this.formDirty = false;
          
          // enviar confirmación por email
          if (response.data?.id) {
            this.bookingService.sendBookingConfirmation(response.data.id).subscribe();
          }
        },
        error: (error) => {
          console.error('Error creando reserva:', error);
          this.snackBar.open(
            error.message || 'Error procesando la reserva. Inténtelo de nuevo.',
            'Cerrar',
            { duration: 5000 }
          );
        },
        complete: () => {
          this.isSubmittingSignal.set(false);
        }
      });
  }

  canSubmit(): boolean {
    return this.guestForm.valid && 
           this.bookingForm.valid && 
           this.mainForm.get('acceptTerms')?.value === true;
  }

  showBookingSummary(): boolean {
    return this.bookingForm.get('hotelId')?.value && 
           this.bookingForm.get('roomId')?.value &&
           this.bookingForm.get('checkInDate')?.value && 
           this.bookingForm.get('checkOutDate')?.value;
  }

  numberOfNights(): number {
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;
    
    if (checkIn && checkOut) {
      return this.bookingService.calculateNumberOfNights(
        this.formatDate(checkIn),
        this.formatDate(checkOut)
      );
    }
    return 0;
  }

  formatDateRange(): string {
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;
    
    if (checkIn && checkOut) {
      return `${this.formatDisplayDate(checkIn)} - ${this.formatDisplayDate(checkOut)}`;
    }
    return '';
  }

  formatConfirmationDates(): string {
    const booking = this.bookingResult()?.data;
    if (booking) {
      return `${this.formatDisplayDate(booking.checkInDate)} - ${this.formatDisplayDate(booking.checkOutDate)}`;
    }
    return '';
  }

  getRoomName(): string {
    const selectedRoom = this.selectedRoom();
    if (selectedRoom) {
      return this.roomService.getRoomDisplayName ? 
        this.roomService.getRoomDisplayName(selectedRoom.roomType) : 
        this.getRoomTypeDisplayName(selectedRoom.roomType);
    }
    return 'Habitación seleccionada';
  }

  getRoomTypeDisplayName(roomType: Room['roomType']): string {
    const displayNames = {
      'single-1': 'Individual Estándar',
      'single-2': 'Individual Premium',
      'single-3': 'Individual Deluxe', 
      'suite': 'Suite',
      'suite-kid': 'Suite Familiar'
    };
    return displayNames[roomType] || 'Habitación';
  }

  getSpecialRequestsLength(): number {
    return this.bookingForm.get('specialRequests')?.value?.length || 0;
  }

  closeSuccessDialog(): void {
    this.showSuccessDialogSignal.set(false);
  }

  goToMyBookings(): void {
    this.closeSuccessDialog();
    if (this.isAuthenticated()) {
      this.router.navigate(['/mis-reservas']);
    } else {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/mis-reservas' } 
      });
    }
  }

  goToHome(): void {
    this.closeSuccessDialog();
    this.router.navigate(['/']);
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  private formatDisplayDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}