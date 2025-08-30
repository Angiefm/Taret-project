import { Component, OnInit, OnDestroy, Inject, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';

import { BookingService } from '../../core/services/booking.service';
import { Booking, BookingStatus } from '../../core/models/booking.models';

export interface BookingCancellationData {
  booking: Booking;
}

export interface BookingCancellationResult {
  cancelled: boolean;
  booking?: Booking;
  reason?: string;
}

@Component({
  selector: 'app-booking-cancellation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
    MatStepperModule
  ],
  templateUrl: './booking-cancellation.component.html',
  styleUrl: './booking-cancellation.component.scss'
})
export class BookingCancellationComponent implements OnInit, OnDestroy {
  
  private readonly fb = inject(FormBuilder);
  private readonly bookingService = inject(BookingService);
  private readonly snackBar = inject(MatSnackBar);
  
  private destroy$ = new Subject<void>();

  private readonly isSubmittingSignal = signal<boolean>(false);
  private readonly showConfirmationSignal = signal<boolean>(false);
  private readonly refundAmountSignal = signal<number | null>(null);
  private readonly cancellationFeesSignal = signal<number | null>(null);

  readonly isSubmitting = this.isSubmittingSignal.asReadonly();
  readonly showConfirmation = this.showConfirmationSignal.asReadonly();
  readonly refundAmount = this.refundAmountSignal.asReadonly();
  readonly cancellationFees = this.cancellationFeesSignal.asReadonly();
  readonly netRefund = computed(() => {
    const refund = this.refundAmount();
    const fees = this.cancellationFees();
    return refund && fees ? refund - fees : refund;
  });

  cancellationForm!: FormGroup;
  confirmationForm!: FormGroup;

  readonly cancellationReasons = [
    { value: 'change_of_plans', label: 'Cambio de planes' },
    { value: 'emergency', label: 'Emergencia familiar' },
    { value: 'work_reasons', label: 'Motivos laborales' },
    { value: 'health_issues', label: 'Problemas de salud' },
    { value: 'travel_restrictions', label: 'Restricciones de viaje' },
    { value: 'financial_reasons', label: 'Motivos económicos' },
    { value: 'dissatisfaction', label: 'Insatisfacción con el servicio' },
    { value: 'other', label: 'Otro motivo' }
  ];

  constructor(
    public dialogRef: MatDialogRef<BookingCancellationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingCancellationData
  ) {}

  ngOnInit(): void {
    console.log('BookingCancellationComponent inicializado para reserva:', this.data.booking.bookingNumber);
    this.initializeForms();
    this.calculateRefundAmount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.cancellationForm = this.fb.group({
      reason: ['', Validators.required],
      customReason: [''],
      additionalComments: ['', Validators.maxLength(500)]
    });

    this.confirmationForm = this.fb.group({
      acceptCancellationPolicy: [false, Validators.requiredTrue],
      confirmCancellation: [false, Validators.requiredTrue]
    });

    this.cancellationForm.get('reason')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(reason => {
        const customReasonControl = this.cancellationForm.get('customReason');
        if (reason === 'other') {
          customReasonControl?.setValidators([Validators.required, Validators.minLength(5)]);
        } else {
          customReasonControl?.clearValidators();
          customReasonControl?.setValue('');
        }
        customReasonControl?.updateValueAndValidity();
      });
  }

