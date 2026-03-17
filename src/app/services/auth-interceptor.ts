import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const accessToken = auth.getAccessToken();
  const isAuthRequest =
    req.url.includes('/api/Authorize/login') || req.url.includes('/api/Authorize/refresh');

  const authReq =
    accessToken && !isAuthRequest
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const hasRefreshToken = Boolean(auth.getRefreshToken());

      if (error.status !== 401 || isAuthRequest || !hasRefreshToken) {
        return throwError(() => error);
      }

      return auth.refreshToken().pipe(
        switchMap(() => {
          const refreshedToken = auth.getAccessToken();

          if (!refreshedToken) {
            auth.clearSession();
            router.navigate(['/login']);
            return throwError(() => error);
          }

          return next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${refreshedToken}`
              }
            })
          );
        }),
        catchError((refreshError) => {
          auth.clearSession();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};
