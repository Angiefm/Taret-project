import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
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
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordValidator
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      acceptTerms: [false, [
        Validators.requiredTrue
      ]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  // Validador personalizado para contraseña
  passwordValidator(control: AbstractControl) {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

    if (!passwordValid) {
      return { invalidPassword: true };
    }
    return null;
  }

  // Validador para que las contraseñas coincidan
  passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Getters para facilitar el acceso a los controles del formulario
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get acceptTerms() { return this.registerForm.get('acceptTerms'); }

  // Métodos para obtener mensajes de error específicos
  getFirstNameErrorMessage() {
    if (this.firstName?.hasError('required')) {
      return 'El nombre es requerido';
    }
    if (this.firstName?.hasError('minlength')) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (this.firstName?.hasError('pattern')) {
      return 'El nombre solo puede contener letras y espacios';
    }
    return '';
  }

  getLastNameErrorMessage() {
    if (this.lastName?.hasError('required')) {
      return 'El apellido es requerido';
    }
    if (this.lastName?.hasError('minlength')) {
      return 'El apellido debe tener al menos 2 caracteres';
    }
    if (this.lastName?.hasError('pattern')) {
      return 'El apellido solo puede contener letras y espacios';
    }
    return '';
  }

  getEmailErrorMessage() {
    if (this.email?.hasError('required')) {
      return 'El email es requerido';
    }
    if (this.email?.hasError('email')) {
      return 'Ingresa un email válido';
    }
    return '';
  }

  getPasswordErrorMessage() {
    if (this.password?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (this.password?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (this.password?.hasError('invalidPassword')) {
      return 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial';
    }
    return '';
  }

  getConfirmPasswordErrorMessage() {
    if (this.confirmPassword?.hasError('required')) {
      return 'Confirma tu contraseña';
    }
    if (this.registerForm.hasError('passwordMismatch') && this.confirmPassword?.touched) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  getTermsErrorMessage() {
    if (this.acceptTerms?.hasError('required')) {
      return 'Debes aceptar los términos y condiciones';
    }
    return '';
  }

  // Método para enviar el formulario
  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      console.log('Datos del registro:', formData);
      
      // aqui va a ser la logica para conectar con keycloak
      alert('¡Registro exitoso! (Integración con Keycloak pendiente)');
      
      this.router.navigate(['/login']);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  viewTerms() {
    alert('Términos y condiciones próximamente');
  }
}