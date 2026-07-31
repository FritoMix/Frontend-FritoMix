import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductResponse, CreateProductRequest, UpdateProductRequest, CategoryDTO, toProductDisplay } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/products`;
  private readonly categoriesUrl = `${environment.apiUrl}/api/v1/categories`;

  private productsSignal = signal<Product[]>([]);
  readonly products = this.productsSignal.asReadonly();
  loading = signal(false);

  searchTerm = signal<string>('');
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  setSearchTerm(value: string) {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this.searchTerm.set(value.toLowerCase().trim());
      this._debounceTimer = null;
    }, 300);
  }

  filteredProducts = computed(() => {
    const term = this.searchTerm();
    if (!term) return this.products();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term) ||
      p.categoryName.toLowerCase().includes(term)
    );
  });

  loadProducts(): void {
    this.loading.set(true);
    this.http.get<ProductResponse[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.productsSignal.set(res.map(toProductDisplay));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  findById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.apiUrl, data);
  }

  update(id: number, data: UpdateProductRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>(this.categoriesUrl);
  }
}
