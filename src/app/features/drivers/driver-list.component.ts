import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DriverService } from '../../core/services/driver.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, SearchInputComponent, PaginationComponent],
  templateUrl: 'driver-list.component.html'
})
export class DriverListComponent implements OnInit {
  driverService = inject(DriverService);
  router = inject(Router);

  currentPage = signal(1);

  paginatedDrivers = computed(() => this.driverService.items());
  totalPages = computed(() => this.driverService.totalPages() || 1);

  ngOnInit() {
    this.driverService.load();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.driverService.setPage(page - 1);
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.driverService.setSearchTerm(value);
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
        next: () => this.driverService.load(),
      });
    }
  }
}
