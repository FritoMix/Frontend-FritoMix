import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ClientService } from '../../core/services/client.service';
import { ProductService } from '../../core/services/product.service';
import { OrderStatus } from '../../core/models/order.model';
import { Client } from '../../core/models/client.model';
import { Product } from '../../core/models/product.model';
import { ToastService } from '../../core/services/toast.service';
import { forkJoin } from 'rxjs';
import { CategoryGroupDTO, CategoryDTO } from '../../core/models/product.model';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'order-form.component.html'
})
export class OrderFormComponent implements OnInit {
  authService = inject(AuthService);
  orderService = inject(OrderService);
  clientService = inject(ClientService);
  productService = inject(ProductService);
  toastService = inject(ToastService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  saving = false;
  editId: number | null = null;
  selectedClientId: number | null = null;
  selectedCity = '';
  orderNumber = '';
  loadingNumber = signal(false);
  status: OrderStatus = 'PENDIENTE';
  notes = '';

  clientQuery = signal('');
  clientDropdownOpen = false;

  items = signal<{ productId: number | null; quantity: number }[]>([]);

  groups = signal<CategoryGroupDTO[]>([]);
  selectedGroup = signal<CategoryGroupDTO | null>(null);
  selectedSubcategory = signal<CategoryDTO | null>(null);

  productsBySubcategory = computed(() => {
    const sub = this.selectedSubcategory();
    if (!sub) return [];
    return this.productService.items().filter(p => p.categoryId === sub.id && p.active !== false);
  });

  get subcategories(): CategoryDTO[] {
    return this.selectedGroup()?.children ?? [];
  }

  get hasSubcategories(): boolean {
    return (this.selectedGroup()?.children.length ?? 0) > 0;
  }

  get groupName(): string {
    return this.selectedSubcategory()?.name ?? this.selectedGroup()?.name ?? '';
  }

  productCount(categoryId: number): number {
    return this.productService.items().filter(p => p.categoryId === categoryId && p.active !== false).length;
  }

  groupProductCount(group: CategoryGroupDTO): number {
    let total = 0;
    if (group.children?.length) {
      total += group.children.reduce((acc, c) => acc + this.productCount(c.id), 0);
    } else {
      total += this.productCount(group.id);
    }
    return total;
  }

  initials(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  groupIcon(name: string): string {
    const map: Record<string, string> = {
      'bebidas': '🥤',
      'extruido': '🥨',
      'galletas': '🍪',
      'papa': '🍟',
      'platano': '🍌',
      'panadería': '🥖',
      'panaderia': '🥖',
      'pelet': '🌾',
      'dulces': '🍬',
    };
    const key = (name || '').toLowerCase();
    return map[key] ?? '📦';
  }

  groupGradient(name: string): string {
    const map: Record<string, string> = {
      'bebidas': 'linear-gradient(135deg, #1f2937, #030712)',
      'panadería': 'linear-gradient(135deg, #dc2626, #991b1b)',
      'panaderia': 'linear-gradient(135deg, #dc2626, #991b1b)',
      'pelet': 'linear-gradient(135deg, #ea580c, #c2410c)',
      'galletas': 'linear-gradient(135deg, #fef3c7, #fde68a)',
      'papa': 'linear-gradient(135deg, #fdf6ec, #f5d9b8)',
      'platano': 'linear-gradient(135deg, #16a34a, #047857)',
      'extruido': 'linear-gradient(135deg, #fde047, #f59e0b)',
    };
    const key = (name || '').toLowerCase();
    return map[key] ?? 'linear-gradient(135deg, #0055FF, #0044DD)';
  }

  groupTextColor(name: string): string {
    const light = ['galletas', 'papa', 'extruido'];
    const key = (name || '').toLowerCase();
    return light.includes(key) ? '#7c4a12' : '#ffffff';
  }

  groupBadge(name: string): string {
    const map: Record<string, string> = {
      'bebidas': 'bg-gray-900 text-white',
      'panadería': 'bg-red-600 text-white',
      'panaderia': 'bg-red-600 text-white',
      'pelet': 'bg-orange-500 text-white',
      'galletas': 'bg-yellow-200 text-amber-800',
      'papa': 'bg-orange-100 text-amber-800',
      'platano': 'bg-green-600 text-white',
      'extruido': 'bg-yellow-400 text-yellow-900',
    };
    const key = (name || '').toLowerCase();
    return map[key] ?? 'bg-blue-50 text-[#0055FF]';
  }

  filteredClients = computed(() => {
    const term = this.clientQuery().toLowerCase().trim();
    if (!term) return this.clientService.items();
    return this.clientService.items().filter(c =>
      c.businessName?.toLowerCase().includes(term) ||
      c.code?.toLowerCase().includes(term) ||
      c.document?.toLowerCase().includes(term) ||
      c.cityName?.toLowerCase().includes(term)
    );
  });

  get isEdit(): boolean { return this.editId !== null; }

  onClientSearch(event: Event) {
    this.clientQuery.set((event.target as HTMLInputElement).value);
    this.clientDropdownOpen = true;
  }

  selectClient(c: Client) {
    this.selectedClientId = c.id;
    this.clientQuery.set(c.businessName);
    this.selectedCity = c.cityName;
    this.clientDropdownOpen = false;
  }

  closeClientDropdown() {
    setTimeout(() => { this.clientDropdownOpen = false; }, 150);
  }

  ngOnInit() {
    forkJoin([
      this.clientService.getDepartments(),
    ]).subscribe();
    this.clientService.loadAll();
    this.productService.loadAll();
    this.productService.getCategories().subscribe(groups => this.groups.set(groups));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = Number(idParam);
      this.orderService.findById(this.editId).subscribe(resp => {
        this.selectedClientId = resp.customerId;
        this.clientQuery.set(resp.customerName || '');
        const client = this.clientService.items().find(c => c.id === resp.customerId);
        this.selectedCity = client?.cityName || '';
        this.orderNumber = resp.orderNumber;
        this.status = resp.status as OrderStatus;
        this.notes = resp.notes || '';
        this.items.set(resp.details.map(d => ({
          productId: d.productId,
          quantity: d.quantity,
        })));
      });
    } else {
      this.loadingNumber.set(true);
      this.orderService.getNextOrderNumber().subscribe({
        next: (num) => {
          this.orderNumber = num;
          this.loadingNumber.set(false);
        },
        error: () => this.loadingNumber.set(false),
      });
    }
  }

  removeItem(index: number) {
    this.items.update(list => list.filter((_, i) => i !== index));
  }

  updateItem(index: number) {
    this.items.update(list => list.map((it, i) => (i === index ? { ...it } : it)));
  }

  selectGroup(group: CategoryGroupDTO) {
    this.selectedGroup.set(group);
    this.selectedSubcategory.set(null);
    if ((group.children?.length ?? 0) === 0) {
      this.selectedSubcategory.set({
        id: group.id,
        name: group.name,
        description: group.description,
        parentId: null,
      });
    }
  }

  selectSubcategory(sub: CategoryDTO) {
    this.selectedSubcategory.set(sub);
  }

  backToGroups() {
    this.selectedGroup.set(null);
    this.selectedSubcategory.set(null);
  }

  backToSubcategories() {
    this.selectedSubcategory.set(null);
  }

  productName(productId: number | null): string {
    const p = this.productService.items().find(x => x.id === productId);
    return p ? `${p.name} (${p.code})` : '';
  }

  addProductToOrder(product: Product) {
    this.items.update(list => {
      const existing = list.find(i => i.productId === product.id);
      if (existing) {
        return list.map(i =>
          i.productId === product.id ? { ...i, quantity: (i.quantity || 0) + 1 } : i
        );
      }
      return [...list, { productId: product.id, quantity: 1 }];
    });
  }

  badgeClass(status: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'APROBADO': 'bg-green-50 text-green-700 border-green-200',
      'CANCELADO': 'bg-red-50 text-red-600 border-red-200',
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  onSave() {
    if (this.saving || !this.selectedClientId || !this.orderNumber) return;
    this.saving = true;

    const details = this.items()
      .filter(i => i.productId)
      .map(i => ({
        productId: Number(i.productId),
        quantity: Number(i.quantity),
      }));

    if (details.length === 0) {
      this.saving = false;
      return;
    }

    const payload = {
      customerId: Number(this.selectedClientId),
      userId: Number(this.authService.currentUser()?.id) || 1,
      orderNumber: this.orderNumber,
      status: this.status,
      notes: this.notes,
      details,
    };

    const request = this.isEdit
      ? this.orderService.update(this.editId!, payload)
      : this.orderService.create(payload);

    request.subscribe({
      next: () => {
        this.orderService.loadAll();
        this.saving = false;
        this.toastService.success(this.isEdit ? 'Pedido actualizado exitosamente.' : 'Pedido creado exitosamente.');
        this.router.navigate(['/pedidos']);
      },
      error: (err) => {
        this.saving = false;
        const msg = err.error?.error || err.error?.message || err.message || 'Error al guardar el pedido.';
        this.toastService.error(msg);
      },
    });
  }
}