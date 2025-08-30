import { Component, OnInit, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  // Navigation menu items
  navigationItems = [
    { label: 'inicio', route: '/', exact: true },
    { label: 'hoteles', route: '/hoteles', exact: false }
  ];

  // Available languages
  languages = [
    { code: 'ES', name: 'Español' },
    { code: 'EN', name: 'English' }
  ];

  // Available currencies
  currencies = [
    { code: 'COP', name: 'Peso Colombiano' },
    { code: 'USD', name: 'Dólar Americano' }
  ];

  selectedLanguage = this.languages[0];
  selectedCurrency = this.currencies[0];
  isLanguageDropdownOpen = false;
  isMobileMenuOpen = false;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly userInfo = computed(() => this.authService.user());

  ngOnInit(): void {}

  // Language dropdown methods
  toggleLanguageDropdown(): void {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  selectLanguage(language: any): void {
    this.selectedLanguage = language;
    this.isLanguageDropdownOpen = false;
    console.log('Idioma seleccionado:', language);
  }

  // Currency methods
  cycleCurrency(): void {
    const currentIndex = this.currencies.findIndex(c => c.code === this.selectedCurrency.code);
    const nextIndex = (currentIndex + 1) % this.currencies.length;
    this.selectedCurrency = this.currencies[nextIndex];
    console.log('Moneda cambiada a:', this.selectedCurrency);
  }

  // Mobile menu methods
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // Navigation methods
  onNavigate(route: string): void {
    this.closeMobileMenu();
    this.router.navigate([route]);
  }

  onLoginClick(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.logout();
    } else {
      this.authService.login();
    }
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isLanguageDropdownOpen) {
      this.isLanguageDropdownOpen = false;
    }
  }
}
