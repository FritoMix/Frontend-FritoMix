import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryDTO } from '../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  productService = inject(ProductService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isSubmitting = false;
  isEdit = false;
  editId: number | null = null;

  categories = signal<CategoryDTO[]>([]);

  form = {
    code: '',
    name: '',
    presentation: 0,
    unit: 'BULTO',
    weight: '',
    weightGrams: 0,
    categoryId: null as number | null,
    active: true,
  };

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: (res) => this.categories.set(res),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      this.productService.findById(this.editId).subscribe({
        next: (res) => {
          this.form.code = res.code;
          this.form.name = res.name;
          this.form.presentation = res.presentation;
          this.form.unit = res.unit;
          this.form.weight = res.weight || '';
          this.form.weightGrams = res.weightGrams;
          this.form.categoryId = res.categoryId;
          this.form.active = res.active;
        },
      });
    }
  }

  esValido(): boolean {
    return (
      this.form.code.trim().length > 0 &&
      this.form.name.trim().length > 0 &&
      this.form.categoryId !== null
    );
  }

  onSave() {
    if (!this.esValido() || this.isSubmitting) return;
    this.isSubmitting = true;

    const data = {
      code: this.form.code.trim(),
      name: this.form.name.trim(),
      unit: this.form.unit,
      categoryId: this.form.categoryId!,
      presentation: this.form.presentation || 0,
      weight: this.form.weight.trim() || undefined,
      weightGrams: this.form.weightGrams || 0,
      active: this.form.active,
    };

    const request$ = this.isEdit
      ? this.productService.update(this.editId!, data)
      : this.productService.create(data);

    request$.subscribe({
      next: () => {
        this.productService.loadProducts();
        this.isSubmitting = false;
        this.router.navigate(['/productos']);
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }
}
