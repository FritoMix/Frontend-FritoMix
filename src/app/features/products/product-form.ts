import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <nav class="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
            <a [routerLink]="['/dashboard']" class="hover:text-[#0055FF] transition-colors">Dashboard</a>
            <span>/</span>
            <a [routerLink]="['/productos']" class="hover:text-[#0055FF] transition-colors">Productos</a>
            <span>/</span>
            <span class="text-gray-700 font-medium">Nuevo producto</span>
          </nav>
          <h1 class="text-2xl font-extrabold text-[#071938]">Nuevo producto</h1>
          <p class="text-sm text-gray-500 mt-0.5">Completa la información para registrar un producto en el sistema</p>
        </div>
        <button
          [routerLink]="['/productos']"
          class="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#071938] border border-gray-200 hover:border-gray-300 bg-white px-4 py-2.5 rounded-lg transition-colors"
        >
          <span>←</span>
          Volver
        </button>
      </div>

      <!-- Sección: Información básica -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <div class="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
          <span class="w-7 h-7 rounded-lg bg-[#0055FF] text-white flex items-center justify-center text-xs font-bold">1</span>
          <h3 class="font-bold text-gray-800">Información básica</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Código <span class="text-red-500">*</span></label>
            <input
              type="text"
              [(ngModel)]="form.code"
              placeholder="Ej: PR-200"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div class="md:col-span-2 lg:col-span-2">
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Descripción <span class="text-red-500">*</span></label>
            <input
              type="text"
              [(ngModel)]="form.description"
              placeholder="Ej: MANÍ SALADO JUMBO 150 G Bx50"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Presentación (cantidad por caja)</label>
            <input
              type="number"
              [(ngModel)]="form.presentation"
              placeholder="Ej: 24"
              min="0"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Unidad</label>
            <select
              [(ngModel)]="form.unit"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
            >
              <option value="UND">UND (Unidades)</option>
              <option value="KG">KG (Kilogramos)</option>
              <option value="L">L (Litros)</option>
              <option value="M">M (Metros)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Categoría <span class="text-red-500">*</span></label>
            <select
              [(ngModel)]="form.category"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
            >
              <option value="">Seleccionar categoría</option>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Peso (etiqueta)</label>
            <input
              type="text"
              [(ngModel)]="form.weight"
              placeholder="Ej: 250g"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Peso en gramos</label>
            <input
              type="number"
              [(ngModel)]="form.weightGrams"
              placeholder="Ej: 250"
              min="0"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
        </div>
      </div>

      <!-- Sección: Precio e Inventario -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <div class="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
          <span class="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">2</span>
          <h3 class="font-bold text-gray-800">Precio e Inventario</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Precio venta ($) <span class="text-red-500">*</span></label>
            <input
              type="number"
              [(ngModel)]="form.price"
              placeholder="Ej: 12500"
              min="0"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Costo ($)</label>
            <input
              type="number"
              [(ngModel)]="form.cost"
              placeholder="Ej: 9000"
              min="0"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div class="hidden lg:block"></div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Stock actual</label>
            <input
              type="number"
              [(ngModel)]="form.stock"
              placeholder="Ej: 0"
              min="0"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Stock mínimo</label>
            <input
              type="number"
              [(ngModel)]="form.minStock"
              placeholder="Ej: 100"
              min="0"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div class="flex items-end">
            <label class="inline-flex items-center gap-2.5 cursor-pointer select-none p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 w-full">
              <input
                type="checkbox"
                [(ngModel)]="form.active"
                class="w-4 h-4 text-[#0055FF] border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span class="text-xs font-semibold text-gray-700 block">Producto activo</span>
                <span class="text-[11px] text-gray-500">Podrá ser usado en pedidos</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        <button
          type="button"
          (click)="cancelar()"
          class="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          (click)="guardar()"
          [disabled]="!esValido()"
          class="bg-[#0055FF] hover:bg-[#0044DD] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
        >
          <span>💾</span>
          Guardar producto
        </button>
      </div>
    </div>
  `
})
export class ProductFormComponent {
  productService = inject(ProductService);
  router = inject(Router);

  categories = [
    'Tradicional',
    'Granos & Snacks',
    'Frutos Secos',
    'Maíz',
    'Maní',
    'Nachos & Totopos',
    'Dulces',
    'Otros'
  ];

  form = {
    code: '',
    description: '',
    presentation: 0,
    unit: 'UND',
    weight: '',
    weightGrams: 0,
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    active: true
  };

  esValido(): boolean {
    return (
      this.form.code.trim().length > 0 &&
      this.form.description.trim().length > 0 &&
      this.form.category.trim().length > 0 &&
      this.form.price > 0
    );
  }

  cancelar() {
    this.router.navigate(['/productos']);
  }

  guardar() {
    if (!this.esValido()) return;

    const { codeColorBg, codeColorText } = this.categoryColors(this.form.category);

    this.productService.addProduct({
      code: this.form.code.trim(),
      description: this.form.description.trim(),
      presentation: this.form.presentation || 0,
      unit: this.form.unit,
      weight: this.form.weight.trim(),
      weightGrams: this.form.weightGrams || 0,
      category: this.form.category,
      price: this.form.price || 0,
      cost: this.form.cost || 0,
      stock: this.form.stock || 0,
      minStock: this.form.minStock || 0,
      active: this.form.active,
      codeColorBg,
      codeColorText
    });

    this.router.navigate(['/productos']);
  }

  categoryColors(category: string): { codeColorBg: string; codeColorText: string } {
    const map: Record<string, { codeColorBg: string; codeColorText: string }> = {
      'Tradicional': { codeColorBg: 'bg-blue-100', codeColorText: 'text-blue-700' },
      'Granos & Snacks': { codeColorBg: 'bg-amber-100', codeColorText: 'text-amber-700' },
      'Frutos Secos': { codeColorBg: 'bg-emerald-100', codeColorText: 'text-emerald-700' },
      'Maíz': { codeColorBg: 'bg-purple-100', codeColorText: 'text-purple-700' },
      'Maní': { codeColorBg: 'bg-orange-100', codeColorText: 'text-orange-700' },
      'Nachos & Totopos': { codeColorBg: 'bg-red-100', codeColorText: 'text-red-700' },
      'Dulces': { codeColorBg: 'bg-pink-100', codeColorText: 'text-pink-700' },
      'Otros': { codeColorBg: 'bg-gray-100', codeColorText: 'text-gray-700' }
    };
    return map[category] || { codeColorBg: 'bg-gray-100', codeColorText: 'text-gray-700' };
  }
}
