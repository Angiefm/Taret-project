import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'hoteles',
    loadComponent: () => import('./pages/hotels/hotels.component').then(m => m.HotelsComponent)
  },
  {
    path: 'hotel/:id',
    loadComponent: () => import('./features/hotels/hotel-details/hotel-details.component').then(m => m.HotelDetailsComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];