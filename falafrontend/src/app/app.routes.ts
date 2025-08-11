import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) 
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