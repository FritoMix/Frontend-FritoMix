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
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <nav class="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <a routerLink="/dashboard" class="hover:text-[#0055FF] transition-colors">Dashboard</a>
            <span>/</span>
            <a routerLink="/pedidos" class="hover:text-[#0055FF] transition-colors">Pedidos</a>
            <span>/</span>
            <span class="text-[#071938] font-semibold">{{ isEdit ? 'Editar pedido' : 'Nuevo pedido' }}</span>
          </nav>
          <h1 class="text-2xl font-extrabold text-[#071938]">{{ isEdit ? 'Editar pedido' : 'Nuevo pedido' }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ isEdit ? 'Modifica la información del pedido' : 'Registra la información de un nuevo pedido' }}</p>
        </div>
        <button (click)="router.navigate(['/pedidos'])"
          class="border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors">
          <span>←</span> Volver
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div>
          <label class="block text-sm font-semibold text-[#071938] mb-1.5">Cliente</label>
          <div class="relative">
            <input
              type="text"
              [value]="clientQuery()"
              (input)="onClientSearch($event)"
              (focus)="clientDropdownOpen = true"
              (blur)="closeClientDropdown()"
              (keydown.escape)="clientDropdownOpen = false"
              placeholder="Escribe el nombre del cliente..."
              autocomplete="off"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            />
            @if (clientDropdownOpen) {
              <div class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                @for (c of filteredClients(); track c.id; let last = $last) {
                  <button type="button" (mousedown)="selectClient(c)"
                    class="w-full text-left px-3.5 py-2.5 text-sm hover:bg-blue-50 transition-colors"
                    [class.border-b]="!last" [class.border-gray-100]="!last">
                    <span class="font-semibold text-[#071938] block">{{ c.businessName }}</span>
                    <span class="text-xs text-gray-500">{{ c.document }} · {{ c.cityName }}</span>
                  </button>
                } @empty {
                  <div class="px-3.5 py-3 text-sm text-gray-400">No se encontraron clientes</div>
                }
              </div>
            }
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold text-[#071938] mb-1.5">N° Pedido</label>
          <div class="flex items-center">
            <input type="text" [ngModel]="orderNumber" readonly
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm bg-gray-100 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            @if (loadingNumber()) {
              <span class="ml-2 text-xs text-gray-400">...</span>
            }
          </div>
          <p class="text-[11px] text-gray-400 mt-1">Consecutivo automático</p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-[#071938] mb-1.5">Estado</label>
          <span class="status-badge" [class]="badgeClass(status)">{{ status }}</span>
        </div>
      </div>

      <h3 class="font-bold text-[#071938] text-sm mb-3">Productos</h3>
      <div class="overflow-x-auto mb-4">
        <table class="fm-table">
          <thead>
            <tr class="bg-gray-50/60">
              <th class="!pl-6">#</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th class="text-right !pr-6"></th>
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track $index; let i = $index) {
              <tr>
                <td class="!pl-6">{{ i + 1 }}</td>
                <td>
                  <select [(ngModel)]="item.productId" (ngModelChange)="updateItem(i)"
                    class="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">Seleccionar</option>
                    @for (p of productService.products(); track p.id) {
                      <option [value]="p.id">{{ p.name }} ({{ p.code }})</option>
                    }
                  </select>
                </td>
                <td><input type="number" [(ngModel)]="item.quantity" (ngModelChange)="updateItem(i)" min="0" class="w-24 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                <td class="text-right !pr-6">
                  <button (click)="removeItem(i)" class="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <button (click)="addItem()" class="text-sm font-semibold text-[#0055FF] hover:text-[#0044DD] mb-6 inline-flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Agregar producto
      </button>

      <div class="mb-6">
        <label class="block text-sm font-semibold text-[#071938] mb-1.5">Observaciones del pedido</label>
        <textarea [(ngModel)]="notes" rows="3" placeholder="Escribe aquí cualquier observación sobre el pedido..."
          class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"></textarea>
      </div>

      <div class="border-t border-gray-100 pt-4 flex items-center justify-end">
        <div class="flex gap-3">
          <button (click)="onSave()" [disabled]="saving"
            class="bg-[#0055FF] hover:bg-[#0044DD] disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg text-sm flex items-center gap-2 transition-colors">
            @if (saving) { <span class="animate-spin">⏳</span> Guardando... }
            @else { <span>💾</span> <span>{{ isEdit ? 'Actualizar pedido' : 'Guardar pedido' }}</span> }
          </button>
        </div>
      </div>
    </div>
  `
})
export class OrderFormComponent implements OnInit {
  authService = inject(AuthService);
  orderService = inject(OrderService);
  clientService = inject(ClientService);
  productService = inject(ProductService);
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
        this.router.navigate(['/pedidos']);
      },
      error: (err) => {
        this.saving = false;
        const msg = err.error?.error || err.error?.message || err.message || 'Error al guardar el pedido.';
        alert(msg);
      },
    });
  }
}