import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, Observable, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> | boolean => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Verificação síncrona inicial
  if (auth.isAuthenticated()) return true;

  // Fallback assíncrono para atualizações
  return auth.authStatus$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) return true;
      
      auth.saveReturnUrl(state.url);
      return router.parseUrl('/login');
    })
  );
};

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    auth.saveReturnUrl(state.url);
    return router.parseUrl('/login');
  }

  return auth.isAdmin() ? true : router.parseUrl('/acesso-negado');
};