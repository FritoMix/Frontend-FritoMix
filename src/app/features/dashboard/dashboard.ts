import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--blue">1.</span>
        <div>
          <h1 class="text-2xl font-extrabold text-[#071938]">Dashboard</h1>
          <p class="text-xs text-gray-500 mt-0.5">Resumen general de la operación</p>
        </div>
      </div>
    </div>

    @if (loading()) {
      <div class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-[#0055FF] rounded-full animate-spin"></div>
          <span class="text-gray-500 text-sm">Cargando dashboard...</span>
        </div>
      </div>
    } @else if (hasError()) {
      <div class="flex items-center justify-center py-20">
        <div class="fm-card p-8 text-center max-w-sm">
          <div class="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h3 class="font-bold text-[#071938] mb-2">No se pudo conectar al servidor</h3>
          <p class="text-sm text-gray-500 mb-4">Verifica que el backend esté corriendo en <code class="text-xs bg-gray-100 px-1 rounded">localhost:8080</code></p>
          <button (click)="loadDashboard()" class="bg-[#0055FF] text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-[#0044DD] transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <div class="fm-card p-5 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pedidos del día</p>
            <p class="text-3xl font-extrabold text-[#071938] mt-2">{{ data()?.ordersToday ?? 0 }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-[#0055FF] flex items-center justify-center text-xl">📋</div>
        </div>
        <div class="fm-card p-5 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Despachos pendientes</p>
            <p class="text-3xl font-extrabold text-[#071938] mt-2">{{ data()?.pendingDispatches ?? 0 }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">🚚</div>
        </div>
        <div class="fm-card p-5 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Productos inventario</p>
            <p class="text-3xl font-extrabold text-[#071938] mt-2">{{ data()?.totalProducts ?? 0 }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">📦</div>
        </div>
        <div class="fm-card p-5 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clientes registrados</p>
            <p class="text-3xl font-extrabold text-[#071938] mt-2">{{ data()?.totalCustomers ?? 0 }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">👥</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
        <div class="lg:col-span-3 fm-card p-5">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-bold text-[#071938]">Ventas por mes</h3>
          </div>
          <div class="flex items-end gap-2 h-44">
            @for (bar of monthlyBars(); track bar.month) {
              <div class="flex-1 flex flex-col items-center gap-1">
                <span class="text-[10px] text-gray-400 font-semibold">{{ bar.count }}</span>
                <div
                  class="w-full rounded-t bg-[#0055FF] transition-all hover:bg-[#0044DD]"
                  [style.height.%]="bar.percent"
                ></div>
                <span class="text-[10px] text-gray-500 font-semibold">{{ bar.month }}</span>
              </div>
            }
          </div>
        </div>

        <div class="lg:col-span-2 fm-card p-5">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-bold text-[#071938]">Pedidos por estado</h3>
          </div>
          @if (ordersByStatus().length > 0) {
            <div class="flex items-center gap-6">
              <div
                class="w-32 h-32 rounded-full flex-shrink-0 relative flex items-center justify-center"
                [style.background]="donutConic()"
              >
                <div class="w-20 h-20 bg-white rounded-full"></div>
              </div>
              <div class="flex flex-col gap-2.5 text-xs">
                @for (item of ordersByStatus(); track item.status) {
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full" [style.background]="statusColor(item.status)"></span>
                    <span class="text-gray-600 font-medium">{{ statusLabel(item.status) }}</span>
                    <span class="ml-auto font-bold text-[#071938]">{{ item.count }}</span>
                  </div>
                }
              </div>
            </div>
          } @else {
            <p class="text-sm text-gray-400 py-8 text-center">Sin pedidos registrados</p>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="fm-card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-[#071938]">Productos más vendidos</h3>
          </div>
          <div class="fm-table-wrapper -mx-2">
            <table class="fm-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th class="text-right">Unidades</th>
                </tr>
              </thead>
              <tbody>
                @for (p of data()?.topProducts ?? []; track p.code) {
                  <tr>
                    <td class="font-semibold text-[#071938] text-xs">{{ p.name }}</td>
                    <td><span class="font-mono text-sm font-semibold text-[#071938]">{{ p.code }}</span></td>
                    <td class="text-right font-bold text-[#071938]">{{ p.units }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="!text-center"><div class="fm-empty"><p class="fm-empty__title">Sin datos</p></div></td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="fm-card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-[#071938]">Últimos pedidos</h3>
          </div>
          <div class="fm-table-wrapper -mx-2">
            <table class="fm-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th class="text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                @for (o of data()?.recentOrders ?? []; track o.id) {
                  <tr>
                    <td class="font-mono text-xs font-bold text-[#071938]">{{ o.id }}</td>
                    <td class="text-gray-600 text-xs font-medium">{{ o.client }}</td>
                    <td>
                      <span class="status-badge" [class]="statusBadgeClass(o.status)">{{ statusLabel(o.status) }}</span>
                    </td>
                    <td class="text-right text-gray-500 text-xs">{{ o.date }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="!text-center"><div class="fm-empty"><p class="fm-empty__title">Sin pedidos</p></div></td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }
  `
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
          customers: this.http.get<any[]>(`${environment.apiUrl}/api/v1/customers`).pipe(catchError(() => of([]))),
          products:  this.http.get<any[]>(`${environment.apiUrl}/api/v1/products`).pipe(catchError(() => of([]))),
          orders:    this.http.get<any[]>(`${environment.apiUrl}/api/v1/orders`).pipe(catchError(() => of([]))),
        }).pipe(
          map(({ customers, products, orders }) => {
            const statusMap: Record<string, number> = {};
            orders.forEach((o: any) => {
              const s = o.status || 'PENDIENTE';
              statusMap[s] = (statusMap[s] || 0) + 1;
            });

            const recentOrders = orders.slice(-5).reverse().map((o: any) => ({
              id: o.orderNumber || String(o.id),
              client: o.customerName || '—',
              status: o.status || 'PENDIENTE',
              date: o.orderDate ? o.orderDate.split('T')[0] : '—',
            }));

            const today = new Date().toISOString().split('T')[0];
            const ordersToday = orders.filter((o: any) =>
              (o.orderDate || '').startsWith(today)
            ).length;

            const pendingDispatches = orders.filter((o: any) =>
              o.status === 'PENDIENTE' || o.status === 'EN PREPARACIÓN'
            ).length;

            return {
              ordersToday,
              pendingDispatches,
              totalProducts: products.length,
              totalCustomers: customers.length,
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
