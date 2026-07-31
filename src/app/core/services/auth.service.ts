import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, mapRole } from '../models/user.model';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
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

  currentUser = signal<User | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password });
  }

  refreshToken() {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) return;
    this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken: refresh })
      .subscribe({
        next: (res) => {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
        },
        error: () => this.logout()
      });
  }

  handleAuthSuccess(res: AuthResponse) {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private loadFromStorage() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = this.decodeToken(token);
        if (payload.exp * 1000 > Date.now()) {
          this.setUserFromToken(token);
        } else {
          this.logout();
        }
      } catch {
        this.logout();
      }
    }
  }

  private setUserFromToken(token: string) {
    const payload = this.decodeToken(token);
    const firstName = payload.firstName || payload.sub.split('@')[0];
    const lastName = payload.lastName || '';
    const name = `${firstName} ${lastName}`.trim();
    const initials = ((firstName?.charAt(0) ?? '') + (lastName?.charAt(0) ?? '')).toUpperCase() || '?';

    this.currentUser.set({
      id: payload.userId,
      firstName,
      lastName,
      email: payload.sub,
      role: mapRole(payload.role),
      enabled: true,
      name,
      avatarInitials: initials,
      createdAt: new Date(payload.iat * 1000).toISOString().split('T')[0]
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