  private calculateRefundAmount(): void {
    const booking = this.data.booking;
    const totalPaid = booking.priceBreakdown.total;
    const checkInDate = new Date(booking.checkInDate);
    const today = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    let cancellationFee = 0;

    if (daysUntilCheckIn >= 30) { //agrego más jeje
      // cancelación con 30+ días de anticipación: reembolso completo
      refundPercentage = 100;
      cancellationFee = 0;
    } else if (daysUntilCheckIn >= 15) {
      // cancelación con 15-29 días de anticipación: 80% de reembolso
      refundPercentage = 80;
      cancellationFee = totalPaid * 0.10; // 10% de tarifa administrativa
    } else if (daysUntilCheckIn >= 7) {
      // cancelación con 7-14 días de anticipación: 50% de reembolso
      refundPercentage = 50;
      cancellationFee = totalPaid * 0.15; // 15% de tarifa administrativa
    } else if (daysUntilCheckIn >= 1) {
      // cancelación con menos de 7 días: 25% de reembolso
      refundPercentage = 25;
      cancellationFee = totalPaid * 0.20; // 20% de tarifa administrativa
    } else {
      // cancelación el mismo día: sin reembolso
      refundPercentage = 0;
      cancellationFee = 0;
    }

    const refundAmount = (totalPaid * refundPercentage) / 100;
    
    this.refundAmountSignal.set(refundAmount);
    this.cancellationFeesSignal.set(cancellationFee);

    console.log('Cálculo de reembolso:', {
      totalPaid,
      daysUntilCheckIn,
      refundPercentage,
      refundAmount,
      cancellationFee,
      netRefund: refundAmount - cancellationFee
    });
  }

  proceedToConfirmation(): void {
    if (this.cancellationForm.valid) {
      this.showConfirmationSignal.set(true);
    }
  }

  goBackToForm(): void {
    this.showConfirmationSignal.set(false);
  }

  submitCancellation(): void {
    if (!this.canSubmitCancellation()) {
      return;
    }

    this.isSubmittingSignal.set(true);

    const formValue = this.cancellationForm.value;
    const reason = formValue.reason === 'other' ? formValue.customReason : 
                  this.cancellationReasons.find(r => r.value === formValue.reason)?.label;
    
    const cancellationReason = `${reason}${formValue.additionalComments ? ` - ${formValue.additionalComments}` : ''}`;

    console.log('Cancelando reserva:', this.data.booking.id, 'Motivo:', cancellationReason);

    this.bookingService.cancelBooking(this.data.booking.id, cancellationReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Reserva cancelada exitosamente:', response);
          
          const result: BookingCancellationResult = {
            cancelled: true,
            booking: response.data,
            reason: cancellationReason
          };

          this.snackBar.open('Reserva cancelada exitosamente', 'Cerrar', {
            duration: 3000
          });

          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Error cancelando reserva:', error);
          this.snackBar.open(
            error.message || 'Error cancelando la reserva. Inténtelo de nuevo.',
            'Cerrar',
            { duration: 5000 }
          );
        },
        complete: () => {
          this.isSubmittingSignal.set(false);
        }
      });
  }

  canSubmitCancellation(): boolean {
    return this.cancellationForm.valid && 
           this.confirmationForm.valid && 
           !this.isSubmitting();
  }

  closeDialog(): void {
    const result: BookingCancellationResult = {
      cancelled: false
    };
    this.dialogRef.close(result);
  }

  get booking(): Booking {
    return this.data.booking;
  }

  get selectedReasonLabel(): string {
    const reason = this.cancellationForm.get('reason')?.value;
    if (reason === 'other') {
      return this.cancellationForm.get('customReason')?.value || 'Motivo personalizado';
    }
    return this.cancellationReasons.find(r => r.value === reason)?.label || '';
  }

  get daysUntilCheckIn(): number {
    const checkInDate = new Date(this.booking.checkInDate);
    const today = new Date();
    return Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  get isLastMinuteCancellation(): boolean {
    return this.daysUntilCheckIn < 7;
  }

  get canBeCancelled(): boolean {
    return this.booking.status === BookingStatus.CONFIRMED || 
           this.booking.status === BookingStatus.PENDING;
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

  formatDateRange(): string {
    const checkIn = this.formatDisplayDate(this.booking.checkInDate);
    const checkOut = this.formatDisplayDate(this.booking.checkOutDate);
    return `${checkIn} - ${checkOut}`;
  }
}