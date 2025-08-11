import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordValidator
      ]],
      rememberMe: [false]
    });
  }

  passwordValidator(control: any) {
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

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get rememberMe() { return this.loginForm.get('rememberMe'); }

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

  // Método para enviar el formulario
  onSubmit() {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      console.log('Datos del formulario:', formData);
      
      // Aquí irá la lógica de autenticación con Keycloak en el futuro
      alert('¡Formulario válido! (Integración con Keycloak pendiente)');
      
      // Por ahora, redirigir a la página principal
      this.router.navigate(['/']);
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      this.loginForm.markAllAsTouched();
    }
  }

  // Método para alternar visibilidad de contraseña
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  // Método para navegar al registro (placeholder)
  goToRegister() {
    this.router.navigate(['/registro']);
  }

  // Método para olvidé mi contraseña
  forgotPassword() {
    alert('Funcionalidad de recuperación de contraseña próximamente');
  }
}