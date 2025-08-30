import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';


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
    path: 'hotel/:id/rooms',
    loadComponent: () => import('./features/hotels/hotel-rooms/hotel.rooms.component').then(m => m.HotelRoomsComponent)
  },

  
  {
    path: 'booking',
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent),
    canActivate: [AuthGuard],
    canDeactivate: [(component: any) => component.canDeactivate ? component.canDeactivate() : true]
  },

  {
    path: 'mis-reservas',
    loadComponent: () => import('./pages/booking-list/booking-list.component').then(m => m.BookingListComponent),
    canActivate: [AuthGuard]
  },

  {
    path: 'booking/confirmation/:id',
    loadComponent: () => import('./features/booking/booking-confirmation/booking-confirmation.component')
      .then(m => m.BookingConfirmationComponent),
    canActivate: [AuthGuard]
  },

  {
    path: '**',
    redirectTo: ''
  }
];