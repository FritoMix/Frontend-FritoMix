import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../core/services/vehicle.service';
import { PageHeaderComponent } from '../../shared/components/page-header';
import { SearchInputComponent } from '../../shared/components/search-input';
import { PaginationComponent } from '../../shared/components/pagination';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, SearchInputComponent, PaginationComponent],
  template: `
<app-page-header badge="13." color="purple" title="Vehículos"></app-page-header>

    <div class="fm-search-row">
      <app-search-input
        (valueChange)="vehicleService.setSearchTerm($event)"
        placeholder="Buscar por Nº vehículo, tipo..."
      ></app-search-input>
      <button
        routerLink="/vehiculos/nuevo"
        class="bg-[#0055FF] hover:bg-[#0044DD] text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap justify-center sm:justify-center"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
        Nuevo vehículo
      </button>
    </div>

    <div class="fm-card overflow-hidden">
      @if (vehicleService.loading()) {
        <div class="flex items-center justify-center py-16">
          <span class="text-gray-500 text-sm">Cargando vehículos...</span>
        </div>
      } @else {
        <div class="fm-table-wrapper">
          <table class="fm-table">
            <thead>
              <tr>
                <th>Nº Vehículo</th>
                <th>Tipo</th>
                <th>Capacidad</th>
                <th>Dimensión</th>
                <th>Estado</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (vehicle of paginatedVehicles(); track vehicle.id) {
                <tr>
                  <td>
                    <span class="code-badge bg-gray-900 text-white border-gray-900">{{ vehicle.vehicleNumber }}</span>
                  </td>
                  <td>
                    <span class="font-semibold text-[#071938] capitalize">{{ vehicle.type }}</span>
                  </td>
                  <td>
                    <span class="text-gray-600 text-sm">{{ vehicle.capacity }} kg</span>
                  </td>
                  <td>
                    <span class="text-gray-600 text-sm">{{ vehicle.dimension }} m³</span>
                  </td>
                  <td>
                    @if (vehicle.active) {
                      <span class="status-badge bg-green-50 text-green-700 border-green-200">Activo</span>
                    } @else {
                      <span class="status-badge bg-red-50 text-red-600 border-red-200">Inactivo</span>
                    }
                  </td>
                  <td>
                    <div class="fm-actions-cell">
                      <button
                        (click)="editVehicle(vehicle.id)"
                        class="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-[#0055FF] transition-colors"
                        title="Editar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button
                        (click)="deleteVehicle(vehicle.id)"
                        class="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="!text-center">
                    <div class="fm-empty">
                      <svg class="fm-empty__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                      <p class="fm-empty__title">No se encontraron vehículos</p>
                      <p class="fm-empty__subtitle">Intenta con otro término de búsqueda</p>
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
export class VehicleListComponent implements OnInit {
  vehicleService = inject(VehicleService);
  router = inject(Router);

  currentPage = signal(1);
  pageSize = 5;

  vehiculosFiltrados = computed(() => this.vehicleService.filteredVehicles());
  totalPages = computed(() => Math.ceil(this.vehiculosFiltrados().length / this.pageSize) || 1);

  paginatedVehicles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.vehiculosFiltrados().slice(start, start + this.pageSize);
  });


  ngOnInit() {
    this.vehicleService.loadVehicles();
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.vehicleService.setSearchTerm(value);
  }

  editVehicle(id: number) {
    this.router.navigate(['/vehiculos', id]);
  }

  deleteVehicle(id: number) {
    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
      this.vehicleService.delete(id).subscribe({
        next: () => this.vehicleService.loadVehicles(),
      });
    }
  }
}
