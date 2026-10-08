import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductionService } from '../../core/services/production.service';
import { ToastService } from '../../core/services/toast.service';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { Order } from '../../core/models/order.model';
import { orderStatusClass, orderStatusLabel } from '../orders/order-status';

@Component({
  selector: 'app-production-list',
  standalone: true,
  imports: [CommonModule, SearchInputComponent, PaginationComponent, ConfirmDialogComponent],
  templateUrl: 'production-list.component.html'
})
export class ProductionListComponent implements OnInit {
  productionService = inject(ProductionService);
  toastService = inject(ToastService);
  router = inject(Router);

  currentPage = signal(1);
  selectedOrderForModal = signal<Order | null>(null);

  confirmDialog = signal<{ title: string; message: string; confirmLabel: string; type: 'info' | 'danger'; action: () => void } | null>(null);

  orders = computed(() => this.productionService.items());
  totalPages = computed(() => this.productionService.totalPages() || 1);
  totalElements = computed(() => this.productionService.totalElements());
  statusFilter = computed(() => this.productionService.selectedStatus());

  // COMPUTED KPI METRICS FOR CURRENT VIEW
  aprobadosOrders = computed(() => this.orders().filter(o => o.status === 'APROBADO'));
  enProduccionOrders = computed(() => this.orders().filter(o => o.status === 'EN_PRODUCCION'));
  listosOrders = computed(() => this.orders().filter(o => o.status === 'LISTO_PRODUCCION'));

  getOrderWeight(order: Order): number {
    if (order.pesoTotalKg && order.pesoTotalKg > 0) {
      return order.pesoTotalKg;
    }
    if (order.items && order.items.length > 0) {
      return order.items.reduce((sum, item) => sum + (item.pesoUnidad || 0) * (item.bulto || 0), 0);
    }
    return 0;
  }

  totalWeightKg = computed(() => {
    return this.orders().reduce((sum, o) => sum + this.getOrderWeight(o), 0);
  });

  filteredOrders = computed(() => this.orders());

  ngOnInit() {
    this.productionService.load();
  }

  setStatusFilter(filter: string) {
    this.currentPage.set(1);
    this.productionService.setStatusFilter(filter);
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
    return orderStatusClass(status);
  }

  statusLabel(status: string): string {
    return orderStatusLabel(status);
  }

  viewOrder(id: string) {
    this.router.navigate(['/pedidos', id]);
  }

  openQuickModal(order: Order, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.selectedOrderForModal.set(order);
  }

  closeQuickModal() {
    this.selectedOrderForModal.set(null);
  }

  startProduction(id: string, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.openConfirm({
      title: 'Iniciar Producción',
      message: '¿Está seguro de que este pedido entra inmediatamente en línea de producción?',
      confirmLabel: 'Iniciar Producción',
      type: 'info',
      action: () => {
        this.productionService.updateProductionStatus(Number(id), 'EN_PRODUCCION').subscribe({
          next: () => {
            this.productionService.load();
            this.toastService.success('¡Pedido ingresado a línea de producción!');
            this.closeQuickModal();
          },
          error: (err) => this.toastService.error(err.error?.message || err.error?.error || 'Error al iniciar producción.')
        });
      }
    });
  }

  markReady(id: string, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.openConfirm({
      title: 'Finalizar Producción',
      message: '¿Está seguro de que el pedido ha finalizado el proceso de empaque y queda listo para despacho?',
      confirmLabel: 'Finalizar y Notificar',
      type: 'info',
      action: () => {
        this.productionService.updateProductionStatus(Number(id), 'LISTO_PRODUCCION').subscribe({
          next: () => {
            this.productionService.load();
            this.toastService.success('¡Producción completada! Pedido enviado a cola de despacho.');
            this.closeQuickModal();
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

  initials(name: string): string {
    if (!name) return 'FM';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}