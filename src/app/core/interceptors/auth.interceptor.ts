import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AdminAuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { environment } from '../../../environments/environment';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AdminAuthService);
  const toastService = inject(ToastService);
  const token = authService.token();

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const isLoginRequest = req.url.includes('/admin/login');

  let modifiedReq = req;
  if (isApiRequest) {
    modifiedReq = req.clone({
      withCredentials: true,
      ...(token && !req.headers.has('Authorization')
        ? { setHeaders: { Authorization: `Bearer ${token}` } }
        : {})
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoginRequest) {
        toastService.error('Admin session expired or unauthorized. Please log in again.');
        authService.logout();
      } else if (error.status === 403 && !isLoginRequest) {
        toastService.error('Access denied: You do not have administrator permissions.');
      }
      return throwError(() => error);
    })
  );
};
