import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  
  // Contact information
  contactInfo = {
    phone: '+57 3197809676',
    email: 'info@elrefugifala.com',
    address: 'bogotá, colombia'
  };

  // Navigation links
  navigationLinks = [
    { label: 'inicio', route: '/' },
    { label: 'hoteles', route: '/hoteles' },
    { label: 'nosotros', route: '/nosotros' },
    { label: 'contacto', route: '/contacto' }
  ];

  // Support links
  supportLinks = [
    { label: 'ayuda', route: '/ayuda' },
    { label: 'términos y condiciones', route: '/terminos' },
    { label: 'política de privacidad', route: '/privacidad' },
    { label: 'política de cancelación', route: '/cancelacion' }
  ];

  // Social media links
  socialMedia = [
    { icon: '📘', name: 'Facebook', url: 'https://facebook.com' },
    { icon: '📷', name: 'Instagram', url: 'https://instagram.com' },
    { icon: '🐦', name: 'Twitter', url: 'https://twitter.com' },
    { icon: '💼', name: 'LinkedIn', url: 'https://linkedin.com' }
  ];

  onNavigate(route: string): void {
    console.log('Navegando a:', route);
    // Aquí implementaré la navegación con Router
  }

  onSocialClick(social: any): void {
    console.log('Abriendo red social:', social.name);
    // Aquí abriré la URL en una nueva pestaña
    // window.open(social.url, '_blank');
  }
}