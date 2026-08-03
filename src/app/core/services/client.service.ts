import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, ClientResponse, CreateClientRequest, UpdateClientRequest, Department, City, toClientDisplay } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/customers`;
  private readonly locationsUrl = `${environment.apiUrl}/api/v1/locations`;

  private clientsSignal = signal<Client[]>([]);
  readonly clients = this.clientsSignal.asReadonly();
  loading = signal(false);
  hasError = signal(false);

  searchTerm = signal<string>('');
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  setSearchTerm(value: string) {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this.searchTerm.set(value.toLowerCase().trim());
      this._debounceTimer = null;
    }, 300);
  }

  filteredClients = computed(() => {
    const term = this.searchTerm();
    if (!term) return this.clients();
    return this.clients().filter(c =>
      (c.businessName?.toLowerCase().includes(term) ?? false) ||
      (c.code?.toLowerCase().includes(term) ?? false) ||
      (c.document?.toLowerCase().includes(term) ?? false) ||
      (c.cityName?.toLowerCase().includes(term) ?? false)
    );
  });

  loadClients(): void {
    this.loading.set(true);
    this.hasError.set(false);
    this.http.get<ClientResponse[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.clientsSignal.set(res.map(toClientDisplay));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.hasError.set(true);
      },
    });
  }

  findById(id: number): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateClientRequest): Observable<ClientResponse> {
    return this.http.post<ClientResponse>(this.apiUrl, data);
  }

  update(id: number, data: UpdateClientRequest): Observable<ClientResponse> {
    return this.http.put<ClientResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.locationsUrl}/departments`);
  }

  getCitiesByDepartment(departmentId: number): Observable<City[]> {
    return this.http.get<City[]>(`${this.locationsUrl}/cities`, { params: { departmentId } });
  }
}
