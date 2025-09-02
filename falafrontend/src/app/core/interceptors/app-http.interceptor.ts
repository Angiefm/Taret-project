import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

let requestCount = 0;

export const appHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>, 
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  
  const keycloakService = inject(KeycloakService);
  requestCount++;
  const startTime = Date.now();

  // ID único de request
  const requestId = generateRequestId();

  // inicialmente clono el request con headers base
  let modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId
    }
  });

  console.log(`[#${requestCount}] HTTP ${req.method} ${req.url}`, { requestId });

  // si es endpoint público, no pido token
  if (isPublicEndpoint(req.url)) {
    return handleLogging(modifiedReq, next, startTime, requestCount);
  }

  // sii hay sesión en Keycloak intento añadir el token
  if (keycloakService.isLoggedIn()) {
    return from(keycloakService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          modifiedReq = modifiedReq.clone({
            setHeaders: {
              ...modifiedReq.headers.keys().reduce(
                (acc, k) => ({ ...acc, [k]: modifiedReq.headers.get(k) }),
                {}
              ),
              'Authorization': `Bearer ${token}`
            }
          });
        }
        return handleLogging(modifiedReq, next, startTime, requestCount);
      })
    );
  }

  // si no está autenticado entonces seguir sin token
  return handleLogging(modifiedReq, next, startTime, requestCount);
};

function handleLogging(
  req: HttpRequest<any>, 
  next: HttpHandlerFn, 
  startTime: number,
  count: number
): Observable<HttpEvent<any>> {
  return next(req).pipe(
    tap({
      next: (event) => {
        console.log(`[#${count}] Response ${req.method} ${req.url}`, event);
      },
      error: (error) => {
        console.error(`[#${count}] Error ${req.method} ${req.url}`, error);
      }
    }),
    finalize(() => {
      const duration = Date.now() - startTime;
      console.log(`[#${count}] Completed in ${duration}ms`);
    })
  );
}

function isPublicEndpoint(url: string): boolean {
  const publicEndpoints = ['/hotels', '/hotels/search', '/rooms'];
  return publicEndpoints.some(endpoint => url.includes(endpoint));
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
