import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../../core/models/pagination.model';

export interface DashboardData {
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

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/dashboard`;

  load(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl).pipe(
      catchError(() => this.buildFromLists())
    );
  }

  private buildFromLists(): Observable<DashboardData> {
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

        const monthlyCount: Record<string, number> = {};
        const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        orders.content.forEach((o: OrderLite) => {
          if (o.orderDate) {
            const d = new Date(o.orderDate);
            if (!isNaN(d.getTime())) {
              const mName = monthNames[d.getMonth()];
              monthlyCount[mName] = (monthlyCount[mName] || 0) + 1;
            }
          }
        });
        const monthlySales = Object.entries(monthlyCount).map(([month, count]) => ({
          month,
          count,
          total: count
        }));

        return {
          ordersToday,
          pendingDispatches,
          totalProducts: products.totalElements,
          totalCustomers: customers.totalElements,
          monthlySales,
          ordersByStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
          topProducts: [],
          recentOrders,
        } as DashboardData;
      })
    );
  }
}