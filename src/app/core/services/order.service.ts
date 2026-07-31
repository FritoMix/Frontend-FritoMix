import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderResponse, CreateOrderRequest, UpdateOrderRequest, toOrderDisplay } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/orders`;

  private ordersSignal = signal<Order[]>([]);
  readonly orders = this.ordersSignal.asReadonly();
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

  filteredOrders = computed(() => {
    const term = this.searchTerm();
    if (!term) return this.orders();
    return this.orders().filter(o =>
      o.orderNumber.toLowerCase().includes(term) ||
      o.clientName.toLowerCase().includes(term) ||
      o.status.toLowerCase().includes(term)
    );
  });

  loadOrders(): void {
    this.loading.set(true);
    this.http.get<OrderResponse[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.ordersSignal.set(res.map(toOrderDisplay));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  findById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, data);
  }

  update(id: number, data: UpdateOrderRequest): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
