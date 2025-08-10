import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-container">
        <!-- Logo -->
        <div class="logo">
          <a routerLink="/" class="logo-link">
            <div class="logo-icon">
              <img src="assets/fala-logo.png" alt="El Refugi Fala Logo" class="logo-image">
            </div>
            <div class="logo-text">
              <h1>EL REFUGI</h1>
              <p>FALA</p>
            </div>
          </a>
        </div>

        <!-- Navigation -->
        <nav class="navigation hidden-mobile">
          <a routerLink="/" class="nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">inicio</a>
          <a routerLink="/hoteles" class="nav-link" routerLinkActive="active">hoteles</a>
        </nav>

        <!-- Right side - Language, Currency, Login -->
        <div class="header-right">
          <!-- Language & Currency -->
          <div class="locale-info hidden-mobile">
            <div class="language">
              <span class="globe-icon">🌐</span>
              <span>ES</span>
              <span class="chevron">▼</span>
            </div>
            <div class="currency">COP</div>
          </div>
          
          <!-- Login Button -->
          <button class="login-btn btn-secondary">
            iniciar sesión
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: #334155; /* azul petróleo oscuro */
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 100;
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 5rem;
    }

    /* Logo Styles */
    .logo {
      display: flex;
      align-items: center;
    }

    .logo-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }

    .logo-icon {
      width: 4.5rem;
      height: 4.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .logo-image {
      width: 100%;
      height: 100%;
      object-fit: contain; /* Mantiene proporciones */
      border-radius: 0.5rem; /* Opcional: esquinas redondeadas */
    }

    .logo-text h1 {
      color: #f1f5f9; /* gris claro */
      font-size: 1.5rem;
      font-family: serif;
      font-weight: 400;
      margin: 0;
      letter-spacing: 0.1em;
    }

    .logo-text p {
      color: #f1f5f9;
      font-size: 0.875rem;
      font-family: serif;
      margin: 0;
      letter-spacing: 0.2em;
    }

    /* Navigation Styles */
    .navigation {
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      color: #f1f5f9;
      text-decoration: none;
      font-weight: 500;
      font-size: 1rem;
      padding: 0.5rem 0;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .nav-link:hover,
    .nav-link.active {
      color: #fb7185; /* rosa coral */
      border-bottom-color: #fb7185;
    }

    /* Header Right Styles */
    .header-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .locale-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #f1f5f9;
      font-size: 0.875rem;
    }

    .language {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      cursor: pointer;
      transition: color 0.3s ease;
    }

    .language:hover {
      color: #fb7185; /* rosa coral */
    }

    .globe-icon {
      font-size: 1rem;
    }

    .chevron {
      font-size: 0.75rem;
    }

    .currency {
      font-weight: 500;
    }

    .login-btn {
      background-color: #fb7185; /* rosa coral */
      color: white;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .login-btn:hover {
      background-color: #f43f5e; /* rosa más oscuro */
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-container {
        padding: 0 0.5rem;
      }

      .logo-text h1 {
        font-size: 1.25rem;
      }

      .logo-text p {
        font-size: 0.75rem;
      }

      .login-btn {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
      }
    }
  `]
})
export class HeaderComponent {
  
}