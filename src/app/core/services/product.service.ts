import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  products = signal<Product[]>([
    {
      id: '1',
      code: 'PR-101',
      description: 'TRADICIONAL SURT MIX X 250 UND',
      presentation: 12,
      unit: 'UND',
      weight: '250g',
      weightGrams: 250,
      category: 'Tradicional',
      price: 12500,
      stock: 1250,
      minStock: 100,
      active: true,
      codeColorBg: 'bg-blue-100',
      codeColorText: 'text-blue-700'
    },
    {
      id: '2',
      code: 'PR-102',
      description: 'LENTEJA CRIOLLA 500 G Bx24',
      presentation: 24,
      unit: 'UND',
      weight: '500g',
      weightGrams: 500,
      category: 'Granos & Snacks',
      price: 8500,
      stock: 980,
      minStock: 150,
      active: true,
      codeColorBg: 'bg-amber-100',
      codeColorText: 'text-amber-700'
    },
    {
      id: '3',
      code: 'PR-103',
      description: 'ALMENDRA HOLLADA 250 G Bx30',
      presentation: 30,
      unit: 'UND',
      weight: '250g',
      weightGrams: 250,
      category: 'Frutos Secos',
      price: 14000,
      stock: 560,
      minStock: 80,
      active: true,
      codeColorBg: 'bg-emerald-100',
      codeColorText: 'text-emerald-700'
    },
    {
      id: '4',
      code: 'PR-104',
      description: 'MAÍZ PIRA TOSTADO 250 G Bx40',
      presentation: 40,
      unit: 'UND',
      weight: '250g',
      weightGrams: 250,
      category: 'Maíz',
      price: 6500,
      stock: 720,
      minStock: 100,
      active: true,
      codeColorBg: 'bg-purple-100',
      codeColorText: 'text-purple-700'
    },
    {
      id: '5',
      code: 'PR-105',
      description: 'MANÍ SALADO JUMBO 150 G Bx50',
      presentation: 50,
      unit: 'UND',
      weight: '150g',
      weightGrams: 150,
      category: 'Maní',
      price: 4500,
      stock: 860,
      minStock: 100,
      active: true,
      codeColorBg: 'bg-orange-100',
      codeColorText: 'text-orange-700'
    },
    {
      id: '6',
      code: 'PR-106',
      description: 'NACHO PICANTE 200G X30 UND',
      presentation: 30,
      unit: 'UND',
      weight: '200g',
      weightGrams: 200,
      category: 'Nachos & Totopos',
      price: 9500,
      stock: 860,
      minStock: 100,
      active: true,
      codeColorBg: 'bg-red-100',
      codeColorText: 'text-red-700'
    }
  ]);

  searchTerm = signal<string>('');

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.products();
    return this.products().filter(p =>
      p.description.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  });

  addProduct(newProduct: Omit<Product, 'id'>) {
    const id = (this.products().length + 1).toString();
    this.products.update(list => [{ ...newProduct, id }, ...list]);
  }
}
