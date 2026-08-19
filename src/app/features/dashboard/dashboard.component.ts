import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../../core/models/pagination.model';

interface DashboardData {
  ordersToday: number;
  pendingDispatches: number;
  totalProducts: number;
  totalCustomers: number;
  monthlySales: { month: string; count: number; total: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; code: string; units: number }[];
  recentOrders: { id: string; client: string; status: string; date: string }[];
}

interface OrderLite {
  id: number;
  orderNumber?: string;
  customerName?: string;
  status?: string;
  orderDate?: string;
}

const EMPTY_PAGE: PageResponse<never> = {
  content: [],
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  last: true,
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);

  data = signal<DashboardData | null>(null);
  loading = signal(true);
  hasError = signal(false);

  private subs: Subscription[] = [];

  ngOnInit() {
    this.loadDashboard();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.subs = [];
  }

  loadDashboard() {
    this.loading.set(true);
    this.hasError.set(false);

    const sub = this.http.get<DashboardData>(`${environment.apiUrl}/api/v1/dashboard`).pipe(
      catchError(() => {
        return forkJoin({
          customers: this.http.get<PageResponse<unknown>>(`${environment.apiUrl}/api/v1/customers`).pipe(catchError(() => of(EMPTY_PAGE as PageResponse<unknown>))),
          products:  this.http.get<PageResponse<unknown>>(`${environment.apiUrl}/api/v1/products`).pipe(catchError(() => of(EMPTY_PAGE as PageResponse<unknown>))),
          orders:    this.http.get<PageResponse<OrderLite>>(`${environment.apiUrl}/api/v1/orders`).pipe(catchError(() => of(EMPTY_PAGE as PageResponse<OrderLite>))),
        }).pipe(
          map(({ customers, products, orders }) => {
            const statusMap: Record<string, number> = {};
            orders.content.forEach((o: OrderLite) => {
              const s = o.status || 'PENDIENTE';
              statusMap[s] = (statusMap[s] || 0) + 1;
            });

            const recentOrders = orders.content.slice(-5).reverse().map((o: OrderLite) => ({
              id: o.orderNumber || String(o.id),
              client: o.customerName || '—',
              status: o.status || 'PENDIENTE',
              date: o.orderDate ? o.orderDate.split('T')[0] : '—',
            }));

            const today = new Date().toISOString().split('T')[0];
            const ordersToday = orders.content.filter((o: OrderLite) =>
              (o.orderDate || '').startsWith(today)
            ).length;

            const pendingDispatches = orders.content.filter((o: OrderLite) =>
              o.status === 'PENDIENTE' || o.status === 'EN PREPARACIÓN'
            ).length;

            return {
              ordersToday,
              pendingDispatches,
              totalProducts: products.totalElements,
              totalCustomers: customers.totalElements,
              monthlySales: [],
              ordersByStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
              topProducts: [],
              recentOrders,
            } as DashboardData;
          })
        );
      })
    ).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.hasError.set(true);
      },
    });
    this.subs.push(sub);
  }

  monthlyBars = computed(() => {
    const sales = this.data()?.monthlySales ?? [];
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const maxTotal = Math.max(...sales.map(s => s.total), 1);
    return months.map(m => {
      const found = sales.find(s => s.month === m);
      return {
        month: m,
        count: found ? found.count : 0,
        percent: found ? Math.max((found.total / maxTotal) * 100, 2) : 2,
      };
    });
  });

  ordersByStatus = computed(() => {
    return this.data()?.ordersByStatus ?? [];
  });

  totalOrdersCount = computed(() => {
    return this.ordersByStatus().reduce((sum, item) => sum + item.count, 0);
  });


  donutConic = computed(() => {
    const items = this.ordersByStatus();
    const total = items.reduce((s, i) => s + i.count, 0) || 1;
    const colors = ['#0055FF','#F59E0B','#EF4444','#10B981','#8B5CF6','#EC4899'];
    let degrees = 0;
    const parts: string[] = [];
    items.forEach((item, idx) => {
      const pct = (item.count / total) * 360;
      const color = colors[idx % colors.length];
      parts.push(`${color} ${degrees}deg ${degrees + pct}deg`);
      degrees += pct;
    });
    return `conic-gradient(${parts.join(', ')})`;
  });

  statusColor(status: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': '#F59E0B', 'EN PREPARACIÓN': '#0055FF',
      'DESPACHADO': '#8B5CF6', 'ENTREGADO': '#10B981',
      'CANCELADO': '#EF4444',
    };
    return map[status] || '#6B7280';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'Pendiente', 'EN PREPARACIÓN': 'En preparación',
      'DESPACHADO': 'Despachado', 'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado',
    };
    return map[status] || status;
  }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'bg-amber-50 text-amber-700 border-amber-200',
      'EN PREPARACIÓN': 'bg-blue-50 text-blue-700 border-blue-200',
      'DESPACHADO': 'bg-purple-50 text-purple-700 border-purple-200',
      'ENTREGADO': 'bg-green-50 text-green-700 border-green-200',
      'CANCELADO': 'bg-red-50 text-red-600 border-red-200',
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
