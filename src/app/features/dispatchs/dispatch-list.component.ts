import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DispatchService } from '../../core/services/dispatch.service';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { Dispatch, DispatchStatus, nextDispatchStatus } from '../../core/models/dispatch.model';

@Component({
  selector: 'app-dispatch-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, SearchInputComponent, PaginationComponent],
  templateUrl: 'dispatch-list.component.html'
})
export class DispatchListComponent implements OnInit {
  dispatchService = inject(DispatchService);
  authService = inject(AuthService);
  router = inject(Router);

  currentPage = signal(1);
  pageSize = 10;

  isCartera = computed(() => this.authService.currentUser()?.role === 'cartera');

  puedeAvanzar = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'despachador' || role === 'admin';
  });

  ngOnInit() {
    this.dispatchService.loadDispatches();
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.dispatchService.setSearchTerm(value);
  }

  filtrosAplicados = computed(() => {
    return this.dispatchService.filteredDispatches();
  });

  totalPages = computed(() => Math.ceil(this.filtrosAplicados().length / this.pageSize) || 1);

  paginatedDispatches = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtrosAplicados().slice(start, start + this.pageSize);
  });


  statusClass(status: DispatchStatus): string {
    const map: Record<DispatchStatus, string> = {
      'PENDIENTE': 'bg-gray-100 text-gray-700 border-gray-300',
      'ELABORACION': 'bg-amber-50 text-amber-700 border-amber-200',
      'PRODUCCION': 'bg-blue-50 text-blue-700 border-blue-200',
      'LISTO_CARGUE': 'bg-teal-50 text-teal-700 border-teal-200',
      'DESPACHADO': 'bg-green-50 text-green-700 border-green-200'
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  }

  statusLabel(status: DispatchStatus): string {
    const map: Record<DispatchStatus, string> = {
      'PENDIENTE': 'PENDIENTE',
      'ELABORACION': 'ELABORACIÓN',
      'PRODUCCION': 'PRODUCCIÓN',
      'LISTO_CARGUE': 'LISTO CARGUE',
      'DESPACHADO': 'DESPACHADO'
    };
    return map[status] || status;
  }

  eliminar(id: string) {
    if (confirm('¿Está seguro de eliminar este despacho?')) {
      this.dispatchService.delete(Number(id)).subscribe(() => {
        this.dispatchService.loadDispatches();
      });
    }
  }

  editDispatch(d: Dispatch) {
    this.router.navigate(['/despachos', d.id, 'editar']);
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
      next: () => this.dispatchService.loadDispatches(),
      error: () => alert('Error al avanzar el estado del despacho.')
    });
  }
}
