import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, SearchInputComponent, PaginationComponent],
  template: `
<app-page-header badge="12." color="purple" title="Usuarios"></app-page-header>

    <div class="fm-search-row">
      <app-search-input
        (valueChange)="userService.setSearchTerm($event)"
        placeholder="Buscar por nombre, email..."
      ></app-search-input>
      <button
        routerLink="/usuarios/nuevo"
        class="bg-[#0055FF] hover:bg-[#0044DD] text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap justify-center sm:justify-center"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
        Nuevo usuario
      </button>
    </div>

    <div class="fm-card overflow-hidden">
      @if (userService.loading()) {
        <div class="flex items-center justify-center py-16">
          <svg class="animate-spin h-8 w-8 text-[#0055FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        </div>
      } @else {
        <div class="fm-table-wrapper">
          <table class="fm-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (user of paginatedUsers(); track user.id) {
                <tr>
                  <td>
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-[#071938] text-white font-bold text-xs flex items-center justify-center">
                        {{ user.avatarInitials }}
                      </div>
                      <div>
                        <p class="font-semibold text-[#071938] text-sm">{{ user.name }}</p>
                        <p class="text-xs text-gray-500">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="status-badge" [class]="getRoleBadgeClass(user.role)">{{ roleLabel(user.role) }}</span>
                  </td>
                  <td>
                    @if (user.enabled) {
                      <span class="status-badge bg-green-50 text-green-700 border-green-200">Activo</span>
                    } @else {
                      <span class="status-badge bg-red-50 text-red-600 border-red-200">Inactivo</span>
                    }
                  </td>
                  <td>
                    <div class="relative inline-block">
                      <button
                        (click)="toggleMenu(user.id)"
                        class="kebab-btn"
                        title="Acciones"
                      >⋮</button>
                      @if (openMenuId() === user.id) {
                        <div class="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-50">
                          <button
                            (click)="editUser(user.id)"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            Editar
                          </button>
                          <button
                            (click)="toggleUserStatus(user)"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            {{ user.enabled ? 'Desactivar' : 'Activar' }}
                          </button>
                          <button
                            (click)="deleteUser(user.id)"
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
                  <td colspan="4" class="!text-center">
                    <div class="fm-empty">
                      <svg class="fm-empty__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                      <p class="fm-empty__title">No se encontraron usuarios</p>
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
export class UserListComponent {
  userService = inject(UserService);
  private router = inject(Router);

  currentPage = signal(1);
  pageSize = 5;
  openMenuId = signal<number | null>(null);

  constructor() {
    this.userService.loadUsers();
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.userService.setSearchTerm(value);
  }

  filteredList = computed(() => this.userService.filteredUsers());
  totalPages = computed(() => Math.ceil(this.filteredList().length / this.pageSize) || 1);

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredList().slice(start, start + this.pageSize);
  });


  toggleMenu(id: number) {
    this.openMenuId.update(current => current === id ? null : id);
  }

  closeMenu() {
    this.openMenuId.set(null);
  }

  editUser(id: number) {
    this.closeMenu();
    this.router.navigate(['/usuarios', id]);
  }

  toggleUserStatus(user: { id: number; enabled: boolean; name: string }) {
    this.closeMenu();
    const action = user.enabled ? 'desactivar' : 'activar';
    if (!confirm(`¿Estás seguro de ${action} a ${user.name}?`)) return;
    this.userService.toggleStatus(user.id).subscribe({
      next: () => {
        this.userService.loadUsers();
      },
    });
  }

  deleteUser(id: number) {
    this.closeMenu();
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    this.userService.delete(id).subscribe({
      next: () => {
        this.userService.loadUsers();
      },
    });
  }

  roleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      admin: 'Administrador',
      cartera: 'Cartera',
      coordinador: 'Coordinador',
      despachador: 'Despachador',
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: UserRole): string {
    const classes: Record<UserRole, string> = {
      admin: 'bg-red-50 text-red-700 border-red-200',
      cartera: 'bg-purple-50 text-purple-700 border-purple-200',
      coordinador: 'bg-amber-50 text-amber-700 border-amber-200',
      despachador: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return classes[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
