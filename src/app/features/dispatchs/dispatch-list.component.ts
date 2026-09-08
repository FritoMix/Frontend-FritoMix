import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DispatchService } from '../../core/services/dispatch.service';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { DispatchStepperComponent } from '../../shared/components/dispatch-stepper.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { Dispatch, DispatchStatus, nextDispatchStatus } from '../../core/models/dispatch.model';
import { ToastService } from '../../core/services/toast.service';
import { dispatchStatusClass, dispatchStatusLabel } from './dispatch-status';

@Component({
  selector: 'app-dispatch-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, SearchInputComponent, PaginationComponent, DispatchStepperComponent],
  templateUrl: 'dispatch-list.component.html'
})
export class DispatchListComponent implements OnInit {
  dispatchService = inject(DispatchService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);

  currentPage = signal(1);

  role = computed(() => this.authService.currentUser()?.role);
  isCartera = computed(() => this.role() === 'cartera');

  esDespachador1 = computed(() => this.role() === 'despachador1');
  esDespachador2 = computed(() => this.role() === 'despachador2');
  esDespachador3 = computed(() => this.role() === 'despachador3');
  enModulo1 = computed(() => this.router.url.startsWith('/despacho1'));
  enModulo2 = computed(() => this.router.url.startsWith('/despacho2'));

  puedeAvanzar = computed(() => {
    const role = this.role();
    return role === 'despachador' || role === 'admin';
  });

  puedeCrear = computed(() => {
    const role = this.role();
    return role === 'despachador' || role === 'admin' || role === 'coordinador';
  });

  puedeEliminar = computed(() =>
    !this.isCartera() && !this.esDespachador1() && !this.esDespachador2() && !this.esDespachador3()
  );

  ngOnInit() {
    if (this.enModulo1()) {
      this.dispatchService.setStatusFilter(['PENDIENTE']);
    } else if (this.enModulo2()) {
      this.dispatchService.setStatusFilter(['VEHICULO_ASIGNADO', 'CONDUCTOR_ASIGNADO']);
    } else if (this.esDespachador3()) {
      this.dispatchService.setStatusFilter([]);
      this.dispatchService.loadAssigned();
    } else {
      this.dispatchService.setStatusFilter([]);
    }
  }

  tituloModulo(): string {
    if (this.enModulo1()) return 'Despacho 1 · Asignar Vehículo';
    if (this.enModulo2()) return 'Despacho 2 · Confirmar Placa y Despachador';
    if (this.esDespachador3()) return 'Despacho 3 · Cargue del Camión';
    return 'Gestión de Despachos';
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.dispatchService.setPage(page - 1);
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.dispatchService.setSearchTerm(value);
  }

  paginatedDispatches = computed(() => this.dispatchService.items());
  totalPages = computed(() => this.dispatchService.totalPages() || 1);


  statusClass(status: DispatchStatus): string {
    return dispatchStatusClass(status);
  }

  statusLabel(status: DispatchStatus): string {
    return dispatchStatusLabel(status);
  }

  eliminar(id: string) {
    if (confirm('¿Está seguro de eliminar este despacho?')) {
      this.dispatchService.delete(Number(id)).subscribe({
        next: () => {
          this.dispatchService.load();
          this.toastService.success('Despacho eliminado exitosamente.');
        },
        error: (err) => this.toastService.error(err.error?.message || err.error?.error || 'Error al eliminar el despacho.')
      });
    }
  }

  puedeCargar(d: Dispatch): boolean {
    return this.esDespachador3() && d.status !== 'DESPACHADO';
  }

  editDispatch(d: Dispatch) {
    this.router.navigate(['/despachos', d.id, 'editar']);
  }

  editTitle(): string {
    if (this.enModulo1()) return 'Asignar vehículo';
    if (this.enModulo2()) return 'Confirmar placa y despachador';
    if (this.esDespachador3()) return 'Cargar camión';
    return 'Editar';
  }

  verDetalle(id: string) {
    this.router.navigate(['/despachos', id]);
  }

  nextStatus(status: DispatchStatus): DispatchStatus | null {
    return nextDispatchStatus(status);
  }

  avanzar(id: string, status: DispatchStatus) {
    const next = nextDispatchStatus(status);
    if (!next) return;
    this.dispatchService.updateStatus(Number(id), next).subscribe({
      next: () => {
        this.dispatchService.load();
        this.toastService.success('Estado del despacho actualizado.');
      },
      error: (err) => this.toastService.error(err.error?.message || err.error?.error || 'Error al avanzar el estado del despacho.')
    });
  }
}
