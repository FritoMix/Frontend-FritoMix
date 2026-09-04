import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, SearchInputComponent, PaginationComponent, ConfirmDialogComponent],
  templateUrl: 'order-list.component.html'
})
export class OrderListComponent implements OnInit {
  orderService = inject(OrderService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);

  currentPage = signal(1);

  isCartera = computed(() => this.authService.currentUser()?.role === 'cartera');

  confirmDialog = signal<{ title: string; message: string; confirmLabel: string; type: 'info' | 'danger'; action: () => void } | null>(null);

  paginatedOrders = computed(() => this.orderService.items());
  totalPages = computed(() => this.orderService.totalPages() || 1);


  ngOnInit() {
    this.orderService.load();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.orderService.setPage(page - 1);
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.orderService.setSearchTerm(value);
  }

  badgeClass(status: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'APROBADO': 'bg-green-50 text-green-700 border-green-200',
      'CANCELADO': 'bg-red-50 text-red-600 border-red-200',
      'EN_PRODUCCION': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'LISTO_PRODUCCION': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  viewOrder(id: string) {
    this.router.navigate(['/pedidos', id]);
  }

  editOrder(id: string) {
    this.router.navigate(['/pedidos', id, 'editar']);
  }

  openConfirm(config: { title: string; message: string; confirmLabel: string; type: 'info' | 'danger'; action: () => void }) {
    this.confirmDialog.set(config);
  }

  closeConfirm() {
    this.confirmDialog.set(null);
  }

  deleteOrder(id: string) {
    this.openConfirm({
      title: 'Eliminar pedido',
      message: '¿Está seguro de eliminar este pedido? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      type: 'danger',
      action: () => {
        this.orderService.delete(Number(id)).subscribe({
          next: () => {
            this.orderService.load();
            this.toastService.success('Pedido eliminado exitosamente.');
          },
          error: (err) => this.toastService.error(err.error?.message || err.error?.error || 'Error al eliminar el pedido.')
        });
      }
    });
  }

  approveOrder(id: string) {
    this.openConfirm({
      title: 'Aprobar pedido',
      message: '¿Está seguro de aprobar este pedido?',
      confirmLabel: 'Aprobar',
      type: 'info',
      action: () => {
        this.orderService.updateStatus(Number(id), 'APROBADO').subscribe({
          next: () => {
            this.orderService.load();
            this.toastService.success('Pedido aprobado exitosamente.');
          },
          error: (err) => this.toastService.error(err.error?.message || err.error?.error || 'Error al aprobar el pedido.')
        });
      }
    });
  }

  cancelOrder(id: string) {
    this.openConfirm({
      title: 'Cancelar pedido',
      message: '¿Está seguro de cancelar este pedido?',
      confirmLabel: 'Cancelar',
      type: 'danger',
      action: () => {
        this.orderService.updateStatus(Number(id), 'CANCELADO').subscribe({
          next: () => {
            this.orderService.load();
            this.toastService.success('Pedido cancelado.');
          },
          error: (err) => this.toastService.error(err.error?.message || err.error?.error || 'Error al cancelar el pedido.')
        });
      }
    });
  }
}