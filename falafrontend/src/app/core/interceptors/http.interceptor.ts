import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { tap, finalize } from 'rxjs/operators';

let requestCount = 0;

export const httpInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  requestCount++;
  
  const modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'X-Request-ID': generateRequestId()
    }
  });

  console.log(`HTTP Request #${requestCount}:`, {
    method: modifiedReq.method,
    url: modifiedReq.url
  });

  return next(modifiedReq).pipe(
    tap({
      next: (event) => {
        console.log(`HTTP Response #${requestCount}:`, event);
      },
      error: (error) => {
        console.error(`HTTP Error #${requestCount}:`, error);
      }
    }),
    finalize(() => {
      console.log(`HTTP Request #${requestCount} completed`);
    })
  );
};

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}