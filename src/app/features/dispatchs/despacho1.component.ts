import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DispatchService } from '../../core/services/dispatch.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderResponse } from '../../core/models/order.model';
import { DispatchResponse } from '../../core/models/dispatch.model';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { DispatchStepperComponent } from '../../shared/components/dispatch-stepper.component';
import { dispatchStatusClass, dispatchStatusLabel } from './dispatch-status';

@Component({
  selector: 'app-despacho1',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent, SearchInputComponent, DispatchStepperComponent],
  templateUrl: 'despacho1.component.html'
})
export class Despacho1Component implements OnInit {
  dispatchService = inject(DispatchService);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  loading = signal(true);
  orders = signal<OrderResponse[]>([]);
  asignados = signal<DispatchResponse[]>([]);
  cargandoAsignados = signal(true);
  searchTerm = signal('');
  asignandoId = signal<number | null>(null);
  placas = new Map<number, string>();

  filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.orders();
    if (!term) return list;
    return list.filter(o =>
      o.orderNumber.toLowerCase().includes(term) ||
      (o.customerName || '').toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.load();
    this.loadAsignados();
  }

  load() {
    this.loading.set(true);
    this.dispatchService.listosParaCargue().subscribe({
      next: (list) => {
        this.orders.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || err.error?.error || 'Error al cargar los pedidos listos para cargue.');
      }
    });
  }

  loadAsignados() {
    this.cargandoAsignados.set(true);
    const role = this.authService.currentUser()?.role;
    const source = role === 'despachador1'
      ? this.dispatchService.misAsignaciones()
      : this.dispatchService.paraConfirmar(['VEHICULO_ASIGNADO', 'CONDUCTOR_ASIGNADO', 'DESPACHADO']);
    source.subscribe({
      next: (page) => {
        this.asignados.set(page.content ?? []);
        this.cargandoAsignados.set(false);
      },
      error: (err) => {
        this.cargandoAsignados.set(false);
        this.toastService.error(err.error?.message || err.error?.error || 'Error al cargar los pedidos con placa asignada.');
      }
    });
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
  }

  placaDe(orderId: number): string {
    return this.placas.get(orderId) ?? '';
  }

  setPlaca(orderId: number, value: string) {
    this.placas.set(orderId, value.toUpperCase());
  }

  asignarPlaca(order: OrderResponse) {
    const placa = (this.placas.get(Number(order.id)) || '').trim().toUpperCase();
    if (!placa) {
      this.toastService.error('Digite la placa del vehículo antes de asignar.');
      return;
    }
    this.asignandoId.set(Number(order.id));
    this.dispatchService.asignarPlaca(Number(order.id), placa).subscribe({
      next: () => {
        this.asignandoId.set(null);
        this.placas.delete(Number(order.id));
        this.orders.set(this.orders().filter(o => o.id !== order.id));
        this.loadAsignados();
        this.toastService.success(`Vehículo ${placa} asignado al pedido ${order.orderNumber}.`);
      },
      error: (err) => {
        this.asignandoId.set(null);
        this.toastService.error(err.error?.message || err.error?.error || 'Error al asignar la placa.');
      }
    });
  }

  estadoClase(status: string): string {
    return dispatchStatusClass(status);
  }

  estadoEtiqueta(status: string): string {
    return dispatchStatusLabel(status);
  }
}