import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, SearchInputComponent, PaginationComponent],
  templateUrl: 'product-list.component.html'
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);
  router = inject(Router);

  currentPage = signal(1);
  pageSize = 10;

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
