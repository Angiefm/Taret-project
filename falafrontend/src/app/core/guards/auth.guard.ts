import { Injectable, inject } from '@angular/core';
import { 
  CanMatch,
  Router, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot,
  Route,
  UrlSegment
} from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard implements CanMatch {
  
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  
  constructor(
    protected override router: Router,
    protected keycloakService: KeycloakService
  ) {
    super(router, keycloakService);
  }

  async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    console.log('authGuard verificando acceso a:', state.url);
    
    if (!this.authenticated) {
      console.log('usuario no autenticado, redirigiendo a login...');

      this.snackBar.open(
        '⚠️ Para reservar nuestras habitaciones de El Refugi Fala primero debes autenticarte',
        'Cerrar',
        { duration: 3000, panelClass: ['warn-snackbar'] }
      );

      setTimeout(() => {
        this.keycloakService.login({
          redirectUri: window.location.origin + state.url
        });
      }, 300);

      return false;
    }

    const requiredRoles = route.data?.['roles'] as string[];
    if (requiredRoles?.length) {
      const hasRequiredRole = requiredRoles.some(role => 
        this.keycloakService.isUserInRole(role)
      );
      
      if (!hasRequiredRole) {
        console.log('usuario sin permisos suficientes');
        this.router.navigate(['/sin-permisos']);
        return false;
      }
    }

    console.log('acceso permitido - Usuario autenticado');
    return true;
  }

  canMatch(route: Route, segments: UrlSegment[]): Promise<boolean> {
    return this.isAccessAllowed(
      {} as ActivatedRouteSnapshot,
      { url: `/${segments.map(s => s.path).join('/')}` } as RouterStateSnapshot
    );
  }
}
