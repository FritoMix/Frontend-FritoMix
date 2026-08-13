import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenStore } from '../services/token-store.service';
import { AuthService } from '../services/auth.service';

const AUTH_PATHS = ['/api/v1/auth/login', '/api/v1/auth/refresh', '/api/v1/auth/logout'];
const RETRY_ONCE = new HttpContextToken<boolean>(() => false);

function cloneWithCredentials(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  let cloned = req.clone({ withCredentials: true });
  if (token) {
    cloned = cloned.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return cloned;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStore);
  const authService = inject(AuthService);

  const isAuthRequest = AUTH_PATHS.some(p => req.url.includes(p));
  const token = tokenStore.accessToken();
  const firstRequest = cloneWithCredentials(req, token);

  if (isAuthRequest) {
    return next(firstRequest);
  }

  return next(firstRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || req.context.get(RETRY_ONCE)) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap((res) => {
          tokenStore.setAccessToken(res.accessToken);
          const retried = cloneWithCredentials(
            req.clone({ context: req.context.set(RETRY_ONCE, true) }),
            res.accessToken
          );
          return next(retried);
        }),
        catchError((refreshError) => {
          authService.clearLocalSession();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
