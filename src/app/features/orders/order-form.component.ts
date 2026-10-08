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
import { orderStatusClass } from './order-status';
import { categoryColor, categoryGradient, categoryIcon, categoryShadow } from '../categories/category-theme';
import { categorySubtreeIds, groupOfProductCategory } from '../categories/category-tree';
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
      const subtree = categorySubtreeIds(this.groups(), sub.id);
      return all.filter(p => p.categoryId != null && subtree.has(p.categoryId));
    }

    const group = this.selectedGroup();
    if (group) {
      const subtree = categorySubtreeIds(this.groups(), group.id);
      return all.filter(p => p.categoryId != null && subtree.has(p.categoryId));
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

  /**
   * Counts products in a category and all of its descendants, mirroring the backend
   * `countProductsByCategoryIdRecursive`. Matching the id alone reported 0 for every
   * subcategory because the products live one level deeper.
   */
  productCount(categoryId: number): number {
    const subtree = categorySubtreeIds(this.groups(), categoryId);
    return this.productService.items()
      .filter(p => p.active !== false && p.categoryId != null && subtree.has(p.categoryId))
      .length;
  }

  groupProductCount(group: CategoryGroupDTO): number {
    return this.productCount(group.id);
  }

  initials(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  groupIcon(name: string): string {
    return categoryIcon(name);
  }

  groupColor(name: string): string {
    return categoryColor(name);
  }

  groupGradient(name: string): string {
    return categoryGradient(name);
  }

  groupShadow(name: string): string {
    return categoryShadow(name);
  }

  /**
   * Owning group of a product, resolved at any depth of the category tree.
   */
  private groupFor(product: Product): CategoryGroupDTO | null {
    return groupOfProductCategory(this.groups(), product.categoryId);
  }

  /**
   * Category node a product belongs to, so its own image can be used even when the node
   * sits deeper than the direct subcategory.
   */
  private categoryNodeFor(product: Product): CategoryDTO | null {
    const categoryId = product.categoryId;
    if (categoryId == null) return null;
    const group = this.groupFor(product);
    if (!group) return null;

    const find = (nodes: CategoryDTO[]): CategoryDTO | null => {
      for (const node of nodes) {
        if (node.id === categoryId) return node;
        const hit = find(node.children ?? []);
        if (hit) return hit;
      }
      return null;
    };

    return find(group.children ?? []);
  }

  productGroupColor(product: Product): string {
    const selected = this.selectedGroup();
    if (selected) {
      return this.groupColor(selected.name);
    }
    return this.groupColor(this.groupFor(product)?.name || product.categoryName || '');
  }

  productGradient(product: Product): string {
    const selected = this.selectedGroup();
    if (selected) {
      return this.groupGradient(selected.name);
    }
    return this.groupGradient(this.groupFor(product)?.name || product.categoryName || '');
  }

  productShadow(product: Product): string {
    const selected = this.selectedGroup();
    if (selected) {
      return this.groupShadow(selected.name);
    }
    return this.groupShadow(this.groupFor(product)?.name || product.categoryName || '');
  }

  productCategoryIcon(product: Product): string {
    return this.groupIcon(this.groupFor(product)?.name || product.categoryName || '');
  }

  productCategoryImage(product: Product): string | null {
    if (product.image) return product.image;
    const nodeImage = this.categoryNodeFor(product)?.image;
    if (nodeImage) return nodeImage;
    return this.groupFor(product)?.image ?? null;
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
    return orderStatusClass(status);
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
