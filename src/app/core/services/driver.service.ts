import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Driver, DriverResponse, CreateDriverRequest, UpdateDriverRequest, toDriverDisplay } from '../models/driver.model';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/drivers`;

  private driversSignal = signal<Driver[]>([]);
  readonly drivers = this.driversSignal.asReadonly();
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

  filteredDrivers = computed(() => {
    const term = this.searchTerm();
    if (!term) return this.drivers();
    return this.drivers().filter(d =>
      d.name.toLowerCase().includes(term) ||
      d.document.includes(term) ||
      d.licenseNumber.toLowerCase().includes(term)
    );
  });

  loadDrivers(): void {
    this.loading.set(true);
    this.http.get<DriverResponse[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.driversSignal.set(res.map(toDriverDisplay));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  findById(id: number): Observable<DriverResponse> {
    return this.http.get<DriverResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateDriverRequest): Observable<DriverResponse> {
    return this.http.post<DriverResponse>(this.apiUrl, data);
  }

  update(id: number, data: UpdateDriverRequest): Observable<DriverResponse> {
    return this.http.put<DriverResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
