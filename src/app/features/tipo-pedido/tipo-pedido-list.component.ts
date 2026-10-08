import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { MultipedidoService } from '../../core/services/multipedido.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { OrderResponse } from '../../core/models/order.model';
import { MultipedidoResponse } from '../../core/models/multipedido.model';

@Component({
  selector: 'app-tipo-pedido-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: 'tipo-pedido-list.component.html'
})
export class TipoPedidoListComponent implements OnInit {
  private orderService = inject(OrderService);
  private multipedidoService = inject(MultipedidoService);
  private toastService = inject(ToastService);

  activeTab = signal<'clasificacion' | 'paquetes'>('clasificacion');

  orders = signal<OrderResponse[]>([]);
  multipedidos = signal<MultipedidoResponse[]>([]);
  loading = signal(true);
  loadingMultipedidos = signal(false);
  searchQuery = signal('');
  selectedFilter = signal<'TODOS' | 'pedido_unico' | 'pedido_multipedido'>('TODOS');
  selectedOrderIds = signal<number[]>([]);
  processing = signal(false);

  selectedMultipedidoDetail = signal<MultipedidoResponse | null>(null);

  // Computed Stats
  totalOrders = computed(() => this.orders().length);
  totalUnicos = computed(() => this.orders().filter(o => o.tipoPedido === 'pedido_unico' || !o.tipoPedido).length);
  totalMultis = computed(() => this.orders().filter(o => o.tipoPedido === 'pedido_multipedido').length);
  totalPaquetes = computed(() => this.multipedidos().length);

  filteredOrders = computed(() => {
    let list = this.orders();
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(o =>
        (o.orderNumber || '').toLowerCase().includes(query) ||
        (o.customerName || '').toLowerCase().includes(query) ||
        (o.cityName || '').toLowerCase().includes(query)
      );
    }
    const filter = this.selectedFilter();
    if (filter === 'pedido_unico') {
      list = list.filter(o => o.tipoPedido === 'pedido_unico' || !o.tipoPedido);
    } else if (filter === 'pedido_multipedido') {
      list = list.filter(o => o.tipoPedido === 'pedido_multipedido');
    }
    return list;
  });

  ngOnInit() {
    this.load();
    this.loadMultipedidos();
  }

  load() {
    this.loading.set(true);
    this.orderService.findAll().subscribe({
      next: (res: OrderResponse[]) => {
        this.orders.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadMultipedidos() {
    this.loadingMultipedidos.set(true);
    this.multipedidoService.findAll().subscribe({
      next: (res: MultipedidoResponse[]) => {
        this.multipedidos.set(res);
        this.loadingMultipedidos.set(false);
      },
      error: () => this.loadingMultipedidos.set(false)
    });
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedOrderIds.set(this.filteredOrders().map(o => o.id));
    } else {
      this.selectedOrderIds.set([]);
    }
  }

  toggleSelectOrder(id: number) {
    const current = this.selectedOrderIds();
    if (current.includes(id)) {
      this.selectedOrderIds.set(current.filter(item => item !== id));
    } else {
      this.selectedOrderIds.set([...current, id]);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedOrderIds().includes(id);
  }

  applyTipoPedido(orderIds: number[], tipoPedido: 'pedido_unico' | 'pedido_multipedido') {
    if (!orderIds.length || this.processing()) return;
    this.processing.set(true);
    this.orderService.updateTipoPedido(orderIds, tipoPedido).subscribe({
      next: () => {
        this.processing.set(false);
        this.toastService.success(
          `Se actualizó el tipo de pedido a ${tipoPedido === 'pedido_unico' ? 'Único' : 'Multipedido'} para ${orderIds.length} ${orderIds.length === 1 ? 'pedido' : 'pedidos'}.`
        );
        this.selectedOrderIds.set([]);
        this.load();
      },
      error: (err) => {
        this.processing.set(false);
        this.toastService.error(err.error?.message || 'Error al actualizar el tipo de pedido.');
      }
    });
  }

  applyBulk(tipoPedido: 'pedido_unico' | 'pedido_multipedido') {
    const ids = this.selectedOrderIds();
    if (!ids.length) {
      this.toastService.error('Selecciona al menos un pedido.');
      return;
    }
    this.applyTipoPedido(ids, tipoPedido);
  }

  crearPaqueteMultipedido() {
    const ids = this.selectedOrderIds();
    if (ids.length < 2) {
      this.toastService.error('Debes seleccionar al menos 2 pedidos para empaquetar un Multipedido.');
      return;
    }
    this.processing.set(true);
    this.multipedidoService.create(ids).subscribe({
      next: (mp) => {
        this.processing.set(false);
        this.toastService.success(`Paquete Multipedido ${mp.numero} creado exitosamente con ${mp.orders.length} pedidos.`);
        this.selectedOrderIds.set([]);
        this.load();
        this.loadMultipedidos();
        this.activeTab.set('paquetes');
      },
      error: (err) => {
        this.processing.set(false);
        this.toastService.error(err.error?.message || 'Error al crear el paquete multipedido.');
      }
    });
  }

  eliminarPaqueteMultipedido(mp: MultipedidoResponse) {
    if (!confirm(`¿Estás seguro de deshacer el paquete Multipedido ${mp.numero}? Los pedidos volverán a ser pedidos individuales.`)) {
      return;
    }
    this.processing.set(true);
    this.multipedidoService.delete(mp.id).subscribe({
      next: () => {
        this.processing.set(false);
        this.toastService.success(`Paquete Multipedido ${mp.numero} eliminado.`);
        if (this.selectedMultipedidoDetail()?.id === mp.id) {
          this.selectedMultipedidoDetail.set(null);
        }
        this.load();
        this.loadMultipedidos();
      },
      error: (err) => {
        this.processing.set(false);
        this.toastService.error(err.error?.message || 'Error al eliminar paquete multipedido.');
      }
    });
  }

  verDetallePaquete(mp: MultipedidoResponse) {
    this.selectedMultipedidoDetail.set(mp);
  }

  cerrarModalDetalle() {
    this.selectedMultipedidoDetail.set(null);
  }
}
