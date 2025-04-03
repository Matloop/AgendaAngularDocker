import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Skip interceptor for login and register endpoints
  if (req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);
  }

  // Adicionar token de autenticação se disponível
  const token = authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Processar a requisição e capturar erros
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Erro de autenticação - token expirado ou inválido
        authService.logout();
        
        // Salvar URL atual para redirecionamento após login
        authService.saveReturnUrl(router.url);
        
        snackBar.open('Sessão expirada ou token inválido. Por favor, faça login novamente.', 'Fechar', {
          duration: 5000
        });
        
        router.navigate(['/login']);
      } 
      else if (error.status === 403) {
        // Erro de autorização - permissão negada
        snackBar.open('Você não tem permissão para acessar este recurso.', 'Fechar', {
          duration: 5000
        });
        
        router.navigate(['/compromissos']);
      }
      else if (error.status === 0) {
        // Erro de conexão com o servidor
        snackBar.open('Não foi possível conectar ao servidor. Verifique sua conexão.', 'Fechar', {
          duration: 5000
        });
      }
      
      return throwError(() => error);
    })
  );
};