import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserResponse, CreateUserRequest, UpdateUserRequest, toUserDisplay } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/users`;

  private usersSignal = signal<User[]>([]);
  readonly users = this.usersSignal.asReadonly();
  loading = signal(false);

  searchTerm = signal<string>('');

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.users();
    return this.users().filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  loadUsers(): void {
    this.loading.set(true);
    this.http.get<UserResponse[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.usersSignal.set(res.map(toUserDisplay));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  findById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, data);
  }

  update(id: number, data: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
