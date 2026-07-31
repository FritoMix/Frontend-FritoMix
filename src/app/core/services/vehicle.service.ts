import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehicle, VehicleResponse, CreateVehicleRequest, UpdateVehicleRequest, toVehicleDisplay } from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/vehicles`;

  private vehiclesSignal = signal<Vehicle[]>([]);
  readonly vehicles = this.vehiclesSignal.asReadonly();
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

  filteredVehicles = computed(() => {
    const term = this.searchTerm();
    if (!term) return this.vehicles();
    return this.vehicles().filter(v =>
      v.plate.toLowerCase().includes(term) ||
      v.brand.toLowerCase().includes(term) ||
      v.model.toLowerCase().includes(term)
    );
  });

  loadVehicles(): void {
    this.loading.set(true);
    this.http.get<VehicleResponse[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.vehiclesSignal.set(res.map(toVehicleDisplay));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  findById(id: number): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateVehicleRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.apiUrl, data);
  }

  update(id: number, data: UpdateVehicleRequest): Observable<VehicleResponse> {
    return this.http.put<VehicleResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
