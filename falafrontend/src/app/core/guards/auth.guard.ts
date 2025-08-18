import { Injectable, inject } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild, 
  CanMatch,
  Router, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot,
  Route,
  UrlSegment
} from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard implements CanMatch {
  
  private readonly authService = inject(AuthService);
  
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
      
      await this.keycloakService.login({
        redirectUri: window.location.origin + state.url
      });
      
      return false;
    }

    const requiredRoles = route.data?.['roles'] as string[];
    if (requiredRoles && requiredRoles.length > 0) {
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

@Injectable({
  providedIn: 'root'
})
export class AdminGuard extends KeycloakAuthGuard {
  
  private readonly authService = inject(AuthService);
  
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
    
    console.log('🔍 adminGuard verificando acceso a:', state.url);
    
    if (!this.authenticated) {
      console.log('no autenticado, redirigiendo a login...');
      await this.keycloakService.login({
        redirectUri: window.location.origin + state.url
      });
      return false;
    }

    const adminRoles = route.data?.['roles'] || [
      'admin', 
      'hotel_manager', 
      'super_admin'
    ];
    
    const hasAdminRole = adminRoles.some((role: string) => 
      this.keycloakService.isUserInRole(role)
    );

    if (!hasAdminRole) {
      console.log('sin permisos de administrador');
      this.router.navigate(['/'], {
        queryParams: { 
          error: 'insufficient_permissions',
          required: 'admin'
        }
      });
      return false;
    }

    console.log('acceso de administrador permitido');
    return true;
  }

  private getUserAdminLevel(): number {
    if (this.keycloakService.isUserInRole('super_admin')) return 3;
    if (this.keycloakService.isUserInRole('admin')) return 2;
    if (this.keycloakService.isUserInRole('hotel_manager')) return 1;
    return 0;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate, CanActivateChild {
  
  private readonly keycloakService = inject(KeycloakService);
  private readonly router = inject(Router);
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkGuestAccess(state.url);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkGuestAccess(state.url);
  }

  private checkGuestAccess(url: string): boolean {
    console.log('🔍 GuestGuard verificando acceso a:', url);
    
    if (this.keycloakService.isLoggedIn()) {
      console.log('usuario autenticado, redirigiendo a dashboard');
      
      const redirectUrl = this.getRedirectUrlForAuthenticatedUser();
      this.router.navigate([redirectUrl]);
      return false;
    }
    
    console.log('acceso de invitado permitido');
    return true;
  }

  private getRedirectUrlForAuthenticatedUser(): string {
    const roles = this.keycloakService.getUserRoles();
    
    if (roles.includes('admin') || roles.includes('super_admin')) {
      return '/dashboard';
    } else if (roles.includes('hotel_manager')) {
      return '/dashboard';
    } else {
      return '/dashboard';
    }
  }
}