import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, SearchInputComponent, PaginationComponent],
  templateUrl: 'client-list.component.html'
})
export class ClientListComponent implements OnInit {
  clientService = inject(ClientService);
  router = inject(Router);

  currentPage = signal(1);
  pageSize = 10;

  clientsFiltered = computed(() => this.clientService.filteredClients());
  totalPages = computed(() => Math.ceil(this.clientsFiltered().length / this.pageSize) || 1);

  paginatedClients = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.clientsFiltered().slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.clientService.loadClients();
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.clientService.setSearchTerm(value);
  }

  editClient(id: number) {
    this.router.navigate(['/clientes', id]);
  }

  deleteClient(id: number) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.clientService.delete(id).subscribe({
        next: () => this.clientService.loadClients(),
      });
    }
  }
}
