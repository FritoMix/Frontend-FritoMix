import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DispatchService } from '../../core/services/dispatch.service';
import { OrderService } from '../../core/services/order.service';
import { DriverService } from '../../core/services/driver.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { ProductService } from '../../core/services/product.service';
import { ChecklistItem, DispatchStatus, DispatchResponse } from '../../core/models/dispatch.model';
import { AuthService } from '../../core/services/auth.service';

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
      <h3 class="font-bold text-[#071938] text-base mb-5">Información del Despacho</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label for="select-pedido" class="block text-xs font-semibold text-gray-500 mb-1.5">Pedido</label>
          <select id="select-pedido"
            [(ngModel)]="selectedOrderId"
            (ngModelChange)="onOrderChange()"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
          >
            <option value="">Seleccionar pedido</option>
            @for (o of orderService.orders(); track o.id) {
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
    </div>

    <div class="fm-card p-6 mb-5">
      <h3 class="font-bold text-[#071938] text-base mb-5">Detalle de Productos</h3>
      <div class="overflow-x-auto">
        <table class="fm-table">
          <thead>
            <tr class="bg-gray-50/60">
              <th>Producto</th>
              <th>Cant.</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            @if (selectedOrder) {
              @for (item of selectedOrder.items; track item.item) {
                @let qty = item.bulto || 0;
                <tr>
                  <td>
                    <div class="flex flex-col gap-0.5">
                      <span class="font-semibold text-[#071938] text-sm">{{ item.description }}</span>
                      <span class="text-xs text-gray-400 font-mono">{{ item.lot || '—' }}</span>
                    </div>
                  </td>
                  <td><span class="font-semibold text-[#071938]">{{ qty }}</span></td>
                  <td class="w-[30rem]">
                    <input
                      type="text"
                      [ngModel]="itemObservations[item.productId] || ''"
                      (ngModelChange)="itemObservations[item.productId] = $event"
                      placeholder="Obs..."
                      class="w-[26rem] mr-auto px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                  </td>
                </tr>
              }
            } @else {
              <tr>
                <td colspan="3" class="py-10 text-center">
                  <p class="text-sm text-gray-400">Selecciona un pedido para ver los productos</p>
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
      <div class="grid grid-cols-1 md:grid-cols-5 gap-5 items-end">
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
              <option [value]="v.id">{{ v.brand }} {{ v.model }} — {{ v.plate }}</option>
            }
          </select>
        </div>
        <div>
          <label for="peso-bruto" class="block text-xs font-semibold text-gray-500 mb-1.5">Peso Bruto (kg)</label>
          <div class="flex items-center gap-2">
            <input id="peso-bruto"
              type="number"
              [(ngModel)]="pesoBruto"
              placeholder="0.00"
              min="0"
              step="0.01"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
            <span class="text-sm text-gray-500 font-medium">Kg</span>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">Peso Total Cargue</label>
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
  selectedOrderId = '';
  selectedDriverId: number | null = null;
  selectedVehicleId: number | null = null;
  pesoBruto: number | undefined = undefined;
  pesoTotalCargue: number = 0;
  selectedOrder: any = null;
  itemObservations: Record<number, string> = {};

  form = {
    dispatchNumber: '',
    orderNumber: '',
    dispatchDate: '',
    dispatchTime: '',
    driverName: '',
    driverDocument: '',
    driverPhone: '',
    vehiclePlate: '',
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

  cargarDespacho(resp: DispatchResponse) {
    this.form.dispatchNumber = resp.dispatchNumber;
    this.form.orderNumber = resp.orderNumber;
    this.form.status = resp.status as DispatchStatus;
    this.form.observations = resp.notes || '';
    this.selectedOrderId = String(resp.orderId);
    this.selectedDriverId = resp.driverId;
    this.selectedVehicleId = resp.vehicleId;

    if (resp.dispatchDate) {
      this.form.dispatchDate = resp.dispatchDate.split('T')[0];
    }

    const order = this.orderService.orders().find(o => o.id === String(resp.orderId));
    if (order) {
      this.selectedOrder = order;
      this.form.route = `${order.city} - ${order.address}`;
      this.pesoBruto = order.pesoTotalKg;
      this.pesoTotalCargue = order.pesoTotalKg;
      this.itemObservations = {};
      for (const item of order.items) {
        if (item.observation) {
          this.itemObservations[item.productId] = item.observation;
        }
      }
    }

    this.onDriverChange();
    this.onVehicleChange();
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
    const order = this.orderService.orders().find(o => o.id === this.selectedOrderId);
    if (order) {
      this.selectedOrder = order;
      this.form.orderNumber = order.orderNumber;
      this.form.route = `${order.city} - ${order.address}`;
      if (order.dispatchDate) this.form.dispatchDate = order.dispatchDate;
      if (order.dispatchTime) this.form.dispatchTime = order.dispatchTime;
      this.pesoBruto = order.pesoTotalKg;
      this.pesoTotalCargue = order.pesoTotalKg;
      this.itemObservations = {};
      for (const item of order.items) {
        if (item.observation) {
          this.itemObservations[item.productId] = item.observation;
        }
      }

      const driver = this.driverService.drivers().find(d =>
        d.document === order.driverDocument ||
        d.name.includes((order.driverName || '').split(' ')[0])
      );
      if (driver) {
        this.selectedDriverId = driver.id;
        this.onDriverChange();
      } else if (order.driverName) {
        this.form.driverName = order.driverName;
        this.form.driverDocument = order.driverDocument || '';
        this.form.driverPhone = order.driverPhone || '';
      }
      const vehicle = this.vehicleService.vehicles().find(v => v.plate === order.vehicle);
      if (vehicle) {
        this.selectedVehicleId = vehicle.id;
        this.onVehicleChange();
      }
    } else {
      this.selectedOrder = null;
      this.form.orderNumber = '';
    }
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
      this.form.vehiclePlate = '';
      this.form.vehicleType = '';
      return;
    }
    const vehicle = this.vehicleService.vehicles().find(v => v.id === this.selectedVehicleId);
    if (vehicle) {
      this.form.vehiclePlate = vehicle.plate;
    }
  }

  esValido(): boolean {
    return (
      !!this.selectedOrderId &&
      !!this.selectedDriverId &&
      !!this.selectedVehicleId
    );
  }

  guardar() {
    if (!this.esValido()) return;

    const details = (this.selectedOrder?.items || []).map((item: any) => ({
      productId: item.productId,
      quantity: item.bulto || 0,
      delivered: 0,
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

    const payload = {
      orderId: Number(this.selectedOrderId),
      driverId: Number(this.selectedDriverId),
      vehicleId: Number(this.selectedVehicleId),
      userId: this.authService.currentUser()?.id ?? null,
      dispatchNumber: this.form.dispatchNumber,
      dispatchDate: dispatchDateStr,
      status: this.form.status,
      notes: obsParts.join(' | '),
      details
    };

    const request = this.editId
      ? this.dispatchService.update(this.editId, payload)
      : this.dispatchService.create(payload);

    request.subscribe({
      next: () => {
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
