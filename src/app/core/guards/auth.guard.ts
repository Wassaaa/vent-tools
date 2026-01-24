import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

/**
 * Auth guard - redirects to login if not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (supabase.isAuthenticated()) {
    return true;
  }

  // Store attempted URL for redirecting after login
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * Manager guard - redirects if not a manager
 */
export const managerGuard: CanActivateFn = (route, state) => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (!supabase.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (supabase.isManager()) {
    return true;
  }

  // Not a manager, redirect to home
  return router.createUrlTree(['/']);
};
