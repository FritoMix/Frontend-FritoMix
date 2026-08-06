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
  vehiclePlate?: string;
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
  template: `
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--blue">11.</span>
        <h1 class="text-2xl font-extrabold text-[#071938]">Reportes</h1>
      </div>
      <p class="text-sm text-gray-500">Visualiza y descarga los pedidos por estado y los despachos listos para despacho.</p>
    </div>

    <div class="fm-card p-5 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex gap-1 flex-wrap">
          @for (tab of tabs; track tab.key) {
            <button
              (click)="selectTab(tab)"
              [class]="activeTab().key === tab.key
                ? 'px-4 py-2 rounded-lg text-sm font-bold bg-[#0055FF] text-white transition-colors'
                : 'px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors'">
              {{ tab.label }}
              <span class="ml-1 text-xs opacity-80">({{ tabData(tab.key)()?.length ?? 0 }})</span>
            </button>
          }
        </div>
        <button (click)="downloadPdf()" [disabled]="downloadingPdf()"
          class="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
          {{ downloadingPdf() ? 'Descargando...' : 'Descargar PDF' }}
        </button>
      </div>
    </div>

    @if (error()) {
      <div class="fm-card p-5 mb-6 border border-red-200 bg-red-50">
        <p class="text-sm text-red-700 font-medium">{{ error() }}</p>
      </div>
    }

    @if (loading()) {
      <div class="flex items-center justify-center py-16">
        <span class="text-gray-500 text-sm">Cargando reporte...</span>
      </div>
    } @else {
      <div class="fm-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-[#071938]">
            {{ tabTitle(activeTab()) }}
          </h3>
          <span class="text-xs text-gray-500">{{ activeTab().logistica ? 'despachos' : 'pedidos' }}: {{ tabData(activeTab().key)()?.length ?? 0 }}</span>
        </div>

        <div class="overflow-x-auto">
          @if (activeTab().logistica) {
            <table class="fm-table">
              <thead>
                <tr class="bg-gray-50/60">
                  <th>Despacho</th>
                  <th>Pedidos</th>
                  <th>Cliente</th>
                  <th>Conductor</th>
                  <th>Vehículo</th>
                  <th>Fecha</th>
                  <th class="!text-right">Peso (kg)</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (row of dispatchRows(); track row.id) {
                  <tr>
                    <td class="font-bold text-xs text-[#071938]">{{ row.dispatchNumber }}</td>
                    <td class="text-xs text-gray-600">{{ row.orderNumbers?.join(', ') ?? '—' }}</td>
                    <td class="font-semibold text-xs text-gray-800">{{ row.customerNames?.join(', ') ?? '—' }}</td>
                    <td class="text-xs text-gray-500">{{ row.driverName ?? '—' }}</td>
                    <td class="text-xs text-gray-500">{{ row.vehiclePlate ?? '—' }}</td>
                    <td class="text-xs text-gray-600">{{ row.dispatchDate ? (row.dispatchDate | date:'dd/MM/yyyy') : '—' }}</td>
                    <td class="text-right font-bold text-xs text-gray-700">{{ (row.pesoTotal ?? 0) | number:'1.0-0':'es-CO' }}</td>
                    <td>
                      <span class="status-badge" [ngClass]="statusClass(row.status)">{{ row.status }}</span>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="8" class="text-center text-gray-400 text-sm py-8">Sin despachos listos para despacho</td></tr>
                }
              </tbody>
            </table>
          } @else {
            <table class="fm-table">
              <thead>
                <tr class="bg-gray-50/60">
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Ciudad</th>
                  <th>Fecha</th>
                  <th class="!text-right">Peso (kg)</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (row of orderRows(); track row.id) {
                  <tr>
                    <td class="font-bold text-xs text-[#071938]">{{ row.orderNumber }}</td>
                    <td class="font-semibold text-xs text-gray-800">{{ row.customerName }}</td>
                    <td class="text-xs text-gray-500">{{ row.city ?? '—' }}</td>
                    <td class="text-xs text-gray-600">{{ row.orderDate ? (row.orderDate | date:'dd/MM/yyyy') : '—' }}</td>
                    <td class="text-right font-bold text-xs text-gray-700">{{ (row.pesoTotal ?? 0) | number:'1.0-0':'es-CO' }}</td>
                    <td>
                      <span class="status-badge" [ngClass]="statusClass(row.status)">{{ row.status }}</span>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="6" class="text-center text-gray-400 text-sm py-8">Sin pedidos en esta sección</td></tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    }
  `
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
      default: return 'Logística — Despachos Listos para Despacho';
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
