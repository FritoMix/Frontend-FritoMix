import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateMultipedidoRequest, MultipedidoResponse } from '../models/multipedido.model';

@Injectable({
  providedIn: 'root'
})
export class MultipedidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/multipedidos`;

  findAll(): Observable<MultipedidoResponse[]> {
    return this.http.get<MultipedidoResponse[]>(this.apiUrl);
  }

  create(orderIds: number[]): Observable<MultipedidoResponse> {
    const payload: CreateMultipedidoRequest = { orderIds };
    return this.http.post<MultipedidoResponse>(this.apiUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
