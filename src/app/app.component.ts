// app.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

// Componentes


// Serviços
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,

  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  template: `
    <nav *ngIf="isAuthenticated$ | async">
      <!-- conteúdo da navbar -->
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  title = 'Agenda de Compromissos';
  isAuthenticated = false;
  isAdmin = false;
  userName = '';

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupAuthSubscription();
    this.updateAuthStatus();
  }

  private setupAuthSubscription(): void {
    this.authService.authStatus$.subscribe(() => {
      this.updateAuthStatus();
      this.cdr.detectChanges();
    });
  }

  updateAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isAdmin = this.authService.isAdmin();
    
    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.userName = userInfo.name;
    }
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.isAdmin = false;
    this.userName = '';
  }
}