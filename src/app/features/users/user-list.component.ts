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
  templateUrl: 'user-list.component.html'
})
export class UserListComponent {
  userService = inject(UserService);
  private router = inject(Router);

  currentPage = signal(1);
  openMenuId = signal<number | null>(null);

  constructor() {
    this.userService.pageSize.set(5);
    this.userService.load();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.userService.setPage(page - 1);
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.userService.setSearchTerm(value);
  }

  paginatedUsers = computed(() => this.userService.items());
  totalPages = computed(() => this.userService.totalPages() || 1);


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
        this.userService.load();
      },
    });
  }

  deleteUser(id: number) {
    this.closeMenu();
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    this.userService.delete(id).subscribe({
      next: () => {
        this.userService.load();
      },
    });
  }

  roleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      admin: 'Administrador',
      cartera: 'Cartera',
      coordinador: 'Coordinador',
      despachador: 'Despachador',
      produccion: 'Producción',
      camara: 'Cámara',
      facturacion: 'Facturación',
      despachador1: 'Despachador 1',
      despachador2: 'Despachador 2',
      despachador3: 'Despachador 3',
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: UserRole): string {
    const classes: Record<UserRole, string> = {
      admin: 'bg-red-50 text-red-700 border-red-200',
      cartera: 'bg-purple-50 text-purple-700 border-purple-200',
      coordinador: 'bg-amber-50 text-amber-700 border-amber-200',
      despachador: 'bg-rose-50 text-rose-700 border-rose-200',
      produccion: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      camara: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      facturacion: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      despachador1: 'bg-rose-50 text-rose-700 border-rose-200',
      despachador2: 'bg-pink-50 text-pink-700 border-pink-200',
      despachador3: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return classes[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
