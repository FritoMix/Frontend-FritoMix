import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService, ReportRow, ReportTab, OrderReport, DispatchReport } from '../../core/services/report.service';
import { dispatchStatusClass } from '../dispatchs/dispatch-status';
import { orderStatusClass } from '../orders/order-status';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'report-list.component.html'
})
export class ReportListComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  tabs: ReportTab[] = this.reportService.tabs;
  activeTab = signal<ReportTab>(this.reportService.tabs[0]);

  private records = new Map<string, WritableSignal<ReportRow[]>>();

  loading = signal(false);
  downloadingPdf = signal(false);
  error = signal<string | null>(null);

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
    this.reportService.getTabData(tab.endpoint).subscribe({
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
    const DISPATCH_STATUSES = new Set(['PENDIENTE', 'ELABORACION', 'PRODUCCION', 'LISTO_CARGUE', 'VEHICULO_ASIGNADO', 'CONDUCTOR_ASIGNADO', 'DESPACHADO']);
    return DISPATCH_STATUSES.has(status) ? dispatchStatusClass(status) : orderStatusClass(status);
  }

  downloadPdf() {
    const tab = this.activeTab();
    this.downloadingPdf.set(true);
    this.error.set(null);
    this.reportService.downloadPdf(tab.pdfType).subscribe({
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
