import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CamaraVerificacionResponse,
  CamaraHistorialResponse,
  CamaraVerificarRequest,
  CamaraObservarRequest,
  CamaraAprobarRequest,
  CamaraRechazarRequest,
  CamaraReabrirRequest
} from '../models/camara.model';
import { PageResponse } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class CamaraService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/camaras`;

  getFichas(
    estado?: string,
    fechaInicio?: string,
    fechaFin?: string,
    clienteNombre?: string,
    page = 0,
    size = 20
  ): Observable<PageResponse<CamaraVerificacionResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'createdAt,desc');

    if (estado) params = params.set('estado', estado);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (clienteNombre) params = params.set('clienteNombre', clienteNombre);

    return this.http.get<PageResponse<CamaraVerificacionResponse>>(`${this.apiUrl}/fichas`, { params });
  }

  getFichaById(id: number): Observable<CamaraVerificacionResponse> {
    return this.http.get<CamaraVerificacionResponse>(`${this.apiUrl}/fichas/${id}`);
  }

  iniciarVerificacion(dispatchId: number): Observable<CamaraVerificacionResponse> {
    return this.http.post<CamaraVerificacionResponse>(`${this.apiUrl}/fichas/${dispatchId}/iniciar`, {});
  }

  registrarVerificacionCantidades(id: number, request: CamaraVerificarRequest): Observable<CamaraVerificacionResponse> {
    return this.http.post<CamaraVerificacionResponse>(`${this.apiUrl}/fichas/${id}/verificar`, request);
  }

  observarFicha(id: number, request: CamaraObservarRequest): Observable<CamaraVerificacionResponse> {
    return this.http.post<CamaraVerificacionResponse>(`${this.apiUrl}/fichas/${id}/observar`, request);
  }

  aprobarFicha(id: number, request: CamaraAprobarRequest): Observable<CamaraVerificacionResponse> {
    return this.http.post<CamaraVerificacionResponse>(`${this.apiUrl}/fichas/${id}/aprobar`, request);
  }

  rechazarFicha(id: number, request: CamaraRechazarRequest): Observable<CamaraVerificacionResponse> {
    return this.http.post<CamaraVerificacionResponse>(`${this.apiUrl}/fichas/${id}/rechazar`, request);
  }

  reabrirFicha(id: number, request: CamaraReabrirRequest): Observable<CamaraVerificacionResponse> {
    return this.http.post<CamaraVerificacionResponse>(`${this.apiUrl}/fichas/${id}/reabrir`, request);
  }

  getHistorial(id: number): Observable<CamaraHistorialResponse[]> {
    return this.http.get<CamaraHistorialResponse[]>(`${this.apiUrl}/fichas/${id}/historial`);
  }

  descargarReporteWord(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/fichas/${id}/reporte`, {
      responseType: 'blob'
    });
  }
}
