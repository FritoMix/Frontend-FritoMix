import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderResponse, CreateOrderRequest, UpdateOrderRequest, toOrderDisplay } from '../models/order.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class OrderService extends BaseCrudService<OrderResponse, Order, CreateOrderRequest, UpdateOrderRequest> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/orders`;

  protected toDisplay(item: OrderResponse): Order {
    return toOrderDisplay(item);
  }

  getNextOrderNumber(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/next-number`, { responseType: 'text' as 'json' });
  }

  override create(data: CreateOrderRequest): Observable<OrderResponse> {
    return super.create(data);
  }

  override update(id: number, data: UpdateOrderRequest): Observable<OrderResponse> {
    return super.update(id, data);
  }

  updateStatus(id: number, status: string): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${id}/status`, null, { params: { status } });
  }
}