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
    path: 'hotel/:id/rooms',
    loadComponent: () => import('./features/hotels/hotel-rooms/hotel.rooms.component').then(m => m.HotelRoomsComponent)
  },


  {
    path: 'booking',
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent),
    canDeactivate: [(component: any) => component.canDeactivate ? component.canDeactivate() : true]
  },

  {
    path: '**',
    redirectTo: ''
  }
];