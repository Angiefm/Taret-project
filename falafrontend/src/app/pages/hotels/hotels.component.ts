import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hotels-page">
      <div class="container">
        <h1>página de hoteles</h1>
        <p>aquí se mostrará la lista completa de hoteles</p>
        <p class="note">esta página se desarrollará en próximas actividades</p>
      </div>
    </div>
  `,
  styles: [`
    .hotels-page {
      padding: 4rem 0;
      min-height: 50vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #d1d5db;
    }

    .container {
      text-align: center;
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #334155;
      margin-bottom: 1rem;
      font-family: serif;
    }

    .note {
      color: #6b7280;
      font-style: italic;
      margin-top: 1rem;
    }
  `]
})
export class HotelsComponent {

}