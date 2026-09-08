import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DispatchService } from '../../core/services/dispatch.service';
import { AuthService } from '../../core/services/auth.service';
import { DispatchResponse, DespachadorDto } from '../../core/models/dispatch.model';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { DispatchStepperComponent } from '../../shared/components/dispatch-stepper.component';
import { dispatchStatusClass, dispatchStatusLabel } from './dispatch-status';

@Component({
  selector: 'app-despacho2',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent, SearchInputComponent, DispatchStepperComponent],
  templateUrl: 'despacho2.component.html'
})
export class Despacho2Component implements OnInit {
  dispatchService = inject(DispatchService);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  loading = signal(true);
  cargandoConfirmados = signal(true);
  pendientes = signal<DispatchResponse[]>([]);
  confirmados = signal<DispatchResponse[]>([]);
  despachadores = signal<DespachadorDto[]>([]);
  searchTerm = signal('');
  confirmandoId = signal<number | null>(null);

  placasConfirmacion = new Map<number, string>();
  observaciones = new Map<number, string>();
  despachadoresSeleccion = new Map<number, number | null>();

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.pendientes();
    return this.pendientes().filter(d =>
      d.orderNumber.toLowerCase().includes(term) ||
      (d.orders?.[0]?.clientName ?? '').toLowerCase().includes(term) ||
      (d.vehicleNumber ?? '').toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.loadPendientes();
    this.loadConfirmados();
    this.loadDespachadores();
  }

  loadPendientes() {
    this.loading.set(true);
    this.dispatchService.paraConfirmar(['VEHICULO_ASIGNADO']).subscribe({
      next: (page) => {
        const list = page.content ?? [];
        this.pendientes.set(list);
        for (const d of list) {
          if (!this.placasConfirmacion.has(d.id)) {
            this.placasConfirmacion.set(d.id, d.vehicleNumber ?? '');
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || err.error?.error || 'Error al cargar los despachos por confirmar.');
      }
    });
  }

  loadConfirmados() {
    this.cargandoConfirmados.set(true);
    const role = this.authService.currentUser()?.role;
    const source = role === 'despachador2'
      ? this.dispatchService.misConfirmaciones()
      : this.dispatchService.paraConfirmar(['CONDUCTOR_ASIGNADO', 'DESPACHADO']);
    source.subscribe({
      next: (page) => {
        this.confirmados.set(page.content ?? []);
        this.cargandoConfirmados.set(false);
      },
      error: (err) => {
        this.cargandoConfirmados.set(false);
        this.toastService.error(err.error?.message || err.error?.error || 'Error al cargar las placas confirmadas.');
      }
    });
  }

  loadDespachadores() {
    this.dispatchService.despachadoresD3().subscribe({
      next: (list) => this.despachadores.set(list),
      error: () => this.despachadores.set([])
    });
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
  }

  placaConfirmadaDe(id: number): string {
    return this.placasConfirmacion.get(id) ?? '';
  }

  setPlacaConfirmacion(id: number, value: string) {
    this.placasConfirmacion.set(id, value);
  }

  observacionDe(id: number): string {
    return this.observaciones.get(id) ?? '';
  }

  setObservacion(id: number, value: string) {
    this.observaciones.set(id, value);
  }

  despachadorDe(id: number): number | null {
    return this.despachadoresSeleccion.get(id) ?? null;
  }

  setDespachador(id: number, despachadorId: number) {
    this.despachadoresSeleccion.set(id, despachadorId);
  }

  placaAsignada(d: DispatchResponse): string {
    return d.vehiclePlate || d.vehicleNumber || '';
  }

  confirmar(d: DispatchResponse) {
    const despachadorId = this.despachadorDe(d.id);
    if (!despachadorId) {
      this.toastService.error('Debe seleccionar el despachador (Despacho 3) antes de confirmar.');
      return;
    }
    const placa = this.placaConfirmadaDe(d.id).trim().toUpperCase();
    if (!placa) {
      this.toastService.error('Debe confirmar la placa del vehículo.');
      return;
    }
    const placaAnterior = (this.placaAsignada(d) || '').toUpperCase();
    const observacion = this.observacionDe(d.id).trim();
    if (placa !== placaAnterior && !observacion) {
      this.toastService.error('Si cambia la placa, debe registrar la observación del cambio.');
      return;
    }

    this.confirmandoId.set(d.id);
    this.dispatchService.confirmarPlaca(d.id, {
      despachadorId,
      placa,
      observacionPlaca: observacion || undefined
    }).subscribe({
      next: (confirmado) => {
        this.confirmandoId.set(null);
        this.pendientes.set(this.pendientes().filter(x => x.id !== d.id));
        this.placasConfirmacion.delete(d.id);
        this.observaciones.delete(d.id);
        this.despachadoresSeleccion.delete(d.id);
        this.confirmados.set([confirmado, ...this.confirmados()]);
        this.toastService.success(`Placa ${placa} confirmada para ${confirmado.orderNumber || confirmado.dispatchNumber}.`);
      },
      error: (err) => {
        this.confirmandoId.set(null);
        this.toastService.error(err.error?.message || err.error?.error || 'Error al confirmar la placa.');
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