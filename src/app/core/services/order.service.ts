import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Order, OrderResponse, CreateOrderRequest, UpdateOrderRequest, toOrderDisplay } from '../models/order.model';
import { BaseCrudService } from './base-crud.service';
import { PageResponse } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class OrderService extends BaseCrudService<OrderResponse, Order, CreateOrderRequest, UpdateOrderRequest> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/orders`;

  protected toDisplay(item: OrderResponse): Order {
    return toOrderDisplay(item);
  }

  findAll(): Observable<OrderResponse[]> {
    return this.http.get<PageResponse<OrderResponse>>(this.apiUrl, { params: { size: 1000 } })
      .pipe(map(res => res.content));
  }

  getNextOrderNumber(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/next-number`, { responseType: 'text' as 'json' });
  }

  updateStatus(id: number, status: string): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${id}/status`, null, { params: { status } });
  }

  updateTipoPedido(orderIds: number[], tipoPedido: string): Observable<OrderResponse[]> {
    return this.http.put<OrderResponse[]>(`${this.apiUrl}/tipo-pedido`, { orderIds, tipoPedido });
  }
}