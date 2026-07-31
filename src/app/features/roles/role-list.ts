import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--purple">13.</span>
        <h1 class="text-2xl font-extrabold text-[#071938]">Roles</h1>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
      <div class="relative flex-1 max-w-xl">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input
          type="text"
          [ngModel]="roleService.searchTerm()"
          (ngModelChange)="roleService.setSearchTerm($event)"
          placeholder="Buscar por nombre..."
          class="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
        />
      </div>
      <button
        routerLink="/roles/nuevo"
        class="bg-[#0055FF] hover:bg-[#0044DD] text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
        Nuevo rol
      </button>
    </div>

    <div class="fm-card overflow-hidden">
      @if (roleService.loading()) {
        <div class="flex items-center justify-center py-16">
          <svg class="animate-spin h-8 w-8 text-[#0055FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="fm-table">
            <thead>
              <tr class="bg-gray-50/60">
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Permisos</th>
                <th class="text-right !pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (role of paginatedRoles(); track role.id) {
                <tr>
                  <td>
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                        {{ role.name.charAt(0) }}
                      </div>
                      <span class="font-semibold text-[#071938] text-sm">{{ role.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="text-sm text-gray-600">{{ role.description || '—' }}</span>
                  </td>
                  <td>
                    <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                      {{ role.permissionCount }} permisos
                    </span>
                  </td>
                  <td class="text-right !pr-6">
                    <div class="relative inline-block">
                      <button
                        (click)="toggleMenu(role.id)"
                        class="kebab-btn"
                        title="Acciones"
                      >⋮</button>
                      @if (openMenuId() === role.id) {
                        <div class="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-50">
                          <button
                            (click)="editRole(role.id)"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            Editar
                          </button>
                          <button
                            (click)="deleteRole(role)"
                            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            Eliminar
                          </button>
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="py-16 text-center">
                    <div class="flex flex-col items-center gap-2">
                      <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      <p class="text-sm font-semibold text-[#071938]">No se encontraron roles</p>
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
export class RoleListComponent {
  roleService = inject(RoleService);
  private router = inject(Router);

  currentPage = signal(1);
  pageSize = 5;
  openMenuId = signal<number | null>(null);

  constructor() {
    this.roleService.loadRoles();
  }

  filteredList = computed(() => this.roleService.filteredRoles());
  totalPages = computed(() => Math.ceil(this.filteredList().length / this.pageSize) || 1);

  paginatedRoles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredList().slice(start, start + this.pageSize);
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

  toggleMenu(id: number) {
    this.openMenuId.update(current => current === id ? null : id);
  }

  editRole(id: number) {
    this.openMenuId.set(null);
    this.router.navigate(['/roles', id]);
  }

  deleteRole(role: { id: number; name: string }) {
    this.openMenuId.set(null);
    if (!confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) return;
    this.roleService.delete(role.id).subscribe({
      next: () => this.roleService.loadRoles(),
    });
  }
}
