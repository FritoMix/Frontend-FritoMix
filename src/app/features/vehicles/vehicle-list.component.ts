import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../core/services/vehicle.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, SearchInputComponent, PaginationComponent],
  templateUrl: 'vehicle-list.component.html'
})
export class VehicleListComponent implements OnInit {
  vehicleService = inject(VehicleService);
  router = inject(Router);

  currentPage = signal(1);

  paginatedVehicles = computed(() => this.vehicleService.items());
  totalPages = computed(() => this.vehicleService.totalPages() || 1);

  ngOnInit() {
    this.vehicleService.load();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.vehicleService.setPage(page - 1);
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.vehicleService.setSearchTerm(value);
  }

  editVehicle(id: number) {
    this.router.navigate(['/vehiculos', id]);
  }

  deleteVehicle(id: number) {
    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
      this.vehicleService.delete(id).subscribe({
        next: () => this.vehicleService.load(),
      });
    }
  }
}
