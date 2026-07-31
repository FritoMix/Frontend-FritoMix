import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, RoleResponse, CreateRoleRequest, UpdateRoleRequest } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/roles`;

  private rolesSignal = signal<Role[]>([]);
  readonly roles = this.rolesSignal.asReadonly();
  loading = signal(false);

  searchTerm = signal<string>('');
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  setSearchTerm(value: string) {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this.searchTerm.set(value.toLowerCase().trim());
      this._debounceTimer = null;
    }, 300);
  }

  filteredRoles = computed(() => {
    const term = this.searchTerm();
    if (!term) return this.roles();
    return this.roles().filter(r =>
      r.name.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term))
    );
  });

  loadRoles(): void {
    this.loading.set(true);
    this.http.get<RoleResponse[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.rolesSignal.set(res.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          permissions: r.permissions,
          permissionCount: r.permissions.length,
          createdAt: r.createdAt,
        })));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  findById(id: number): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.apiUrl}/${id}`);
  }

  findAllPermissions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/permissions`);
  }

  create(data: CreateRoleRequest): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(this.apiUrl, data);
  }

  update(id: number, data: UpdateRoleRequest): Observable<RoleResponse> {
    return this.http.put<RoleResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
