import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ClientService } from '../../core/services/client.service';
import { ProductService } from '../../core/services/product.service';
import { OrderStatus } from '../../core/models/order.model';
import { Client } from '../../core/models/client.model';
import { Product, CategoryGroupDTO, CategoryDTO } from '../../core/models/product.model';
import { ToastService } from '../../core/services/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
  showPreview = false;

  clientQuery = signal('');
  clientDropdownOpen = false;

  productSearchQuery = signal('');

  items = signal<{ productId: number | null; quantity: number }[]>([]);

  groups = signal<CategoryGroupDTO[]>([]);
  selectedGroup = signal<CategoryGroupDTO | null>(null);
  selectedSubcategory = signal<CategoryDTO | null>(null);

  selectedClient = computed(() => {
    const id = this.selectedClientId;
    if (!id) return null;
    return this.clientService.items().find(c => c.id === id) || null;
  });

  // Returns filtered products based on subcategory, category group, or global search
  displayedProducts = computed(() => {
    const query = this.productSearchQuery().toLowerCase().trim();
    const all = this.productService.items().filter(p => p.active !== false);

    if (query) {
      return all.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    const sub = this.selectedSubcategory();
    if (sub) {
      return all.filter(p => p.categoryId === sub.id);
    }

    const group = this.selectedGroup();
    if (group) {
      if ((group.children?.length ?? 0) === 0) {
        return all.filter(p => p.categoryId === group.id);
      }
    }

    return [];
  });

  totalWeight = computed(() => {
    const items = this.items();
    const products = this.productService.items();
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.pesoUnidad ?? 0) * item.quantity;
    }, 0);
  });

  totalDimension = computed(() => {
    const items = this.items();
    const products = this.productService.items();
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.dimension ?? 0) * item.quantity;
    }, 0);
  });

  totalItemsCount = computed(() => {
    return this.items().reduce((total, item) => total + (item.quantity || 0), 0);
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
    const norm = (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const map: Record<string, string> = {
      'bebidas': '🥤',
      'extruido': '🥨',
      'galletas': '🍪',
      'papa': '🍟',
      'platano': '🍌',
      'panaderia': '🥖',
      'pelet': '🌾',
      'dulces': '🍬',
      'mani': '🥜',
      'frutos secos': '🥜',
      'snacks': '🍿',
    };
    return map[norm] ?? '📦';
  }

  groupColor(name: string): string {
    const norm = (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const map: Record<string, string> = {
      'bebidas': '#0284C7',
      'panaderia': '#EF4444',
      'pelet': '#F97316',
      'galletas': '#D97706',
      'papa': '#EAB308',
      'platano': '#10B981',
      'extruido': '#A855F7',
      'dulces': '#EC4899',
      'mani': '#B45309',
      'frutos secos': '#B45309',
    };
    return map[norm] ?? '#0055FF';
  }

  groupGradient(name: string): string {
    const norm = (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const map: Record<string, string> = {
      'bebidas': 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
      'panaderia': 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
      'pelet': 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
      'galletas': 'linear-gradient(135deg, #D97706 0%, #78350F 100%)',
      'papa': 'linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)',
      'platano': 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      'extruido': 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
      'dulces': 'linear-gradient(135deg, #EC4899 0%, #9D174D 100%)',
      'mani': 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
      'frutos secos': 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
    };
    return map[norm] ?? 'linear-gradient(135deg, #0055FF 0%, #0033AA 100%)';
  }

  groupShadow(name: string): string {
    const norm = (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const map: Record<string, string> = {
      'bebidas': 'rgba(2, 132, 199, 0.3)',
      'panaderia': 'rgba(239, 68, 68, 0.3)',
      'pelet': 'rgba(249, 115, 22, 0.3)',
      'galletas': 'rgba(217, 119, 6, 0.3)',
      'papa': 'rgba(234, 179, 8, 0.35)',
      'platano': 'rgba(16, 185, 129, 0.3)',
      'extruido': 'rgba(168, 85, 247, 0.3)',
      'dulces': 'rgba(236, 72, 153, 0.3)',
      'mani': 'rgba(180, 83, 9, 0.3)',
    };
    return map[norm] ?? 'rgba(0, 85, 255, 0.25)';
  }

  productGroupColor(product: Product): string {
    if (this.selectedGroup()) {
      return this.groupColor(this.selectedGroup()!.name);
    }
    const group = this.groups().find(g =>
      g.id === product.categoryId || g.children?.some(c => c.id === product.categoryId)
    );
    return this.groupColor(group?.name || product.categoryName || '');
  }

  productGradient(product: Product): string {
    if (this.selectedGroup()) {
      return this.groupGradient(this.selectedGroup()!.name);
    }
    const group = this.groups().find(g =>
      g.id === product.categoryId || g.children?.some(c => c.id === product.categoryId)
    );
    return this.groupGradient(group?.name || product.categoryName || '');
  }

  productShadow(product: Product): string {
    if (this.selectedGroup()) {
      return this.groupShadow(this.selectedGroup()!.name);
    }
    const group = this.groups().find(g =>
      g.id === product.categoryId || g.children?.some(c => c.id === product.categoryId)
    );
    return this.groupShadow(group?.name || product.categoryName || '');
  }

  productCategoryIcon(product: Product): string {
    const group = this.groups().find(g =>
      g.id === product.categoryId || g.children?.some(c => c.id === product.categoryId)
    );
    return this.groupIcon(group?.name || product.categoryName || '');
  }

  productCategoryImage(product: Product): string | null {
    const group = this.groups().find(g =>
      g.id === product.categoryId || g.children?.some(c => c.id === product.categoryId)
    );
    if (group?.image) return group.image;
    const child = group?.children?.find(c => c.id === product.categoryId);
    if (child?.image) return child.image;
    return null;
  }

  previewProduct = signal<{
    image: string | null;
    icon: string;
    name: string;
    code: string;
    category: string;
    color: string;
  } | null>(null);

  showImagePreview(product: Product, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.previewProduct.set({
      image: this.productCategoryImage(product),
      icon: this.productCategoryIcon(product),
      name: product.name,
      code: product.code,
      category: product.categoryName || this.selectedGroup()?.name || 'Categoría',
      color: this.productGroupColor(product)
    });
  }

  hideImagePreview() {
    this.previewProduct.set(null);
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

  clearSelectedClient() {
    this.selectedClientId = null;
    this.clientQuery.set('');
    this.selectedCity = '';
    this.clientDropdownOpen = false;
  }

  closeClientDropdown() {
    setTimeout(() => { this.clientDropdownOpen = false; }, 200);
  }

  onProductSearch(event: Event) {
    this.productSearchQuery.set((event.target as HTMLInputElement).value);
  }

  clearProductSearch() {
    this.productSearchQuery.set('');
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

  getItemQuantity(productId: number | null): number {
    if (!productId) return 0;
    const it = this.items().find(i => i.productId === productId);
    return it ? it.quantity : 0;
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

  decrementProduct(productId: number | null, event?: Event) {
    if (event) event.stopPropagation();
    if (!productId) return;
    this.items.update(list => {
      const existing = list.find(i => i.productId === productId);
      if (!existing) return list;
      if (existing.quantity <= 1) {
        return list.filter(i => i.productId !== productId);
      }
      return list.map(i =>
        i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  }

  updateItemQuantity(index: number, newQty: number) {
    const val = Math.max(0, Math.floor(newQty || 0));
    this.items.update(list => {
      if (val === 0) {
        return list.filter((_, i) => i !== index);
      }
      return list.map((it, i) => i === index ? { ...it, quantity: val } : it);
    });
  }

  removeItem(index: number) {
    this.items.update(list => list.filter((_, i) => i !== index));
  }

  clearAllItems() {
    this.items.set([]);
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

  getProduct(productId: number | null): Product | undefined {
    return this.productService.items().find(x => x.id === productId);
  }

  productName(productId: number | null): string {
    const p = this.getProduct(productId);
    return p ? p.name : '';
  }

  productCode(productId: number | null): string {
    const p = this.getProduct(productId);
    return p ? p.code : '';
  }

  badgeClass(status: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'bg-amber-50 text-amber-700 border-amber-200',
      'APROBADO': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'CANCELADO': 'bg-rose-50 text-rose-600 border-rose-200',
      'EN_PRODUCCION': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'LISTO_PRODUCCION': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  onSave() {
    if (this.saving || !this.selectedClientId || !this.orderNumber) {
      if (!this.selectedClientId) {
        this.toastService.error('Por favor selecciona un cliente');
      }
      return;
    }

    const details = this.items().filter(i => i.productId && i.quantity > 0);
    if (details.length === 0) {
      this.toastService.error('Agrega al menos un producto al pedido');
      return;
    }

    this.showPreview = true;
  }

  confirmSave() {
    if (this.saving || !this.selectedClientId || !this.orderNumber) return;
    this.saving = true;

    const details = this.items()
      .filter(i => i.productId && i.quantity > 0)
      .map(i => ({
        productId: Number(i.productId),
        quantity: Number(i.quantity),
      }));

    if (details.length === 0) {
      this.saving = false;
      this.showPreview = false;
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
        this.showPreview = false;
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

  cancelPreview() {
    if (this.saving) return;
    this.showPreview = false;
  }

  get previewClientName(): string {
    const c = this.clientService.items().find(x => x.id === this.selectedClientId);
    return c?.businessName ?? '';
  }

  scrollToOrderTray() {
    const el = document.getElementById('order-tray-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
