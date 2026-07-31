import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, forkJoin, switchMap, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface KPIResponse { totalSales: number; completedOrders: number; dispatchedUnits: number; }
interface TopProduct { rank: number; name: string; code: string; units: number; amount: number; }
interface TopClient { name: string; orders: number; amount: number; }

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--blue">11.</span>
        <h1 class="text-2xl font-extrabold text-[#071938]">Reportes</h1>
      </div>
    </div>

    <div class="fm-card p-5 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label for="periodo-select" class="block text-xs font-semibold text-gray-500 mb-1.5">Periodo</label>
          <select id="periodo-select" [(ngModel)]="periodo" (ngModelChange)="onFilterChange()"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white">
            <option value="hoy">Hoy</option>
            <option value="semana">Semana actual</option>
            <option value="mes">Mes actual</option>
            <option value="trimestre">Trimestre</option>
            <option value="ano">Año</option>
          </select>
        </div>
        <div>
          <label for="tipo-select" class="block text-xs font-semibold text-gray-500 mb-1.5">Tipo de reporte</label>
          <select id="tipo-select" [(ngModel)]="tipoReporte" (ngModelChange)="onFilterChange()"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white">
            <option value="ventas">Ventas</option>
            <option value="clientes">Clientes</option>
            <option value="productos">Productos</option>
          </select>
        </div>
        <div class="flex gap-2 col-span-2 justify-end">
          <button (click)="onFilterChange()"
            class="bg-[#0055FF] hover:bg-[#0044DD] text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm">
            Aplicar Filtro
          </button>
          <button (click)="downloadPdf()" [disabled]="downloadingPdf()"
            class="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            {{ downloadingPdf() ? 'Descargando...' : 'Descargar PDF' }}
          </button>
        </div>
      </div>
    </div>

    @if (error()) {
      <div class="fm-card p-5 mb-6 border border-red-200 bg-red-50">
        <p class="text-sm text-red-700 font-medium">{{ error() }}</p>
      </div>
    }

    @if (loading()) {
      <div class="flex items-center justify-center py-16">
        <span class="text-gray-500 text-sm">Cargando reportes...</span>
      </div>
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <div class="fm-card p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">💰</div>
            <span class="status-badge bg-green-50 text-green-700 border-green-200">Período actual</span>
          </div>
          <p class="text-xs text-gray-500 mb-0.5">Ventas totales período</p>
          <p class="text-2xl font-extrabold text-[#071938]">{{ kpis()?.totalSales | currency:'COP':'symbol-narrow':'1.0-0':'es-CO' }}</p>
        </div>
        <div class="fm-card p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg">📋</div>
            <span class="status-badge bg-green-50 text-green-700 border-green-200">Completados</span>
          </div>
          <p class="text-xs text-gray-500 mb-0.5">Pedidos completados</p>
          <p class="text-2xl font-extrabold text-[#071938]">{{ kpis()?.completedOrders ?? 0 }}</p>
        </div>
        <div class="fm-card p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-lg">📦</div>
            <span class="status-badge bg-green-50 text-green-700 border-green-200">Despachadas</span>
          </div>
          <p class="text-xs text-gray-500 mb-0.5">Productos despachados (und)</p>
          <p class="text-2xl font-extrabold text-[#071938]">{{ kpis()?.dispatchedUnits | number:'1.0-0':'es-CO' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="fm-card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-[#071938]">Top Productos Vendidos</h3>
          </div>
          <table class="fm-table">
            <thead>
              <tr class="bg-gray-50/60">
                <th>#</th>
                <th>Producto</th>
                <th class="text-left">Código</th>
                <th class="text-right">Unidades</th>
                <th class="text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              @for (p of topProducts(); track p.rank) {
                <tr>
                  <td class="font-bold text-xs text-gray-500">{{ p.rank }}</td>
                  <td class="font-semibold text-[#071938] text-xs">{{ p.name }}</td>
                  <td class="text-xs text-gray-500 font-mono">{{ p.code }}</td>
                  <td class="text-right font-bold text-xs text-gray-800">{{ p.units | number:'1.0-0':'es-CO' }}</td>
                  <td class="text-right font-extrabold text-xs text-[#071938]">{{ p.amount | currency:'COP':'symbol-narrow':'1.0-0':'es-CO' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="text-center text-gray-400 text-sm py-8">Sin datos para el período</td></tr>
              }
            </tbody>
          </table>
        </div>

        <div class="fm-card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-[#071938]">Top Clientes</h3>
          </div>
          <table class="fm-table">
            <thead>
              <tr class="bg-gray-50/60">
                <th>Cliente</th>
                <th class="text-right">Pedidos</th>
                <th class="text-right">Monto Total</th>
              </tr>
            </thead>
            <tbody>
              @for (c of topClients(); track c.name) {
                <tr>
                  <td class="font-semibold text-[#071938] text-xs">{{ c.name }}</td>
                  <td class="text-right font-bold text-xs text-gray-800">{{ c.orders | number:'1.0-0':'es-CO' }}</td>
                  <td class="text-right font-extrabold text-xs text-[#071938]">{{ c.amount | currency:'COP':'symbol-narrow':'1.0-0':'es-CO' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="3" class="text-center text-gray-400 text-sm py-8">Sin datos para el período</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `
})
export class ReportListComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);

  periodo = 'mes';
  tipoReporte = 'ventas';

  loading = signal(false);
  downloadingPdf = signal(false);
  error = signal<string | null>(null);

  kpis = signal<KPIResponse | null>(null);
  topProducts = signal<TopProduct[]>([]);
  topClients = signal<TopClient[]>([]);

  private readonly filter$ = new Subject<{ periodo: string; tipo: string }>();
  private readonly destroy$ = new Subject<void>();

  private readonly baseUrl = environment.apiUrl;

  constructor() {
    this.filter$.pipe(
      switchMap(({ periodo, tipo }) => {
        this.loading.set(true);
        this.error.set(null);
        const params = { period: periodo };
        return forkJoin([
          this.http.get<KPIResponse>(`${this.baseUrl}/api/v1/reports/kpis`, { params }),
          this.http.get<TopProduct[]>(`${this.baseUrl}/api/v1/reports/top-products`, { params }),
          this.http.get<TopClient[]>(`${this.baseUrl}/api/v1/reports/top-clients`, { params }),
        ]).pipe(
          takeUntil(this.destroy$),
          catchError(err => {
            this.error.set('No se pudieron cargar los reportes. Intenta de nuevo.');
            this.loading.set(false);
            return of(null);
          }),
        );
      }),
    ).subscribe(result => {
      if (result) {
        const [kpis, topProducts, topClients] = result;
        this.kpis.set(kpis);
        this.topProducts.set(topProducts);
        this.topClients.set(topClients);
      }
      this.loading.set(false);
    });
  }

  ngOnInit() {
    this.onFilterChange();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.filter$.complete();
  }

  onFilterChange() {
    this.filter$.next({ periodo: this.periodo, tipo: this.tipoReporte });
  }

  downloadPdf() {
    this.downloadingPdf.set(true);
    this.error.set(null);
    this.http.get(`${this.baseUrl}/api/v1/reports/pdf`, {
      params: { type: this.tipoReporte, period: this.periodo },
      responseType: 'blob'
    }).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${this.tipoReporte}-${this.periodo}.pdf`;
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
