import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DriverService } from '../../core/services/driver.service';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--green">14.</span>
        <h1 class="text-2xl font-extrabold text-[#071938]">Conductores</h1>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
      <div class="relative flex-1 max-w-xl">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input
          type="text"
          [ngModel]="driverService.searchTerm()"
          (ngModelChange)="driverService.setSearchTerm($event)"
          placeholder="Buscar conductor por nombre o documento..."
          class="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
        />
      </div>
      <button
        routerLink="/conductores/nuevo"
        class="bg-[#0055FF] hover:bg-[#0044DD] text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
        Nuevo Conductor
      </button>
    </div>

    <div class="fm-card overflow-hidden">
      @if (driverService.loading()) {
        <div class="flex items-center justify-center py-16">
          <span class="text-gray-500 text-sm">Cargando conductores...</span>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="fm-table">
            <thead>
              <tr class="bg-gray-50/60">
                <th class="!pl-6">Nombre</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Licencia</th>
                <th>Estado</th>
                <th class="text-right !pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (driver of paginatedDrivers(); track driver.id) {
                <tr>
                  <td class="!pl-6">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-blue-100 text-blue-700 ring-2 ring-white shadow-sm">
                        {{ driver.avatarInitials }}
                      </div>
                      <span class="font-semibold text-[#071938]">{{ driver.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="font-mono text-sm text-gray-600">{{ formatDocument(driver.document) }}</span>
                  </td>
                  <td>
                    <span class="text-gray-600">{{ driver.phone || '—' }}</span>
                  </td>
                  <td>
                    <span class="font-mono text-sm text-gray-600">{{ driver.licenseNumber }}</span>
                  </td>
                  <td>
                    @if (driver.active) {
                      <span class="status-badge bg-green-50 text-green-700 border-green-200">Activo</span>
                    } @else {
                      <span class="status-badge bg-red-50 text-red-600 border-red-200">Inactivo</span>
                    }
                  </td>
                  <td class="text-right !pr-6">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        (click)="editDriver(driver.id)"
                        class="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-[#0055FF] transition-colors"
                        title="Editar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button
                        (click)="deleteDriver(driver.id)"
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
                  <td colspan="6" class="py-16 text-center">
                    <div class="flex flex-col items-center gap-2">
                      <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                      <p class="text-sm font-semibold text-[#071938]">No se encontraron conductores</p>
                      <p class="text-xs text-gray-500">Intenta con otro término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (totalPages() > 1) {
          <div class="fm-pagination border-t border-gray-100">
            <button class="fm-page-btn" [disabled]="currentPage() === 1" (click)="currentPage.set(currentPage() - 1)">&lt;</button>
            @for (page of visiblePages(); track page) {
              @if (page === -1) {
                <span class="px-1 text-gray-400">...</span>
              } @else {
                <button class="fm-page-btn" [class.fm-page-btn--active]="page === currentPage()" (click)="currentPage.set(page)">{{ page }}</button>
              }
            }
            <button class="fm-page-btn" [disabled]="currentPage() === totalPages()" (click)="currentPage.set(currentPage() + 1)">&gt;</button>
          </div>
        }
      }
    </div>
  `
})
export class DriverListComponent implements OnInit {
  driverService = inject(DriverService);
  router = inject(Router);

  currentPage = signal(1);
  pageSize = 5;

  driversFiltered = computed(() => this.driverService.filteredDrivers());
  totalPages = computed(() => Math.ceil(this.driversFiltered().length / this.pageSize) || 1);

  paginatedDrivers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.driversFiltered().slice(start, start + this.pageSize);
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  });

  ngOnInit() {
    this.driverService.loadDrivers();
  }

  formatDocument(doc: string): string {
    if (!doc) return '';
    return doc.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  editDriver(id: number) {
    this.router.navigate(['/conductores', id]);
  }

  deleteDriver(id: number) {
    if (confirm('¿Estás seguro de eliminar este conductor?')) {
      this.driverService.delete(id).subscribe({
        next: () => this.driverService.loadDrivers(),
      });
    }
  }
}
