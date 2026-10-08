import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderReport {
  id: number;
  orderNumber: string;
  customerName: string;
  city?: string;
  department?: string;
  address?: string;
  phone?: string;
  orderDate: string;
  status: string;
  pesoTotal: number;
}

export interface DispatchReport {
  id: number;
  dispatchNumber: string;
  orderNumbers: string[];
  customerNames: string[];
  city?: string;
  address?: string;
  dispatchDate: string;
  driverName?: string;
  vehicleNumber?: string;
  status: string;
  pesoTotal: number;
}

export type ReportRow = OrderReport | DispatchReport;

export interface ReportTab {
  key: string;
  label: string;
  endpoint: string;
  pdfType: string;
  logistica: boolean;
}

export const REPORT_TABS: ReportTab[] = [
  { key: 'aprobados', label: 'Aprobados', endpoint: 'orders?status=APROBADO', pdfType: 'aprobados', logistica: false },
  { key: 'pendientes', label: 'Pendientes', endpoint: 'orders?status=PENDIENTE', pdfType: 'pendientes', logistica: false },
  { key: 'cancelados', label: 'Cancelados', endpoint: 'orders?status=CANCELADO', pdfType: 'cancelados', logistica: false },
  { key: 'logistica', label: 'Logística', endpoint: 'logistica', pdfType: 'logistica', logistica: true },
];

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/reports`;

  tabs = REPORT_TABS;

  getTabData(endpoint: string): Observable<ReportRow[]> {
    return this.http.get<ReportRow[]>(`${this.baseUrl}/${endpoint}`);
  }

  downloadPdf(pdfType: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/pdf`, {
      params: { type: pdfType },
      responseType: 'blob'
    });
  }
}