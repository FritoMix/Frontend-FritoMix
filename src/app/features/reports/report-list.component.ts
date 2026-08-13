import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface OrderReport {
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

interface DispatchReport {
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

type ReportRow = OrderReport | DispatchReport;

interface ReportTab {
  key: string;
  label: string;
  endpoint: string;
  pdfType: string;
  logistica: boolean;
}

const TABS: ReportTab[] = [
  { key: 'aprobados', label: 'Aprobados', endpoint: 'orders?status=APROBADO', pdfType: 'aprobados', logistica: false },
  { key: 'pendientes', label: 'Pendientes', endpoint: 'orders?status=PENDIENTE', pdfType: 'pendientes', logistica: false },
  { key: 'cancelados', label: 'Cancelados', endpoint: 'orders?status=CANCELADO', pdfType: 'cancelados', logistica: false },
  { key: 'logistica', label: 'Logística', endpoint: 'logistica', pdfType: 'logistica', logistica: true },
];

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'report-list.component.html'
})
export class ReportListComponent implements OnInit {
  private http = inject(HttpClient);

  tabs = TABS;
  activeTab = signal<ReportTab>(TABS[0]);

  private records = new Map<string, WritableSignal<ReportRow[]>>();

  loading = signal(false);
  downloadingPdf = signal(false);
  error = signal<string | null>(null);

  private readonly baseUrl = environment.apiUrl;

  tabData(key: string) {
    if (!this.records.has(key)) {
      this.records.set(key, signal<ReportRow[]>([]));
    }
    return this.records.get(key)!;
  }

  orderRows() {
    return this.tabData(this.activeTab().key)() as OrderReport[];
  }

  dispatchRows() {
    return this.tabData(this.activeTab().key)() as DispatchReport[];
  }

  ngOnInit() {
    this.loadActive();
  }

  selectTab(tab: ReportTab) {
    this.activeTab.set(tab);
    if (this.tabData(tab.key)().length === 0) {
      this.loadActive();
    }
  }

  private loadActive() {
    const tab = this.activeTab();
    if (this.tabData(tab.key)().length > 0) return;

    this.loading.set(true);
    this.error.set(null);
    this.http.get<ReportRow[]>(`${this.baseUrl}/api/v1/reports/${tab.endpoint}`).subscribe({
      next: rows => {
        this.tabData(tab.key).set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos del reporte. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  tabTitle(tab: ReportTab) {
    switch (tab.key) {
      case 'aprobados': return 'Pedidos Aprobados';
      case 'pendientes': return 'Pedidos Pendientes';
      case 'cancelados': return 'Pedidos Cancelados';
      default: return 'Logística — Despachos Realizados';
    }
  }

  statusClass(status: string) {
    const classes: Record<string, string> = {
      APROBADO: 'bg-green-50 text-green-700 border-green-200',
      PENDIENTE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      CANCELADO: 'bg-red-50 text-red-600 border-red-200',
      ELABORACION: 'bg-amber-50 text-amber-700 border-amber-200',
      PRODUCCION: 'bg-blue-50 text-blue-700 border-blue-200',
      LISTO_CARGUE: 'bg-teal-50 text-teal-700 border-teal-200',
      DESPACHADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return classes[status] ?? 'bg-gray-50 text-gray-600 border-gray-200';
  }

  downloadPdf() {
    const tab = this.activeTab();
    this.downloadingPdf.set(true);
    this.error.set(null);
    this.http.get(`${this.baseUrl}/api/v1/reports/pdf`, {
      params: { type: tab.pdfType },
      responseType: 'blob'
    }).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${tab.pdfType}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingPdf.set(false);
      },
      error: () => {
        this.error.set('No se pudo descargar el PDF. Intenta de nuevo.');
        this.downloadingPdf.set(false);
      },
    });
  }
}
