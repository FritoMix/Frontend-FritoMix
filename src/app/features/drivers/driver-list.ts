import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DriverService } from '../../core/services/driver.service';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--green">14.</span>
        <h1 class="text-2xl font-extrabold text-[#071938]">Conductores</h1>
      </div>
    </div>

    <!-- Search & Action Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
      <div class="relative flex-1 max-w-xl">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input
          type="text"
          [ngModel]="driverService.searchTerm()"
          (ngModelChange)="driverService.searchTerm.set($event)"
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

    <!-- Table Card -->
    <div class="fm-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="fm-table">
          <thead>
            <tr class="bg-gray-50/60">
              <th class="!pl-6">Foto</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th class="text-right !pr-6">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (driver of paginatedDrivers(); track driver.id) {
              <tr>
                <td class="!pl-6">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-blue-100 text-blue-700 ring-2 ring-white shadow-sm">
                    {{ driver.avatarInitials || driver.fullName.substring(0, 2).toUpperCase() }}
                  </div>
                </td>
                <td>
                  <span class="font-mono text-sm text-gray-700">{{ driver.code }}</span>
                </td>
                <td>
                  <span class="font-semibold text-[#071938]">{{ driver.fullName }}</span>
                </td>
                <td>
                  <span class="text-gray-600 font-mono text-sm">{{ formatDocument(driver.documentNumber) }}</span>
                </td>
                <td>
                  <span class="text-gray-600">{{ driver.phone }}</span>
                </td>
                <td>
                  @if (driver.active) {
                    <span class="status-badge bg-green-50 text-green-700 border-green-200">Activo</span>
                  } @else {
                    <span class="status-badge bg-red-50 text-red-600 border-red-200">Inactivo</span>
                  }
                </td>
                <td class="text-right !pr-6">
                  <button class="kebab-btn" title="Acciones">⋮</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="py-16 text-center">
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

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="fm-pagination border-t border-gray-100">
          <button
            class="fm-page-btn"
            [disabled]="currentPage() === 1"
            (click)="currentPage.set(currentPage() - 1)"
          >&lt;</button>
          @for (page of visiblePages(); track page) {
            @if (page === -1) {
              <span class="px-1 text-gray-400">...</span>
            } @else {
              <button
                class="fm-page-btn"
                [class.fm-page-btn--active]="page === currentPage()"
                (click)="currentPage.set(page)"
              >{{ page }}</button>
            }
          }
          <button
            class="fm-page-btn"
            [disabled]="currentPage() === totalPages()"
            (click)="currentPage.set(currentPage() + 1)"
          >&gt;</button>
        </div>
      }
    </div>
  `
})
export class DriverListComponent {
  driverService = inject(DriverService);
  router = inject(Router);

  currentPage = signal(1);
  pageSize = 5;

  filtroLicencia = signal<string>('');

  driversFiltrados = computed(() => {
    const base = this.driverService.filteredDrivers();
    const tipo = this.filtroLicencia();
    if (!tipo) return base;
    return base.filter(d => d.licenseType === tipo);
  });

  totalPages = computed(() => Math.ceil(this.driversFiltrados().length / this.pageSize) || 1);

  paginatedDrivers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.driversFiltrados().slice(start, start + this.pageSize);
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
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  });

  formatDocument(doc: string): string {
    if (!doc) return '';
    return doc.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}
