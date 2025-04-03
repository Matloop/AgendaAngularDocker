import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private jwtHelper = new JwtHelperService();
  private snackBar = inject(MatSnackBar);

  private apiUrl = 'https://api-users-gdsb.onrender.com';
  private tokenKey = 'access_token';
  private authStatusSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  
  authStatus$ = this.authStatusSubject.asObservable();

  constructor() {
    this.checkTokenValidity();
    setInterval(() => this.checkTokenValidity(), 60000);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response?.token) {
          this.storeToken(response.token);
          this.authStatusSubject.next(true);
          this.showSnackBar('Login realizado com sucesso!');
          this.redirectAfterLogin();
        }
      }),
      catchError(error => this.handleAuthError(error))
    );
  }

  register(user: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap(() => this.handleRegisterSuccess()),
      catchError(error => this.handleAuthError(error))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.authStatusSubject.next(false);
    this.router.navigate(['/login']);
    this.showSnackBar('Você foi desconectado');
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  isAdmin(): boolean {
    const userInfo = this.getUserInfo();
    return userInfo?.role === 'admin';
  }

  getCurrentUserId(): number | null {
    const userInfo = this.getUserInfo();
    return userInfo?.id || null;
  }

  getUserInfo(): UserInfo | null {
    try {
      const token = this.getToken();
      return token ? this.jwtHelper.decodeToken(token) : null;
    } catch (error) {
      console.error('Token inválido:', error);
      this.logout();
      return null;
    }
  }

  saveReturnUrl(url: string): void {
    localStorage.setItem('returnUrl', url);
  }

  private handleLoginSuccess(response: any): void {
    if (response?.token) {
      this.storeToken(response.token);
      this.authStatusSubject.next(true);
      this.showSnackBar('Login realizado com sucesso!');
      this.redirectAfterLogin();
    }
  }

  private handleRegisterSuccess(): void {
    this.showSnackBar('Registro realizado! Faça login');
    this.router.navigate(['/login']);
  }

  private handleAuthError(error: any): Observable<never> {
    const errorMsg = error.error?.message || 
                    error.status === 401 ? 'Credenciais inválidas' :
                    'Erro na comunicação com o servidor';
    
    this.showSnackBar(errorMsg, true);
    return throwError(() => new Error(errorMsg));
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  private checkTokenValidity(): void {
    const isValid = this.hasValidToken();
    if (this.authStatusSubject.value !== isValid) {
      this.authStatusSubject.next(isValid);
      if (!isValid) this.handleTokenExpiration();
    }
  }

  private handleTokenExpiration(): void {
    if (this.authStatusSubject.value) {
      this.showSnackBar('Sua sessão expirou. Faça login novamente', true);
      this.logout();
    }
  }

  private redirectAfterLogin(): void {
    const returnUrl = localStorage.getItem('returnUrl') || '/compromissos';
    localStorage.removeItem('returnUrl');
    this.router.navigateByUrl(returnUrl);
  }

  private showSnackBar(message: string, isError = false): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}