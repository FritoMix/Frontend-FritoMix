import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductionService } from '../../core/services/production.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-production-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, SearchInputComponent, PaginationComponent, ConfirmDialogComponent],
  templateUrl: 'production-list.component.html'
})
export class ProductionListComponent implements OnInit {
  productionService = inject(ProductionService);
  toastService = inject(ToastService);
  router = inject(Router);

  currentPage = signal(1);

  confirmDialog = signal<{ title: string; message: string; confirmLabel: string; type: 'info' | 'danger'; action: () => void } | null>(null);

  orders = computed(() => this.productionService.items());
  totalPages = computed(() => this.productionService.totalPages() || 1);

  ngOnInit() {
    this.productionService.load();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.productionService.setPage(page - 1);
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.productionService.setSearchTerm(value);
  }

  badgeClass(status: string): string {
    const map: Record<string, string> = {
      'APROBADO': 'bg-green-50 text-green-700 border-green-200',
      'EN_PRODUCCION': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'LISTO_PRODUCCION': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  viewOrder(id: string) {
    this.router.navigate(['/pedidos', id]);
  }

  startProduction(id: string) {
    this.openConfirm({
      title: 'Iniciar producción',
      message: '¿Está seguro de que este pedido entra en producción?',
      confirmLabel: 'Iniciar',
      type: 'info',
      action: () => {
        this.productionService.updateProductionStatus(Number(id), 'EN_PRODUCCION').subscribe({
          next: () => {
            this.productionService.load();
            this.toastService.success('Pedido en producción.');
          },
          error: (err) => this.toastService.error(err.error?.message || err.error?.error || 'Error al iniciar producción.')
        });
      }
    });
  }

  markReady(id: string) {
    this.openConfirm({
      title: 'Finalizar producción',
      message: '¿Está seguro de que el pedido terminó producción y queda listo para despacho?',
      confirmLabel: 'Finalizar',
      type: 'info',
      action: () => {
        this.productionService.updateProductionStatus(Number(id), 'LISTO_PRODUCCION').subscribe({
          next: () => {
            this.productionService.load();
            this.toastService.success('Producción finalizada. Pedido listo para despacho.');
          },
          error: (err) => this.toastService.error(err.error?.message || err.error?.error || 'Error al finalizar producción.')
        });
      }
    });
  }

  openConfirm(config: { title: string; message: string; confirmLabel: string; type: 'info' | 'danger'; action: () => void }) {
    this.confirmDialog.set(config);
  }

  closeConfirm() {
    this.confirmDialog.set(null);
  }
}