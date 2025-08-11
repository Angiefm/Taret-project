import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  // Current selections
  selectedLanguage = this.languages[0];
  selectedCurrency = this.currencies[0];
  isLanguageDropdownOpen = false;
  isMobileMenuOpen = false;

  constructor() {}

  ngOnInit(): void {
    // Initialize component
  }

  // Language dropdown methods
  toggleLanguageDropdown(): void {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  selectLanguage(language: any): void {
    this.selectedLanguage = language;
    this.isLanguageDropdownOpen = false;
    console.log('Idioma seleccionado:', language);
    // Aquí implementaré la lógica de cambio de idioma
  }

  // Currency methods
  cycleCurrency(): void {
    const currentIndex = this.currencies.findIndex(c => c.code === this.selectedCurrency.code);
    const nextIndex = (currentIndex + 1) % this.currencies.length;
    this.selectedCurrency = this.currencies[nextIndex];
    console.log('Moneda cambiada a:', this.selectedCurrency);
    // Aquí implementaré la lógica de cambio de moneda
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
    console.log('Navegando a:', route);
  }

  onLoginClick(): void {
    console.log('Iniciando sesión...');
    // Aquí implementaré la lógica de login
  }

  // Close dropdowns when clicking outside
  onDocumentClick(event: Event): void {
    if (this.isLanguageDropdownOpen) {
      this.isLanguageDropdownOpen = false;
    }
  }
}