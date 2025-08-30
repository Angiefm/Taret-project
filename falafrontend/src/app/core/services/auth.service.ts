import { Injectable, signal, computed, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';
import { Observable, from, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  roles: string[];
  isAuthenticated: boolean;
  preferences?: {
    theme: 'light' | 'dark';
    language: string;
  };
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  lastActivity: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly keycloakService = inject(KeycloakService);
  private readonly router = inject(Router);

  private readonly authState = signal<AuthState>({
    user: null,
    isLoading: false,
    error: null,
    lastActivity: null
  });

  readonly user = computed(() => this.authState().user);
  readonly isLoading = computed(() => this.authState().isLoading);
  readonly error = computed(() => this.authState().error);
  readonly isAuthenticated = computed(() => this.authState().user?.isAuthenticated ?? false);
  readonly userRoles = computed(() => this.authState().user?.roles ?? []);
  readonly userName = computed(() => {
    const user = this.authState().user;
    return user ? `${user.firstName} ${user.lastName}`.trim() || user.username : '';
  });

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.userSubject.asObservable();

  constructor() {
    this.initializeAuthState();
    this.setupTokenRefresh();
  }

  private async initializeAuthState(): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      if (this.keycloakService.isLoggedIn()) {
        await this.loadUserData();
        console.log('usuario autenticado correctamente');
      } else {
        console.log('usuario no autenticado');
        this.clearUserState();
      }
    } catch (error) {
      console.error('error inicializando autenticación:', error);
      this.updateState({ 
        error: 'Error al inicializar la autenticación',
        user: null 
      });
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  private async loadUserData(): Promise<void> {
    try {
      const [userProfile, roles] = await Promise.all([
        this.keycloakService.loadUserProfile(),
        Promise.resolve(this.keycloakService.getUserRoles())
      ]);

      const user: User = {
        id: userProfile.id || (userProfile as any).sub || '',
        email: userProfile.email || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        username: userProfile.username || (userProfile as any).preferred_username || '',
        roles: roles || [],
        isAuthenticated: true,
        preferences: {
          theme: 'light',
          language: 'es'
        }
      };

      this.updateState({ 
        user, 
        error: null, 
        lastActivity: new Date() 
      });
      
      this.userSubject.next(user);

      console.log('datos de usuario cargados:', {
        username: user.username,
        email: user.email,
        roles: user.roles
      });

    } catch (error) {
      console.error('error cargando datos del usuario:', error);
      throw new Error('No se pudieron cargar los datos del usuario');
    }
  }

  private setupTokenRefresh(): void {
    setInterval(async () => {
      if (this.isAuthenticated()) {
        await this.refreshToken(300); // 5 minutos
      }
    }, 5 * 60 * 1000);

    setInterval(() => {
      if (this.isAuthenticated() && this.isSessionNearExpiry()) {
        console.warn('sesión próxima a expirar');
      }
    }, 60 * 1000);
  }

  async login(options?: { redirectUrl?: string; locale?: string; prompt?: 'none' | 'login' | 'consent' }): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      console.log('Iniciando proceso de login...');
      
      const loginOptions = {
        redirectUri: window.location.origin + (options?.redirectUrl || '/dashboard'),
        locale: options?.locale || 'es',
        prompt: options?.prompt
      };

      await this.keycloakService.login(loginOptions);
    } catch (error) {
      console.error('error en login:', error);
      this.updateState({ error: 'Error al iniciar sesión. Inténtalo de nuevo.', isLoading: false });
      throw error;
    }
  }

  async logout(options?: { redirectUrl?: string; clearCache?: boolean }): Promise<void> {
    this.updateState({ isLoading: true });

    try {
      console.log('Cerrando sesión...');
      this.clearUserState();
      
      if (options?.clearCache) {
        localStorage.clear();
        sessionStorage.clear();
      }

      const redirectUri = window.location.origin + (options?.redirectUrl || '/');
      await this.keycloakService.logout(redirectUri);
      
    } catch (error) {
      console.error('error en logout:', error);
      this.updateState({ error: 'Error al cerrar sesión', isLoading: false });
      throw error;
    }
  }

  async forceReAuth(redirectUrl?: string): Promise<void> {
    console.log('forzando re-autenticación...');
    this.clearUserState();
    await this.login({ redirectUrl });
  }

  async getToken(): Promise<string> {
    try {
      const token = await this.keycloakService.getToken();
      if (!token) throw new Error('No token available');
      return token;
    } catch (error) {
      console.error('error obteniendo token:', error);
      return '';
    }
  }

  async refreshToken(minValidity: number = 30): Promise<boolean> {
    try {
      const refreshed = await this.keycloakService.updateToken(minValidity);
      
      if (refreshed) {
        console.log('token refrescado automáticamente');
        this.updateState({ lastActivity: new Date() });
        await this.loadUserData();
      }
      
      return refreshed;
    } catch (error) {
      console.error('error refrescando token:', error);
      const errorObj = error as any;
      if (errorObj?.error === 'invalid_grant') {
        console.log('token expirado, redirigiendo a login...');
        await this.forceReAuth();
      }
      return false;
    }
  }

  isSessionNearExpiry(minutesThreshold: number = 5): boolean {
    try {
      const keycloak = this.keycloakService.getKeycloakInstance();
      if (!keycloak?.tokenParsed?.exp) return false;
      const expirationTime = keycloak.tokenParsed.exp * 1000;
      const timeUntilExpiry = expirationTime - Date.now();
      return timeUntilExpiry <= (minutesThreshold * 60 * 1000);
    } catch (error) {
      console.error('Error verificando expiración de sesión:', error);
      return false;
    }
  }

  hasRole(role: string): boolean {
    try { return this.keycloakService.isUserInRole(role); } 
    catch (error) { console.error('Error verificando rol:', error); return false; }
  }

  hasAnyRole(roles: string[]): boolean { return roles.some(role => this.hasRole(role)); }
  hasAllRoles(roles: string[]): boolean { return roles.every(role => this.hasRole(role)); }
  isAdmin(): boolean { return this.hasAnyRole(['admin', 'hotel_manager', 'super_admin']); }
  canManageHotels(): boolean { return this.hasAnyRole(['admin', 'hotel_manager']); }
  getUserRoles(): string[] { return this.keycloakService.getUserRoles() || []; }


  getUserProfile(): Observable<any> {
    return from(this.keycloakService.loadUserProfile()).pipe(
      tap(profile => console.log('Perfil de usuario obtenido:', profile)),
      catchError(error => {
        console.error('error cargando perfil:', error);
        return throwError(() => new Error('No se pudo cargar el perfil del usuario'));
      })
    );
  }

  async getAuthInfo(): Promise<any> {
    try {
      const token = await this.getToken();
      const state = this.authState();
      return {
        isLoggedIn: this.keycloakService.isLoggedIn(),
        username: this.keycloakService.getUsername(),
        roles: this.keycloakService.getUserRoles(),
        token: token ? `${token.substring(0, 50)}...` : 'No token',
        state: {
          user: state.user,
          isLoading: state.isLoading,
          error: state.error,
          lastActivity: state.lastActivity
        },
        keycloakInfo: {
          realm: this.keycloakService.getKeycloakInstance()?.realm,
          clientId: this.keycloakService.getKeycloakInstance()?.clientId,
          serverUrl: this.keycloakService.getKeycloakInstance()?.authServerUrl
        }
      };
    } catch (error) {
      return { error: 'Error obteniendo información de autenticación', message: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  async updateUserPreferences(preferences: Partial<User['preferences']>): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) throw new Error('Usuario no autenticado');

    const currentPreferences = currentUser.preferences || { theme: 'light', language: 'es' };
    const updatedUser: User = { ...currentUser, preferences: { ...currentPreferences, ...preferences } as { theme: 'light' | 'dark'; language: string } };

    this.updateState({ user: updatedUser });
    this.userSubject.next(updatedUser);
  }

  clearError(): void { this.updateState({ error: null }); }

  private updateState(partialState: Partial<AuthState>): void {
    this.authState.update(current => ({ ...current, ...partialState }));
  }

  private clearUserState(): void {
    this.updateState({ user: null, error: null, lastActivity: null });
    this.userSubject.next(null);
  }
}
