import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, mapRole } from '../models/user.model';
import { TokenStore } from './token-store.service';

export interface AuthResponse {
  accessToken: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface JwtPayload {
  sub: string;
  userId: number;
  role: string;
  firstName: string;
  lastName: string;
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/auth`;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStore = inject(TokenStore);

  currentUser = signal<User | null>(null);

  private restoredPromise: Promise<void>;

  constructor() {
    this.restoredPromise = this.tryRestoreSession();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true }
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, { email });
  }

  verifyResetCode(email: string, code: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/verify-reset-code`, { email, code });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, { email, code, newPassword });
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/refresh`,
      {},
      { withCredentials: true }
    );
  }

  handleAuthSuccess(res: AuthResponse) {
    this.tokenStore.setAccessToken(res.accessToken);
    this.setUserFromResponse(res);
    this.router.navigate(['/dashboard']);
  }

  private setUserFromResponse(res: AuthResponse) {
    const name = `${res.firstName} ${res.lastName}`.trim();
    const initials = ((res.firstName?.charAt(0) ?? '') + (res.lastName?.charAt(0) ?? '')).toUpperCase() || '?';
    this.currentUser.set({
      id: res.id,
      firstName: res.firstName,
      lastName: res.lastName || '',
      email: res.email,
      role: mapRole(res.role),
      enabled: true,
      name,
      avatarInitials: initials,
      createdAt: ''
    });
  }

  logout() {
    this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => this.clearLocalSession(),
        error: () => this.clearLocalSession(),
      });
  }

  clearLocalSession() {
    this.tokenStore.clear();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.tokenStore.accessToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  whenRestored(): Promise<void> {
    return this.restoredPromise;
  }

  private tryRestoreSession(): Promise<void> {
    return new Promise((resolve) => {
      this.refreshToken().subscribe({
        next: (res) => {
          this.tokenStore.setAccessToken(res.accessToken);
          this.setUserFromResponse(res);
          resolve();
        },
        error: () => {
          this.tokenStore.clear();
          this.currentUser.set(null);
          resolve();
        },
      });
    });
  }

  refreshUserInfo(firstName: string, lastName: string, email: string) {
    const current = this.currentUser();
    if (!current) return;
    const name = `${firstName} ${lastName}`.trim();
    const initials = ((firstName?.charAt(0) ?? '') + (lastName?.charAt(0) ?? '')).toUpperCase() || '?';
    this.currentUser.set({
      ...current,
      firstName,
      lastName: lastName || '',
      email,
      name,
      avatarInitials: initials,
    });
  }

  private decodeToken(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Token inválido');
    return JSON.parse(atob(parts[1]));
  }
}