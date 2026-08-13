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
  templateUrl: 'order-list.component.html'
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