import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (authService.isLoggedIn()) {
    return true;
  }

  // On initial root visit ('/'), redirect silently to the login page
  if (!state.url || state.url === '/') {
    return router.createUrlTree(['/login']);
  }

  toastService.info('Please log in to continue.', 'Login Required');
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/']);
  }

  return true;
};
