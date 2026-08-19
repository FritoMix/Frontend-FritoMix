import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductResponse, CreateProductRequest, UpdateProductRequest, CategoryDTO, toProductDisplay } from '../models/product.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class ProductService extends BaseCrudService<ProductResponse, Product, CreateProductRequest, UpdateProductRequest> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/products`;
  private readonly categoriesUrl = `${environment.apiUrl}/api/v1/categories`;

  protected toDisplay(item: ProductResponse): Product {
    return toProductDisplay(item);
  }

  getCategories(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>(this.categoriesUrl);
  }

  override create(data: CreateProductRequest): Observable<ProductResponse> {
    return super.create(data);
  }

  override update(id: number, data: UpdateProductRequest): Observable<ProductResponse> {
    return super.update(id, data);
  }
}