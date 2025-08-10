import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <!-- Main Footer Content -->
        <div class="footer-grid">
          <!-- Logo and Description -->
          <div class="footer-brand">
            <div class="footer-logo">
              <div class="logo-icon">
                <img src="assets/fala-logo.png" alt="El Refugi Fala Logo" class="logo-image">
              </div>
              <div class="logo-text">
                <h4>EL REFUGI FALA</h4>
              </div>
            </div>
            <p class="brand-description">
              tu refugio perfecto en los destinos más hermosos de colombia.
              experiencias únicas que recordarás para siempre.
            </p>
          </div>

          <!-- Links Column -->
          <div class="footer-column">
            <h5 class="column-title">enlaces</h5>
            <ul class="footer-links">
              <li><span class="footer-link">inicio</span></li>
              <li><span class="footer-link">hoteles</span></li>
              <li><span class="footer-link">nosotros</span></li>
              <li><span class="footer-link">contacto</span></li>
            </ul>
          </div>

          <!-- Support Column -->
          <div class="footer-column">
            <h5 class="column-title">soporte</h5>
            <ul class="footer-links">
              <li><span class="footer-link">ayuda</span></li>
              <li><span class="footer-link">términos y condiciones</span></li>
              <li><span class="footer-link">política de privacidad</span></li>
              <li><span class="footer-link">política de cancelación</span></li>
            </ul>
          </div>

          <!-- Contact Column -->
          <div class="footer-column">
            <h5 class="column-title">contacto</h5>
            <div class="contact-info">
              <p class="contact-item">📞 +57 3197809676</p>
              <p class="contact-item">✉️ info@elrefugifala.com</p>
              <p class="contact-item">📍 bogotá, colombia</p>
            </div>
            
            <!-- Social Media -->
            <div class="social-media">
              <h6 class="social-title">síguenos</h6>
              <div class="social-links">
                <span class="social-link">📘</span>
                <span class="social-link">📷</span>
                <span class="social-link">🐦</span>
                <span class="social-link">💼</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="bottom-accent"></div>
          <p class="copyright">
            &copy; 2025 el refugi fala - una app hecha con 🩷 - todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #334155;
      color: #cbd5e1;
      border-top: 4px solid #fb7185;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 1rem 0;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    /* Brand Section */
    .footer-brand {
      max-width: 400px;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logo-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 0.375rem;
    }

    .logo-text h4 {
      color: #f1f5f9;
      font-size: 1.125rem;
      font-family: serif;
      font-weight: 400;
      margin: 0;
      letter-spacing: 0.1em;
    }

    .brand-description {
      color: #94a3b8;
      line-height: 1.6;
      margin: 0;
      max-width: 300px;
    }

    /* Footer Columns */
    .column-title {
      color: #f1f5f9;
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
      letter-spacing: 0.05em;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 0.5rem;
    }

    .footer-link {
      color: #cbd5e1;
      font-size: 0.875rem;
      cursor: pointer;
      transition: color 0.3s ease;
    }

    .footer-link:hover {
      color: #fb7185;
    }

    .contact-info {
      margin-bottom: 1.5rem;
    }

    .contact-item {
      color: #cbd5e1;
      font-size: 0.875rem;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .social-title {
      color: #f1f5f9;
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0 0 0.75rem 0;
    }

    .social-links {
      display: flex;
      gap: 0.75rem;
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      background-color: #475569;
      border-radius: 0.375rem;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      background-color: #fb7185;
      transform: translateY(-2px);
    }

    .footer-bottom {
      border-top: 1px solid #475569;
      padding: 1.5rem 0;
      text-align: center;
      position: relative;
    }

    .bottom-accent {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 2px;
      background-color: #fb7185;
      border-radius: 1px;
    }

    .copyright {
      color: #94a3b8;
      font-size: 0.875rem;
      margin: 0;
    }

    @media (max-width: 1024px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }

      .footer-brand {
        grid-column: 1 / -1;
        max-width: none;
      }
    }

    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .footer-container {
        padding: 2rem 0.5rem 0;
      }

      .footer-brand {
        text-align: center;
      }

      .footer-logo {
        justify-content: center;
      }

      .brand-description {
        text-align: center;
        max-width: none;
      }
    }
  `]
})
export class FooterComponent {
  
}