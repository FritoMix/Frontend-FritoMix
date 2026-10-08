import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { UserRole } from '../../core/models/user.model';
import { roleLabel as roleLabelShared, roleBadgeClass as roleBadgeClassShared } from '../../core/models/role-theme';

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
    return roleLabelShared(role);
  }

  getRoleBadgeClass(role: UserRole): string {
    return roleBadgeClassShared(role);
  }
}
