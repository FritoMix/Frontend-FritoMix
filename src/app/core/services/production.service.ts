import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderResponse } from '../models/order.model';
import { OrderService } from './order.service';

@Injectable({ providedIn: 'root' })
export class ProductionService extends OrderService {
  private readonly productionStatuses = ['APROBADO', 'EN_PRODUCCION', 'LISTO_PRODUCCION'];

  protected override applyExtraParams(params: HttpParams): HttpParams {
    return params.set('statuses', this.productionStatuses.join(','));
  }

  updateProductionStatus(id: number, status: 'EN_PRODUCCION' | 'LISTO_PRODUCCION'): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${id}/production-status`, null, { params: { status } });
  }
}