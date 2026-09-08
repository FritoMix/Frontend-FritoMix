import { Injectable, signal } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Dispatch, DispatchResponse, CreateDispatchRequest, UpdateDispatchRequest, toDispatchDisplay, DespachadorDto, ConfirmarPlacaRequest } from '../models/dispatch.model';
import { OrderResponse } from '../models/order.model';
import { PageResponse } from '../models/pagination.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class DispatchService extends BaseCrudService<DispatchResponse, Dispatch, CreateDispatchRequest, UpdateDispatchRequest> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/dispatches`;

  private statusFilterSignal = signal<string[]>([]);

  protected toDisplay(item: DispatchResponse): Dispatch {
    return toDispatchDisplay(item);
  }

  override create(data: CreateDispatchRequest): Observable<DispatchResponse> {
    return super.create(data);
  }

  override update(id: number, data: UpdateDispatchRequest): Observable<DispatchResponse> {
    return super.update(id, data);
  }

  setStatusFilter(statuses: string[]): void {
    this.statusFilterSignal.set(statuses);
    this.currentPage.set(0);
    this.load();
  }

  protected override applyExtraParams(params: HttpParams): HttpParams {
    const statuses = this.statusFilterSignal();
    if (statuses && statuses.length) {
      for (const s of statuses) {
        params = params.append('status', s);
      }
    }
    return params;
  }

  loadAssigned(): void {
    this.loadFromEndpoint('/asignados');
  }

  listosParaCargue(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.apiUrl}/listos-cargue`);
  }

  paraConfirmar(statuses: string[]): Observable<PageResponse<DispatchResponse>> {
    let params = new HttpParams().set('size', 100);
    for (const s of statuses) {
      params = params.append('status', s);
    }
    return this.http.get<PageResponse<DispatchResponse>>(`${this.apiUrl}`, { params });
  }

  misAsignaciones(): Observable<PageResponse<DispatchResponse>> {
    return this.http.get<PageResponse<DispatchResponse>>(`${this.apiUrl}/mis-asignaciones`);
  }

  misConfirmaciones(): Observable<PageResponse<DispatchResponse>> {
    return this.http.get<PageResponse<DispatchResponse>>(`${this.apiUrl}/mis-confirmaciones`);
  }

  despachadoresD3(): Observable<DespachadorDto[]> {
    return this.http.get<DespachadorDto[]>(`${this.apiUrl}/despachadores`);
  }

  confirmarPlaca(id: number, body: ConfirmarPlacaRequest): Observable<DispatchResponse> {
    return this.http.post<DispatchResponse>(`${this.apiUrl}/${id}/confirmar-placa`, body);
  }

  asignarPlaca(orderId: number, placa: string): Observable<DispatchResponse> {
    return this.http.post<DispatchResponse>(`${this.apiUrl}/placa`, { orderId, placa });
  }

  updateStatus(id: number, status: string): Observable<DispatchResponse> {
    return this.http.patch<DispatchResponse>(`${this.apiUrl}/${id}/status`, null, { params: { status } });
  }
}