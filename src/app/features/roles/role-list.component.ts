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
  pageSize = 5;
  openMenuId = signal<number | null>(null);

  constructor() {
    this.roleService.loadRoles();
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.roleService.setSearchTerm(value);
  }

  filteredList = computed(() => this.roleService.filteredRoles());
  totalPages = computed(() => Math.ceil(this.filteredList().length / this.pageSize) || 1);

  paginatedRoles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredList().slice(start, start + this.pageSize);
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
