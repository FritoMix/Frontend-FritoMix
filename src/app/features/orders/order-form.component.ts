import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ClientService } from '../../core/services/client.service';
import { ProductService } from '../../core/services/product.service';
import { OrderItem, OrderStatus } from '../../core/models/order.model';
import { Client } from '../../core/models/client.model';
import { ToastService } from '../../core/services/toast.service';
import { forkJoin } from 'rxjs';

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
  orderNumber = '';
  loadingNumber = signal(false);
  status: OrderStatus = 'PENDIENTE';
  notes = '';

  clientQuery = signal('');
  clientDropdownOpen = false;

  items = signal<{ productId: number | null; quantity: number }[]>([]);

  filteredClients = computed(() => {
    const term = this.clientQuery().toLowerCase().trim();
    if (!term) return this.clientService.clients();
    return this.clientService.clients().filter(c =>
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
    this.clientDropdownOpen = false;
  }

  closeClientDropdown() {
    setTimeout(() => { this.clientDropdownOpen = false; }, 150);
  }

  ngOnInit() {
    forkJoin([
      this.clientService.getDepartments(),
    ]).subscribe();
    this.clientService.loadClients();
    this.productService.loadProducts();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = Number(idParam);
      this.orderService.findById(this.editId).subscribe(resp => {
        this.selectedClientId = resp.customerId;
        this.clientQuery.set(resp.customerName || '');
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

  addItem() {
    this.items.update(list => [...list, { productId: null, quantity: 0 }]);
  }

  removeItem(index: number) {
    this.items.update(list => list.filter((_, i) => i !== index));
  }

  updateItem(index: number) {}

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
        this.orderService.loadOrders();
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