import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, SearchInputComponent, PaginationComponent],
  template: `
<app-page-header badge="8." color="blue" title="Pedidos"></app-page-header>

    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
      <app-search-input
        (valueChange)="orderService.setSearchTerm($event)"
        placeholder="Buscar pedido por código o cliente..."
      ></app-search-input>
      @if (!isCartera()) {
        <button
          routerLink="/pedidos/nuevo"
          class="bg-[#0055FF] hover:bg-[#0044DD] text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          Nuevo pedido
        </button>
      }
    </div>

    <div class="fm-card overflow-hidden">
      @if (orderService.loading()) {
        <div class="flex items-center justify-center py-16">
          <span class="text-gray-500 text-sm">Cargando pedidos...</span>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="fm-table">
            <thead>
              <tr class="bg-gray-50/60">
                <th class="!pl-6">Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th class="text-right !pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (order of paginatedOrders(); track order.id) {
                <tr>
                  <td class="!pl-6">
                    <span class="font-mono text-sm font-semibold text-[#071938]">{{ order.orderNumber }}</span>
                  </td>
                  <td>
                    <span class="font-semibold text-[#071938]">{{ order.clientName }}</span>
                  </td>
                  <td>
                    <span class="text-gray-600 text-sm">{{ order.date }}</span>
                  </td>
                  <td>
                    <span class="status-badge" [class]="badgeClass(order.status)">{{ order.status }}</span>
                  </td>
                  <td class="text-right !pr-6">
                    <div class="flex items-center justify-end gap-2">
                      @if (isCartera() && order.status === 'PENDIENTE') {
                        <button (click)="approveOrder(order.id)"
                          class="p-1.5 rounded-md hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors"
                          title="Aprobar">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </button>
                        <button (click)="cancelOrder(order.id)"
                          class="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                          title="Cancelar">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </button>
                      }
                      <button (click)="viewOrder(order.id)"
                        class="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-[#0055FF] transition-colors"
                        title="Ver detalle">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      @if (!isCartera()) {
                        <button (click)="editOrder(order.id)"
                          class="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-[#0055FF] transition-colors"
                          title="Editar">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button (click)="deleteOrder(order.id)"
                          class="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                          title="Eliminar">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-16 text-center">
                    <div class="flex flex-col items-center gap-2">
                      <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                      <p class="text-sm font-semibold text-[#071938]">No se encontraron pedidos</p>
                      <p class="text-xs text-gray-500">Intenta con otro término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (totalPages() > 1) {
          <app-pagination [totalPages]="totalPages()" [(currentPage)]="currentPage"></app-pagination>
        }
      }
    </div>
  `
})
export class OrderListComponent implements OnInit {
  orderService = inject(OrderService);
  authService = inject(AuthService);
  router = inject(Router);

  currentPage = signal(1);
  pageSize = 10;

  isCartera = computed(() => this.authService.currentUser()?.role === 'cartera');

  ordersFiltered = computed(() => this.orderService.filteredOrders());
  totalPages = computed(() => Math.ceil(this.ordersFiltered().length / this.pageSize) || 1);

  paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.ordersFiltered().slice(start, start + this.pageSize);
  });


  ngOnInit() {
    this.orderService.loadOrders();
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
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  viewOrder(id: string) {
    this.router.navigate(['/pedidos', id]);
  }

  editOrder(id: string) {
    this.router.navigate(['/pedidos', id, 'editar']);
  }

  deleteOrder(id: string) {
    if (confirm('¿Está seguro de eliminar este pedido?')) {
      this.orderService.delete(Number(id)).subscribe({
        next: () => this.orderService.loadOrders(),
        error: () => alert('Error al eliminar el pedido.')
      });
    }
  }

  approveOrder(id: string) {
    if (confirm('¿Está seguro de aprobar este pedido?')) {
      this.orderService.updateStatus(Number(id), 'APROBADO').subscribe({
        next: () => this.orderService.loadOrders(),
        error: () => alert('Error al aprobar el pedido.')
      });
    }
  }

  cancelOrder(id: string) {
    if (confirm('¿Está seguro de cancelar este pedido?')) {
      this.orderService.updateStatus(Number(id), 'CANCELADO').subscribe({
        next: () => this.orderService.loadOrders(),
        error: () => alert('Error al cancelar el pedido.')
      });
    }
  }
}