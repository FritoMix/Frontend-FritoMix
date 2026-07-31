import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Notification, UnreadCountResponse } from '../models/notification.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/notifications`;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private pollingTimer: ReturnType<typeof setInterval> | null = null;

  unreadCount = signal(0);

  findAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  loadUnreadCount() {
    this.http.get<UnreadCountResponse>(`${this.apiUrl}/unread-count`).subscribe({
      next: (res) => this.unreadCount.set(res.count),
      error: (err: HttpErrorResponse) => {
        this.unreadCount.set(0);
        if (err.status === 401) {
          this.stopPolling();
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  startPolling(intervalMs = 30000) {
    this.loadUnreadCount();
    if (this.pollingTimer) return;
    this.pollingTimer = setInterval(() => this.loadUnreadCount(), intervalMs);
  }

  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {});
  }
}
