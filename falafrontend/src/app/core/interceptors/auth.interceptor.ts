import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>, 
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  
  const keycloakService = inject(KeycloakService);
  
  console.log('authInterceptor procesando:', req.method, req.url);
  
  if (isPublicEndpoint(req.url)) {
    console.log('endpoint público - Sin token requerido');
    return next(req);
  }

  if (keycloakService.isLoggedIn()) {
    return from(keycloakService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          console.log('agregando token de Keycloak');
          const authReq = req.clone({
            setHeaders: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          return next(authReq);
        } else {
          console.log('no hay token de Keycloak disponible');
          return next(req.clone({
            setHeaders: {
              'Content-Type': 'application/json'
            }
          }));
        }
      })
    );
  }

  console.log('usuario no autenticado');
  return next(req.clone({
    setHeaders: {
      'Content-Type': 'application/json'
    }
  }));
};

function isPublicEndpoint(url: string): boolean {
  const publicEndpoints = [
    '/hotels',
    '/hotels/search',
    '/rooms'
  ];
  
  return publicEndpoints.some(endpoint => url.includes(endpoint));
}

export const httpLoggingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  
  const startTime = Date.now();
  
  console.log(`[HTTP] ${req.method} ${req.url}`);
  
  return next(req).pipe(
    tap({
      next: (event: any) => {
        if (event.type === 4) {
          const duration = Date.now() - startTime;
          console.log(`[HTTP] ${req.method} ${req.url} - ${duration}ms`);
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        console.error(`[HTTP] ${req.method} ${req.url} - ${duration}ms`, error);
      }
    })
  );
};

import { tap } from 'rxjs/operators';