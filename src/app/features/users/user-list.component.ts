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
