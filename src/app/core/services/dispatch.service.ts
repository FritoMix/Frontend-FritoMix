import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Dispatch, DispatchResponse, CreateDispatchRequest, UpdateDispatchRequest, toDispatchDisplay } from '../models/dispatch.model';

@Injectable({ providedIn: 'root' })
export class DispatchService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/dispatches`;

  private dispatchesSignal = signal<Dispatch[]>([]);
  readonly dispatches = this.dispatchesSignal.asReadonly();
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

  filteredDispatches = computed(() => {
    const term = this.searchTerm();
    if (!term) return this.dispatches();
    return this.dispatches().filter(d =>
      d.dispatchNumber.toLowerCase().includes(term) ||
      d.orderNumber.toLowerCase().includes(term) ||
      d.driverName.toLowerCase().includes(term) ||
      d.vehiclePlate.toLowerCase().includes(term) ||
      d.status.toLowerCase().includes(term)
    );
  });

  loadDispatches(): void {
    this.loading.set(true);
    this.http.get<DispatchResponse[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.dispatchesSignal.set(res.map(toDispatchDisplay));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  findById(id: number): Observable<DispatchResponse> {
    return this.http.get<DispatchResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateDispatchRequest): Observable<DispatchResponse> {
    return this.http.post<DispatchResponse>(this.apiUrl, data);
  }

  update(id: number, data: UpdateDispatchRequest): Observable<DispatchResponse> {
    return this.http.put<DispatchResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<DispatchResponse> {
    return this.http.patch<DispatchResponse>(`${this.apiUrl}/${id}/status`, null, { params: { status } });
  }
}
