import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const userRole = auth.currentUser()?.role;
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    return router.parseUrl('/dashboard');
  };
};
