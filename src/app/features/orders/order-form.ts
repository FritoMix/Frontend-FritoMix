import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderItem } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';
import { ClientService } from '../../core/services/client.service';
import { ProductService } from '../../core/services/product.service';
import { DriverService } from '../../core/services/driver.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { OrderStatus } from '../../core/models/order.model';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="module-badge module-badge--red">9.</span>
        <div>
          <h1 class="text-2xl font-extrabold text-[#071938]">Detalle del Pedido</h1>
          <nav class="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
            <a routerLink="/pedidos" class="text-[#0055FF] hover:underline">Pedido</a>
            <span>/</span>
            <a routerLink="/pedidos" class="text-[#0055FF] hover:underline">Detalle</a>
            <span>/</span>
            <span class="text-gray-700 font-semibold">{{ orderNumber || 'PED-000123' }}</span>
          </nav>
        </div>
      </div>
      <span class="status-badge bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold px-3 py-1">
        PENDIENTE
      </span>
    </div>

    <!-- Main Grid: Info + Detalle de Productos -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
      <!-- Left Column: Información del Pedido (5 cols) -->
      <div class="lg:col-span-5 fm-card p-6">
        <h3 class="font-bold text-[#071938] text-base mb-5">Información del Pedido</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Código <span class="text-red-500">*</span></label>
            <input
              type="text"
              [ngModel]="orderNumber"
              disabled
              class="w-full border border-gray-200 bg-gray-50 rounded-lg py-2.5 px-3 text-sm font-mono text-[#071938] font-bold outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Cliente</label>
            <select
              [(ngModel)]="selectedClientId"
              (ngModelChange)="onClientChange()"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-semibold text-[#071938]"
            >
              <option value="">-- Selecciona un cliente --</option>
              @for (client of clientService.clients(); track client.id) {
                <option [value]="client.id">{{ client.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Fecha Pedido</label>
            <input
              type="date"
              [(ngModel)]="form.date"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Coordinador</label>
            <input
              type="text"
              [(ngModel)]="form.coordinatorName"
              placeholder="Juan López"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Teléfono</label>
            <input
              type="text"
              [(ngModel)]="form.phone"
              placeholder="300 123 4567"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Ciudad</label>
            <input
              type="text"
              [(ngModel)]="form.city"
              placeholder="IBAGUÉ"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Dirección</label>
            <input
              type="text"
              [(ngModel)]="form.address"
              placeholder="CRA 5 # 21 - 45 B/ CENTRO"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
            />
          </div>
        </div>
      </div>

      <!-- Right Column: Detalle de Productos (7 cols) -->
      <div class="lg:col-span-7 fm-card p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-bold text-[#071938] text-base">Detalle de Productos</h3>
            <button
              type="button"
              (click)="addItem()"
              class="text-xs font-bold text-[#0055FF] hover:underline"
            >
              + Agregar producto
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="fm-table">
              <thead>
                <tr class="bg-gray-50/60">
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Presentación</th>
                  <th class="text-center">Stock Disp.</th>
                  <th class="text-center">Cant.</th>
                  <th class="text-right !pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.item; let i = $index) {
                  <tr>
                    <td>
                      <span class="code-badge" [class]="productBadgeClass(i)">PR-{{ 101 + i }}</span>
                    </td>
                    <td>
                      <select
                        [ngModel]="item.description"
                        (ngModelChange)="onItemDescriptionChange(i, $event)"
                        class="w-full border border-gray-300 rounded-lg py-1.5 px-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none uppercase font-semibold text-[#071938]"
                      >
                        <option value="">Seleccionar...</option>
                        @for (p of productService.products(); track p.id) {
                          <option [value]="p.description">{{ p.description }}</option>
                        }
                      </select>
                    </td>
                    <td class="text-xs text-gray-500">24 und</td>
                    <td class="text-center text-xs font-semibold text-gray-600">200</td>
                    <td class="text-center">
                      <input
                        type="number"
                        min="1"
                        [ngModel]="item.bulto"
                        (ngModelChange)="onItemValueChange(i, 'bulto', $event)"
                        class="w-14 border border-gray-300 rounded-lg py-1 px-2 text-center text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </td>
                    <td class="text-right !pr-4">
                      <button
                        type="button"
                        (click)="removeItem(i)"
                        class="text-red-500 hover:text-red-700 p-1"
                        title="Eliminar ítem"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary KPI Cards Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="fm-card p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0055FF]">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-500">Total Ítems</p>
          <p class="text-2xl font-extrabold text-[#071938]">{{ items().length }}</p>
        </div>
      </div>
      <div class="fm-card p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-500">Total Cajas</p>
          <p class="text-2xl font-extrabold text-[#071938]">{{ totalCajas() }}</p>
        </div>
      </div>
      <div class="fm-card p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-500">Total Unidades</p>
          <p class="text-2xl font-extrabold text-[#071938]">{{ totalUnidades().toLocaleString() }}</p>
        </div>
      </div>
      <div class="fm-card p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
          <span class="font-extrabold text-lg">$</span>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-500">Peso Total (kg)</p>
          <p class="text-2xl font-extrabold text-[#071938]">{{ pesoTotalKg().toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- Action Buttons Footer -->
    <div class="flex items-center justify-end gap-3">
      <button
        type="button"
        (click)="router.navigate(['/pedidos'])"
        class="border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-6 rounded-lg text-sm transition-colors"
      >
        Cancelar
      </button>
      <button
        type="button"
        (click)="onSave()"
        class="bg-[#0055FF] hover:bg-[#0044DD] text-white font-bold py-2.5 px-6 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm"
      >
        Guardar Pedido
      </button>
      <button
        type="button"
        (click)="onSaveAndDispatch()"
        class="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l-3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
        Enviar a Despacho
      </button>
    </div>
  `
})
export class OrderFormComponent implements OnInit {
  orderService = inject(OrderService);
  clientService = inject(ClientService);
  productService = inject(ProductService);
  driverService = inject(DriverService);
  vehicleService = inject(VehicleService);
  router = inject(Router);

  selectedClientId = signal<string>('');
  orderNumber = '';

  form = {
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    coordinatorName: 'Juan López',
    phone: '300 123 4567',
    city: 'IBAGUÉ',
    address: 'CRA 5 # 21 - 45 B/ CENTRO',
    status: 'PENDIENTE' as OrderStatus
  };

  items = signal<OrderItem[]>([
    { item: 1, description: 'TRADICIONAL SURT MIX 250 UND', bulto: 30, caja: 12, dcho: 0, group: 1 },
    { item: 2, description: 'LENTEJA CRIOLLA 200 G 24X1', bulto: 20, caja: 10, dcho: 0, group: 1 },
    { item: 3, description: 'ALMENDRA HOLLADA 250 G 30X1', bulto: 20, caja: 10, dcho: 0, group: 1 }
  ]);

  private readonly productBadgeColors = [
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-amber-50 text-amber-700 border-amber-200',
    'bg-green-50 text-green-700 border-green-200',
    'bg-purple-50 text-purple-700 border-purple-200',
    'bg-rose-50 text-rose-700 border-rose-200',
  ];

  totalCajas = computed(() => this.items().reduce((s, i) => s + (Number(i.caja) || 0), 0));
  totalUnidades = computed(() => this.items().reduce((s, i) => s + (Number(i.bulto) || 0) * (Number(i.caja) || 24), 0));
  pesoTotalKg = computed(() => {
    return this.items().reduce((sum, item) => {
      const unidades = (Number(item.bulto) || 0) * (Number(item.caja) || 24);
      return sum + (unidades * 250) / 1000;
    }, 0);
  });

  ngOnInit() {
    const nextNum = this.orderService.orders().length + 123;
    this.orderNumber = `PED-${String(nextNum).padStart(6, '0')}`;
  }

  productBadgeClass(index: number): string {
    return this.productBadgeColors[index % this.productBadgeColors.length];
  }

  onClientChange() {
    const client = this.clientService.clients().find(c => c.id === this.selectedClientId());
    if (client) {
      this.form.clientName = client.name;
      this.form.city = client.city;
      this.form.phone = client.phone;
      this.form.address = client.address;
    }
  }

  addItem() {
    const next = this.items().length + 1;
    this.items.update(list => [
      ...list,
      { item: next, description: '', bulto: 1, caja: 12, dcho: 0, group: 1 }
    ]);
  }

  removeItem(index: number) {
    if (this.items().length <= 1) return;
    this.items.update(list => list.filter((_, i) => i !== index));
  }

  onItemDescriptionChange(index: number, value: string) {
    this.items.update(list => list.map((it, i) => i === index ? { ...it, description: value } : it));
  }

  onItemValueChange(index: number, field: 'bulto' | 'caja', value: number) {
    this.items.update(list => list.map((it, i) => i === index ? { ...it, [field]: Number(value) || 0 } : it));
  }

  onSave() {
    this.router.navigate(['/pedidos']);
  }

  onSaveAndDispatch() {
    this.router.navigate(['/despachos/nuevo']);
  }
}
