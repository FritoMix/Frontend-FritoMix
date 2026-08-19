import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RoleService } from '../../core/services/role.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, SearchInputComponent, PaginationComponent],
  templateUrl: 'role-list.component.html'
})
export class RoleListComponent {
  roleService = inject(RoleService);
  private router = inject(Router);

  currentPage = signal(1);
  openMenuId = signal<number | null>(null);

  constructor() {
    this.roleService.pageSize.set(5);
    this.roleService.load();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.roleService.setPage(page - 1);
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.roleService.setSearchTerm(value);
  }

  paginatedRoles = computed(() => this.roleService.items());
  totalPages = computed(() => this.roleService.totalPages() || 1);


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
      next: () => this.roleService.load(),
    });
  }
}
