import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { PageHeaderComponent } from '../../shared/components/page-header';
import { SearchInputComponent } from '../../shared/components/search-input';
import { PaginationComponent } from '../../shared/components/pagination';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, SearchInputComponent, PaginationComponent],
  template: `
<app-page-header badge="3." color="amber" title="Productos"></app-page-header>

    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
      <app-search-input
        (valueChange)="productService.setSearchTerm($event)"
        placeholder="Buscar por código, descripción o categoría..."
      ></app-search-input>
      <button
        routerLink="/productos/nuevo"
        class="bg-[#0055FF] hover:bg-[#0044DD] text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
        Nuevo producto
      </button>
    </div>

    <div class="fm-card overflow-hidden">
      @if (productService.loading()) {
        <div class="flex items-center justify-center py-16">
          <span class="text-gray-500 text-sm">Cargando productos...</span>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="fm-table">
            <thead>
              <tr class="bg-gray-50/60">
                <th class="!pl-6">Código</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Presentación</th>
                <th>Estado</th>
                <th class="text-right !pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (p of paginatedProducts(); track p.id) {
                <tr>
                  <td class="!pl-6">
                    <span class="font-mono text-sm font-semibold text-[#071938]">{{ p.code }}</span>
                  </td>
                  <td>
                    <span class="font-semibold text-[#071938]">{{ p.name }}</span>
                  </td>
                  <td>
                    <span class="status-badge" [class]="categoryBadgeClass(p.categoryName)">{{ p.categoryName }}</span>
                  </td>
                  <td>
                    <span class="text-gray-600 text-sm">{{ p.presentation }} {{ p.unit }}</span>
                  </td>
                  <td>
                    @if (p.active) {
                      <span class="status-badge bg-green-50 text-green-700 border-green-200">Activo</span>
                    } @else {
                      <span class="status-badge bg-red-50 text-red-600 border-red-200">Inactivo</span>
                    }
                  </td>
                  <td class="text-right !pr-6">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        (click)="editProduct(p.id)"
                        class="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-[#0055FF] transition-colors"
                        title="Editar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button
                        (click)="deleteProduct(p.id)"
                        class="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-16 text-center">
                    <div class="flex flex-col items-center gap-2">
                      <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                      <p class="text-sm font-semibold text-[#071938]">No se encontraron productos</p>
                      <p class="text-xs text-gray-500">Intenta con otro término de búsqueda</p>
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
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);
  router = inject(Router);

  currentPage = signal(1);
  pageSize = 5;

  filteredList = computed(() => this.productService.filteredProducts());
  totalPages = computed(() => Math.ceil(this.filteredList().length / this.pageSize) || 1);

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredList().slice(start, start + this.pageSize);
  });


  ngOnInit() {
    this.productService.loadProducts();
  }

  onSearchChange(value: string) {
    this.currentPage.set(1);
    this.productService.setSearchTerm(value);
  }

  editProduct(id: number) {
    this.router.navigate(['/productos', id]);
  }

  deleteProduct(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productService.delete(id).subscribe({
        next: () => this.productService.loadProducts(),
      });
    }
  }

  categoryBadgeClass(category: string): string {
    const map: Record<string, string> = {
      'Tradicional': 'bg-blue-50 text-blue-700 border-blue-200',
      'Granos & Snacks': 'bg-amber-50 text-amber-700 border-amber-200',
      'Frutos Secos': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Maíz': 'bg-purple-50 text-purple-700 border-purple-200',
      'Maní': 'bg-orange-50 text-orange-700 border-orange-200',
      'Nachos & Totopos': 'bg-red-50 text-red-700 border-red-200',
      'Dulces': 'bg-pink-50 text-pink-700 border-pink-200',
      'Otros': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return map[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
