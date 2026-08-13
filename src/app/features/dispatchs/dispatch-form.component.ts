import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DispatchService } from '../../core/services/dispatch.service';
import { OrderService } from '../../core/services/order.service';
import { DriverService } from '../../core/services/driver.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { ProductService } from '../../core/services/product.service';
import { ChecklistItem, DispatchStatus, DispatchResponse, CreateArrumeRequest } from '../../core/models/dispatch.model';
import { Order } from '../../core/models/order.model';
import { AuthService } from '../../core/services/auth.service';

type TipoPedido = 'pedido_unico' | 'pedido_multipedido';

interface PreviewItem {
  productId: number;
  description: string;
  lot?: string;
  qty: number;
}

@Component({
  selector: 'app-dispatch-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--green">11.</span>
        <div>
          <h1 class="text-2xl font-extrabold text-[#071938]">{{ editId ? 'Editar Despacho' : 'Confirmación de Despacho' }}</h1>
          <nav class="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
            <a routerLink="/despachos" class="text-[#0055FF] hover:underline">{{ editId ? 'Editar Despacho' : 'Confirmar Despacho' }}</a>
            <span>/</span>
            <span class="text-gray-700 font-semibold">{{ form.dispatchNumber || 'DES-XXXXX' }}</span>
          </nav>
        </div>
      </div>
    </div>

    <div class="fm-card p-6 mb-5">
      <h3 class="font-bold text-[#071938] text-base mb-4">Tipo de Pedido</h3>
      <div class="flex flex-col sm:flex-row gap-3">
        <label [class]="radioClass('pedido_unico')">
          <input type="radio" name="tipoPedido" value="pedido_unico" [ngModel]="tipoPedido" (ngModelChange)="onTipoPedido('pedido_unico')" class="accent-[#0055FF]" />
          <div class="ml-2">
            <span class="block font-bold text-sm text-[#071938]">Pedido Único</span>
            <span class="block text-xs text-gray-500">Despacho para un solo cliente</span>
          </div>
        </label>
        <label [class]="radioClass('pedido_multipedido')">
          <input type="radio" name="tipoPedido" value="pedido_multipedido" [ngModel]="tipoPedido" (ngModelChange)="onTipoPedido('pedido_multipedido')" class="accent-[#0055FF]" />
          <div class="ml-2">
            <span class="block font-bold text-sm text-[#071938]">Pedido Multipedido</span>
            <span class="block text-xs text-gray-500">Despacho consolidado para varios clientes</span>
          </div>
        </label>
      </div>
      @if (!tipoPedido) {
        <p class="text-xs text-red-600 mt-2">Debes seleccionar un tipo de pedido para continuar.</p>
      }
    </div>

    <div class="fm-card p-6 mb-5">
      <h3 class="font-bold text-[#071938] text-base mb-5">Información del Despacho</h3>

      @if (isUnico()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label for="select-pedido" class="block text-xs font-semibold text-gray-500 mb-1.5">Pedido (Cliente)</label>
            <select id="select-pedido"
              [(ngModel)]="selectedOrderId"
              (ngModelChange)="onOrderChange()"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
            >
              <option value="">Seleccionar pedido</option>
              @for (o of availableOrders(); track o.id) {
                <option [value]="o.id">{{ o.orderNumber }} - {{ o.clientName }}</option>
              }
            </select>
            @if (form.orderNumber) {
              <span class="code-badge bg-blue-50 text-blue-700 border-blue-200 mt-2 inline-block">{{ form.orderNumber }}</span>
            }
          </div>
          <div>
            <label for="fecha-despacho" class="block text-xs font-semibold text-gray-500 mb-1.5">Fecha de Despacho</label>
            <input id="fecha-despacho"
              type="date"
              [(ngModel)]="form.dispatchDate"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Estado</label>
            <span class="status-badge bg-teal-50 text-teal-700 border-teal-200 text-xs font-bold">LISTO PARA DESPACHO</span>
          </div>
        </div>
      } @else if (isMulti()) {
        <p class="text-sm text-gray-500 mb-4">Selecciona uno o varios pedidos (un cliente por pedido) para consolidar el despacho.</p>
        <div class="border border-gray-200 rounded-lg p-3 mb-4 max-h-64 overflow-y-auto">
          @for (o of availableOrders(); track o.id) {
            <label class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                [checked]="selectedOrderIds.includes(o.id)"
                (change)="toggleOrder(o.id)"
                class="w-4 h-4 accent-[#0055FF]"
              />
              <span class="text-sm font-semibold text-[#071938]">{{ o.orderNumber }}</span>
              <span class="text-xs text-gray-500">{{ o.clientName }} — {{ o.city || '—' }}</span>
            </label>
          } @empty {
            <p class="text-sm text-gray-400 py-4 text-center">No hay pedidos disponibles para despachar.</p>
          }
        </div>
      }
    </div>

    @if (isMulti()) {
      <div class="fm-card p-6 mb-5 border-l-4 border-l-[#0055FF]">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-[#071938] text-base">Vista Previa — Clientes Seleccionados</h3>
          <span class="text-xs text-gray-500">{{ selectedOrderIds.length }} cliente(s) agregado(s)</span>
        </div>
        <div class="overflow-x-auto">
          <table class="fm-table">
            <thead>
              <tr class="bg-gray-50/60">
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Ciudad / Dirección</th>
                <th class="text-right">Productos</th>
                <th class="text-right">Peso Total (kg)</th>
                <th class="text-right">Dimensión (m³)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (row of previewRows(); track row.id) {
                <tr>
                  <td class="font-bold text-xs text-[#071938]">{{ row.orderNumber }}</td>
                  <td class="font-semibold text-xs text-gray-800">{{ row.clientName }}</td>
                  <td class="text-xs text-gray-500">{{ row.city }} — {{ row.address }}</td>
                  <td class="text-right text-xs text-gray-600">{{ row.items?.length ?? 0 }}</td>
                  <td class="text-right font-bold text-xs text-gray-700">{{ orderWeight(row) }}</td>
                  <td class="text-right font-semibold text-xs text-gray-700">{{ orderDimension(row) }}</td>
                  <td class="text-right">
                    <button type="button" (click)="removeOrder(row.id)"
                      class="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700">
                      Quitar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="text-center text-gray-400 text-sm py-6">No hay clientes agregados. Marca al menos un pedido arriba.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <div class="fm-card p-6 mb-5">
      <h3 class="font-bold text-[#071938] text-base mb-1">Productos del Pedido {{ isMulti() ? '(Consolidado)' : '' }}</h3>
      <p class="text-xs text-gray-500 mb-5">Cantidades solicitadas en el pedido. Esta vista es informativa.</p>
      <div class="overflow-x-auto">
        <table class="fm-table">
          <thead>
            <tr class="bg-gray-50/60">
              <th>Producto</th>
              <th class="!text-right">Cant. Pedido</th>
            </tr>
          </thead>
          <tbody>
            @if (aggregatedItems().length > 0) {
              @for (item of aggregatedItems(); track item.productId) {
                <tr>
                  <td>
                    <div class="flex flex-col gap-0.5">
                      <span class="font-semibold text-[#071938] text-sm">{{ item.description }}</span>
                    </div>
                  </td>
                  <td class="text-right"><span class="font-semibold text-[#071938]">{{ item.qty }}</span></td>
                </tr>
              }
            } @else {
              <tr>
                <td colspan="2" class="py-10 text-center">
                  <p class="text-sm text-gray-400">{{ isUnico() ? 'Selecciona un pedido para ver los productos' : 'Selecciona al menos un pedido para ver los productos' }}</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <div class="fm-card p-6 mb-5 border-t-4 border-t-[#0055FF]">
      <h3 class="font-bold text-[#071938] text-base mb-1">Detalle del Despacho</h3>
      <p class="text-xs text-gray-500 mb-5">Registra la cantidad total despachada y la observación por producto.</p>
      <div class="overflow-x-auto">
        <table class="fm-table">
          <thead>
            <tr class="bg-gray-50/60">
              <th>Producto</th>
              <th>Despachar</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            @if (aggregatedItems().length > 0) {
              @for (item of aggregatedItems(); track item.productId) {
                <tr>
                  <td>
                    <div class="flex flex-col gap-0.5">
                      <span class="font-semibold text-[#071938] text-sm">{{ item.description }}</span>
                      <span class="text-xs text-gray-400">Cant. pedido: {{ item.qty }}</span>
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      [ngModel]="itemDelivered[item.productId] ?? item.qty"
                      (ngModelChange)="itemDelivered[item.productId] = $event"
                      min="0"
                      max="99999"
                      class="w-28 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-center"
                    />
                  </td>
                  <td class="w-[20rem]">
                    <input
                      type="text"
                      [ngModel]="itemObservations[item.productId] || ''"
                      (ngModelChange)="itemObservations[item.productId] = $event"
                      placeholder="Obs..."
                      class="w-[15rem] mr-auto px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                  </td>
                </tr>
              }
            } @else {
              <tr>
                <td colspan="3" class="py-10 text-center">
                  <p class="text-sm text-gray-400">{{ isUnico() ? 'Selecciona un pedido para ver los productos' : 'Selecciona al menos un pedido para ver los productos' }}</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <div class="fm-card p-6 mb-5 border-t-4 border-t-green-600">
      <div class="flex items-center justify-between mb-1">
        <h3 class="font-bold text-[#071938] text-base">Detalle de Arrumes</h3>
        <button type="button" (click)="addArrume()"
          class="text-sm font-semibold text-[#0055FF] hover:text-[#0044DD] inline-flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Agregar arrume
        </button>
      </div>
      <p class="text-xs text-gray-500 mb-5">Registra cada arrume del despacho con su número, producto, cantidad y lote.</p>
      <div class="overflow-x-auto">
        <table class="fm-table">
          <thead>
            <tr class="bg-gray-50/60">
              <th>Nº Arrume</th>
              <th>Arrume Producto</th>
              <th>Cantidad</th>
              <th>Lote</th>
              <th class="text-right"></th>
            </tr>
          </thead>
          <tbody>
            @for (a of arrumes(); track $index; let i = $index) {
              <tr>
                <td>
                  <input
                    type="number"
                    [(ngModel)]="a.numArrume"
                    min="1"
                    placeholder="Nº"
                    class="w-24 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-center"
                  />
                </td>
                <td class="w-[20rem]">
                  <input
                    type="text"
                    [(ngModel)]="a.arrumeProducto"
                    placeholder="Producto del arrume..."
                    class="w-[16rem] px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    [(ngModel)]="a.cantidad"
                    min="0"
                    placeholder="0"
                    class="w-28 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-center"
                  />
                </td>
                <td class="w-[12rem]">
                  <input
                    type="text"
                    [(ngModel)]="a.lote"
                    placeholder="Lote..."
                    class="w-[10rem] px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </td>
                <td class="text-right">
                  <button type="button" (click)="removeArrume(i)"
                    class="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Quitar arrume">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="py-10 text-center">
                  <p class="text-sm text-gray-400">No hay arrumes registrados. Haz clic en "Agregar arrume" para empezar.</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <div class="fm-card p-6 mb-5">
      <h3 class="font-bold text-[#071938] text-base mb-5">Observaciones del Despacho</h3>
      <div>
        <textarea
          [(ngModel)]="form.observations"
          rows="3"
          placeholder="Escribe aquí cualquier observación sobre el despacho (productos faltantes, daños, novedades, etc.)..."
          class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-y transition-all"
        ></textarea>
        <p class="text-xs text-gray-400 mt-1">Estas observaciones se guardarán junto con los detalles del despacho.</p>
      </div>
    </div>

    <div class="fm-card p-6">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-5 items-end">
        <div>
          <label for="select-conductor" class="block text-xs font-semibold text-gray-500 mb-1.5">Conductor</label>
          <select id="select-conductor"
            [(ngModel)]="selectedDriverId"
            (ngModelChange)="onDriverChange()"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
          >
            <option value="">Seleccionar conductor</option>
            @for (dr of driverService.drivers().filter(d => d.active); track dr.id) {
              <option [value]="dr.id">{{ dr.name }} — {{ dr.document }}</option>
            }
          </select>
        </div>
        <div>
          <label for="select-vehiculo" class="block text-xs font-semibold text-gray-500 mb-1.5">Vehículo</label>
          <select id="select-vehiculo"
            [(ngModel)]="selectedVehicleId"
            (ngModelChange)="onVehicleChange()"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
          >
            <option value="">Seleccionar vehículo</option>
            @for (v of vehicleService.vehicles().filter(veh => veh.active); track v.id) {
              <option [value]="v.id">{{ v.type }} — {{ v.vehicleNumber }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">Peso Total</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              [ngModel]="pesoTotalCargue"
              disabled
              class="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500"
            />
            <span class="text-sm text-gray-500 font-medium">Kg</span>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">Total Dimensión</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              [ngModel]="totalDimension"
              disabled
              class="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500"
            />
            <span class="text-sm text-gray-500 font-medium">m³</span>
          </div>
        </div>
        <div class="flex justify-end">
          <button
            type="button"
            (click)="guardar()"
            [disabled]="!esValido()"
            class="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{ editId ? 'Actualizar Despacho' : 'Confirmar Despacho' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class DispatchFormComponent {
  dispatchService = inject(DispatchService);
  orderService = inject(OrderService);
  driverService = inject(DriverService);
  vehicleService = inject(VehicleService);
  productService = inject(ProductService);
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  editId: number | null = null;
  tipoPedido: '' | TipoPedido = '';
  selectedOrderId = '';
  selectedOrderIds: string[] = [];
  selectedDriverId: number | null = null;
  selectedVehicleId: number | null = null;
  pesoTotalCargue = 0;
  totalDimension = 0;
  selectedOrder: Order | null = null;
  itemObservations: Record<number, string> = {};
  itemDelivered: Record<number, number> = {};
  arrumes = signal<CreateArrumeRequest[]>([]);

  addArrume() {
    this.arrumes.update(list => [...list, { numArrume: null, arrumeProducto: '', cantidad: null, lote: '' }]);
  }

  removeArrume(i: number) {
    this.arrumes.update(list => list.filter((_, idx) => idx !== i));
  }

  form = {
    dispatchNumber: '',
    orderNumber: '',
    dispatchDate: '',
    dispatchTime: '',
    driverName: '',
    driverDocument: '',
    driverPhone: '',
    vehicleNumber: '',
    vehicleType: '',
    helperName: '',
    route: '',
    estimatedArrival: '',
    status: 'PENDIENTE' as DispatchStatus,
    departureKm: undefined as number | undefined,
    arrivalKm: undefined as number | undefined,
    fuelLiters: undefined as number | undefined,
    observations: ''
  };

  checklist: ChecklistItem[] = [
    { name: 'Documentos OK (Remisión, SOAT, Tecnomecánica)', checked: true },
    { name: 'Combustible suficiente', checked: true },
    { name: 'Luces (altas, bajas, direccionales, frenos)', checked: true },
    { name: 'Sistema de frenos', checked: true },
    { name: 'Neumáticos y llanta de repuesto', checked: true },
    { name: 'Carga asegurada y amarrable', checked: true },
    { name: 'GPS y comunicación operativa', checked: true },
    { name: 'Kit vial + extintor + botiquín', checked: true }
  ];

  constructor() {
    this.orderService.loadOrders();
    this.driverService.loadDrivers();
    this.vehicleService.loadVehicles();
    this.productService.loadProducts();
    this.dispatchService.loadDispatches();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = Number(idParam);
      this.dispatchService.findById(this.editId).subscribe(resp => this.cargarDespacho(resp));
    } else {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      this.form.dispatchDate = `${yyyy}-${mm}-${dd}`;
      this.generarNumeroDespacho();
    }
  }

  isUnico(): boolean { return this.tipoPedido === 'pedido_unico'; }
  isMulti(): boolean { return this.tipoPedido === 'pedido_multipedido'; }

  radioClass(tipo: TipoPedido): string {
    const base = 'flex items-center px-4 py-3 border rounded-lg cursor-pointer transition-all ';
    return base + (this.tipoPedido === tipo
      ? 'border-[#0055FF] bg-blue-50 ring-1 ring-[#0055FF]'
      : 'border-gray-200 hover:border-gray-300 bg-white');
  }

  onTipoPedido(tipo: TipoPedido) {
    this.tipoPedido = tipo;
    if (tipo === 'pedido_unico') {
      this.selectedOrderIds = [];
    } else {
      this.selectedOrderId = '';
      this.selectedOrder = null;
    }
  }

  availableOrders(): Order[] {
    const dispatched = new Set<string>(
      this.orderService.orders()
        .filter(o => !!o.dispatchDate)
        .map(o => o.id)
    );
    return this.orderService.orders()
      .filter(o => o.status === 'APROBADO' && !dispatched.has(o.id));
  }

  previewRows(): Order[] {
    if (!this.isMulti()) return [];
    const map = new Map(this.orderService.orders().map(o => [o.id, o]));
    return this.selectedOrderIds
      .map(id => map.get(id))
      .filter((o): o is Order => !!o);
  }

  toggleOrder(id: string) {
    if (this.selectedOrderIds.includes(id)) {
      this.selectedOrderIds = this.selectedOrderIds.filter(x => x !== id);
    } else {
      this.selectedOrderIds = [...this.selectedOrderIds, id];
    }
  }

  removeOrder(id: string) {
    this.selectedOrderIds = this.selectedOrderIds.filter(x => x !== id);
  }

  aggregatedItems(): PreviewItem[] {
    if (this.isUnico()) {
      const order = this.selectedOrder;
      return (order?.items ?? []).map((it) => ({
        productId: it.productId,
        description: it.description,
        lot: it.lot,
        qty: it.bulto || 0
      }));
    }
    const map = new Map<number, PreviewItem>();
    for (const order of this.previewRows()) {
      for (const it of order.items ?? []) {
        const pid = it.productId;
        const existing = map.get(pid);
        if (existing) {
          existing.qty += it.bulto || 0;
        } else {
          map.set(pid, { productId: pid, description: it.description, lot: it.lot, qty: it.bulto || 0 });
        }
      }
    }
    return [...map.values()];
  }

  cargarDespacho(resp: DispatchResponse) {
    this.form.dispatchNumber = resp.dispatchNumber;
    this.form.orderNumber = resp.orderNumber;
    this.form.status = resp.status as DispatchStatus;
    this.form.observations = resp.notes || '';
    this.tipoPedido = (resp.tipoPedido || 'pedido_unico') as TipoPedido;
    this.selectedDriverId = resp.driverId;
    this.selectedVehicleId = resp.vehicleId;

    if (resp.dispatchDate) {
      this.form.dispatchDate = resp.dispatchDate.split('T')[0];
    }

    const orderList = this.orderService.orders();
    if (this.isMulti()) {
      const ids = (resp.orders ?? []).map(o => String(o.id));
      this.selectedOrderIds = ids;
      if (ids.length === 0 && resp.orderId) this.selectedOrderIds = [String(resp.orderId)];
    } else {
      const orderId = resp.orderId ?? resp.orders?.[0]?.id;
      this.selectedOrderId = orderId ? String(orderId) : '';
      const order = orderList.find(o => o.id === String(orderId));
      if (order) {
        this.selectedOrder = order;
        this.form.route = `${order.city} - ${order.address}`;
      }
    }

    this.recalcWeight();
    if (resp.pesoTotal != null) this.pesoTotalCargue = this.round2(resp.pesoTotal);
    if (resp.totalDimension != null) this.totalDimension = this.round2(resp.totalDimension);
    this.onDriverChange();
    this.onVehicleChange();

    if (resp.details) {
      this.itemDelivered = {};
      this.itemObservations = {};
      for (const d of resp.details) {
        if (d.delivered != null) this.itemDelivered[d.productId] = d.delivered;
        if (d.observations) this.itemObservations[d.productId] = d.observations;
      }
    }

    this.arrumes.set((resp.arrumes ?? []).map(a => ({
      numArrume: a.numArrume ?? null,
      arrumeProducto: a.arrumeProducto ?? '',
      cantidad: a.cantidad ?? null,
      lote: a.lote ?? ''
    })));
  }

  getLotCode(itemLot?: string, itemNum?: number): string {
    if (itemLot) return itemLot;
    const dateFormatted = this.form.dispatchDate ? this.form.dispatchDate.replace(/-/g, '') : '20260725';
    const numFormatted = String(itemNum || 1).padStart(3, '0');
    return `L-${dateFormatted}-${numFormatted}`;
  }

  generarNumeroDespacho() {
    const now = new Date();
    const ts = now.getFullYear().toString().slice(-2) +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0');
    this.form.dispatchNumber = 'DES-' + ts;
  }

  onOrderChange() {
    const order = this.orderService.orders().find(o => o.id === this.selectedOrderId) || null;
    this.selectedOrder = order;
    if (order) {
      this.form.orderNumber = order.orderNumber;
      this.form.route = `${order.city} - ${order.address}`;
      if (order.dispatchDate) this.form.dispatchDate = order.dispatchDate;
      if (order.dispatchTime) this.form.dispatchTime = order.dispatchTime;
      this.itemObservations = {};
      this.recalcWeight();

      const driver = this.driverService.drivers().find(d =>
        d.document === order.driverDocument ||
        d.name.includes((order.driverName || '').split(' ')[0])
      );
      if (driver) {
        this.selectedDriverId = driver.id;
        this.onDriverChange();
      }
      const vehicle = this.vehicleService.vehicles().find(v => v.vehicleNumber === order.vehicle);
      if (vehicle) {
        this.selectedVehicleId = vehicle.id;
        this.onVehicleChange();
      }
    } else {
      this.form.orderNumber = '';
      this.recalcWeight();
    }
  }

  recalcWeight() {
    if (this.isUnico() && this.selectedOrder) {
      this.pesoTotalCargue = this.orderWeight(this.selectedOrder);
      this.totalDimension = this.orderDimension(this.selectedOrder);
    } else if (this.isMulti()) {
      const orders = this.previewRows();
      this.pesoTotalCargue = this.round2(orders.reduce((s, o) => s + this.orderWeight(o), 0));
      this.totalDimension = this.round2(orders.reduce((s, o) => s + this.orderDimension(o), 0));
    }
  }

  round2(v: number): number {
    return Math.round(v * 100) / 100;
  }

  orderWeight(o: Order): number {
    return this.round2(
      (o.items ?? []).reduce((s, it) => s + ((it.pesoUnidad ?? 0) * (it.bulto ?? 0)), 0)
    );
  }

  orderDimension(o: Order): number {
    return this.round2(
      (o.items ?? []).reduce((s, it) => s + ((it.dimension ?? 0) * (it.bulto ?? 0)), 0)
    );
  }

  onDriverChange() {
    if (!this.selectedDriverId) {
      this.form.driverName = '';
      this.form.driverDocument = '';
      this.form.driverPhone = '';
      return;
    }
    const driver = this.driverService.drivers().find(d => d.id === this.selectedDriverId);
    if (driver) {
      this.form.driverName = driver.name;
      this.form.driverDocument = driver.document;
      this.form.driverPhone = driver.phone;
    }
  }

  onVehicleChange() {
    if (!this.selectedVehicleId) {
      this.form.vehicleNumber = '';
      this.form.vehicleType = '';
      return;
    }
    const vehicle = this.vehicleService.vehicles().find(v => v.id === this.selectedVehicleId);
    if (vehicle) {
      this.form.vehicleNumber = vehicle.vehicleNumber;
      this.form.vehicleType = vehicle.type;
    }
  }

  esValido(): boolean {
    if (!this.tipoPedido) return false;
    if (!this.selectedDriverId || !this.selectedVehicleId) return false;
    if (this.isUnico()) return !!this.selectedOrderId;
    if (this.isMulti()) return this.selectedOrderIds.length >= 1;
    return false;
  }

  guardar() {
    if (!this.esValido()) {
      const msg = !this.tipoPedido
        ? 'Debes seleccionar un tipo de pedido.'
        : this.isUnico()
          ? 'Debes seleccionar un pedido, conductor y vehículo.'
          : 'Debes agregar al menos un cliente (pedido), un conductor y un vehículo.';
      alert(msg);
      return;
    }

    const items = this.aggregatedItems();
    const details = items.map(item => ({
      productId: item.productId,
      quantity: item.qty,
      delivered: this.itemDelivered[item.productId] ?? item.qty,
      observations: this.itemObservations[item.productId] || ''
    }));

    const obsParts: string[] = [];
    if (this.form.observations) obsParts.push(this.form.observations);
    for (const c of this.checklist) {
      if (!c.checked) obsParts.push(`Checklist pendiente: ${c.name}`);
    }

    const dispatchDateStr = this.form.dispatchDate
      ? `${this.form.dispatchDate}T${this.form.dispatchTime || '00:00'}:00`
      : new Date().toISOString();

    const orderIds = this.isMulti()
      ? this.selectedOrderIds.map(Number)
      : [Number(this.selectedOrderId)];

    const arrumes = this.arrumes()
      .filter(a => a.arrumeProducto || a.numArrume || a.cantidad != null || a.lote)
      .map(a => ({
        numArrume: a.numArrume ?? null,
        arrumeProducto: a.arrumeProducto || '',
        cantidad: a.cantidad ?? null,
        lote: a.lote || ''
      }));

    const payload = {
      tipoPedido: this.tipoPedido,
      orderIds,
      driverId: Number(this.selectedDriverId),
      vehicleId: Number(this.selectedVehicleId),
      userId: this.authService.currentUser()?.id ?? null,
      dispatchNumber: this.form.dispatchNumber,
      dispatchDate: dispatchDateStr,
      status: this.form.status,
      notes: obsParts.join(' | '),
      details,
      arrumes
    };

    const request = this.editId
      ? this.dispatchService.update(this.editId, payload)
      : this.dispatchService.create(payload);

    request.subscribe({
      next: () => {
        this.orderService.loadOrders();
        this.dispatchService.loadDispatches();
        this.router.navigate(['/despachos']);
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Error al guardar el despacho. Verifica los datos e intenta de nuevo.';
        alert(msg);
      }
    });
  }

}