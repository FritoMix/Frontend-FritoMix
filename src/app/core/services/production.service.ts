import { Injectable, signal } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderResponse, toOrderDisplay } from '../models/order.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class ProductionService extends BaseCrudService<OrderResponse, Order> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/orders`;

  private readonly productionStatuses = ['APROBADO', 'EN_PRODUCCION', 'LISTO_PRODUCCION'];
  readonly selectedStatus = signal<string>('ALL');

  protected toDisplay(item: OrderResponse): Order {
    return toOrderDisplay(item);
  }

  protected override applyExtraParams(params: HttpParams): HttpParams {
    const st = this.selectedStatus();
    if (st && st !== 'ALL') {
      return params.set('status', st);
    }
    return params.set('statuses', this.productionStatuses.join(','));
  }

  setStatusFilter(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.load();
  }

  updateProductionStatus(id: number, status: 'EN_PRODUCCION' | 'LISTO_PRODUCCION'): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${id}/production-status`, null, { params: { status } });
  }
}