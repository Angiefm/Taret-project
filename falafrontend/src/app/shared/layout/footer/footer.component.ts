import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  // Navigation links (solo inicio y hoteles)
  navigationLinks = [
    { label: 'inicio', route: '/' },
    { label: 'hoteles', route: '/hoteles' }
  ];

  // Social media links
  socialMedia = [
    { icon: '📘', name: 'Facebook', url: 'https://facebook.com' },
    { icon: '📷', name: 'Instagram', url: 'https://instagram.com' },
    { icon: '🐦', name: 'Twitter', url: 'https://twitter.com' },
    { icon: '💼', name: 'LinkedIn', url: 'https://linkedin.com' }
  ];

  constructor(private router: Router) {}

  onNavigate(route: string): void {
    this.router.navigate([route]); // navegación real
  }

  onSocialClick(social: any): void {
    window.open(social.url, '_blank'); // abre red social en nueva pestaña
  }
}
