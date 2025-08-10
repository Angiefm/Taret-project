import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hotel-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hotel-details-page">
      <div class="container">
        <h1>detalles del hotel</h1>
        <p>aquí se mostrarán los detalles completos del hotel seleccionado</p>
        <p class="note">este componente se desarrollará en próximas actividades</p>
      </div>
    </div>
  `,
  styles: [`
    .hotel-details-page {
      padding: 4rem 0;
      min-height: 50vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .container {
      text-align: center;
    }

    h1 {
      color: #334155;
      margin-bottom: 1rem;
    }

    .note {
      color: #6b7280;
      font-style: italic;
      margin-top: 1rem;
    }
  `]
})
export class HotelDetailsComponent {

}