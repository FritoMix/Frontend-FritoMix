import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DispatchService } from '../../core/services/dispatch.service';
import { OrderService } from '../../core/services/order.service';
import { DriverService } from '../../core/services/driver.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { UserService } from '../../core/services/user.service';
import { ChecklistItem, DispatchStatus } from '../../core/models/dispatch.model';

@Component({
  selector: 'app-dispatch-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--green">11.</span>
        <div>
          <h1 class="text-2xl font-extrabold text-[#071938]">Confirmación de Despacho</h1>
          <nav class="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
            <a routerLink="/despachos" class="text-[#0055FF] hover:underline">Confirmar Despacho</a>
            <span>/</span>
            <span class="text-gray-700 font-semibold">{{ form.dispatchNumber || 'DES-XXXXX' }}</span>
          </nav>
        </div>
      </div>
    </div>

    <!-- Información del Despacho -->
    <div class="fm-card p-6 mb-5">
      <h3 class="font-bold text-[#071938] text-base mb-5">Información del Despacho</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">Pedido</label>
          <select
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
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">Fecha</label>
          <div class="relative">
            <input
              type="date"
              [(ngModel)]="form.dispatchDate"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">Despachador</label>
          <select
            [(ngModel)]="form.approvedBy"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
          >
            <option value="">Seleccione despachador</option>
            @for (u of coordinadores(); track u.id) {
              <option [value]="u.name">{{ u.name }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">Estado</label>
          <span class="status-badge bg-teal-50 text-teal-700 border-teal-200 text-xs font-bold">LISTO PARA DESPACHO</span>
        </div>
      </div>
    </div>

    <!-- Detalle de Productos -->
    <div class="fm-card p-6 mb-5">
      <h3 class="font-bold text-[#071938] text-base mb-5">Detalle de Productos</h3>
      <div class="overflow-x-auto">
        <table class="fm-table">
          <thead>
            <tr class="bg-gray-50/60">
              <th>Producto</th>
              <th>Cant. Despachada</th>
              <th>Lote</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            @if (selectedOrder) {
              @for (item of selectedOrder.items; track item.item; let i = $index) {
                <tr>
                  <td>
                    <span
                      class="code-badge"
                      [class]="productBadgeClass(i)"
                    >PR-{{ (100 + item.item).toString() }}</span>
                  </td>
                  <td>
                    <span class="font-semibold text-[#071938]">{{ (item.bulto || 0) * (item.caja || 0) || item.bulto || 0 }}</span>
                  </td>
                  <td>
                    <span class="text-gray-600 text-sm font-mono">{{ getLotCode(item.lot, item.item) }}</span>
                  </td>
                  <td>
                    <span class="text-gray-400 text-sm">{{ item.observation || '-' }}</span>
                  </td>
                </tr>
              }
            } @else {
              <tr>
                <td colspan="4" class="py-10 text-center">
                  <p class="text-sm text-gray-400">Selecciona un pedido para ver los productos</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer: Conductor, Vehículo, Peso Bruto, Confirmar -->
    <div class="fm-card p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">Conductor</label>
          <select
            [(ngModel)]="selectedDriverId"
            (ngModelChange)="onDriverChange()"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
          >
            <option value="">Seleccionar conductor</option>
            @for (dr of driverService.drivers().filter(d => d.active); track dr.id) {
              <option [value]="dr.id">{{ dr.fullName }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">Vehículo</label>
          <select
            [(ngModel)]="selectedVehicleId"
            (ngModelChange)="onVehicleChange()"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
          >
            <option value="">Seleccionar vehículo</option>
            @for (v of vehicleService.vehicles().filter(veh => veh.active); track v.id) {
              <option [value]="v.id">{{ v.brand }} {{ v.model }} - {{ v.plate }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">Peso Bruto (kg)</label>
          <div class="flex items-center gap-2">
            <input
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
        <div class="flex justify-end">
          <button
            type="button"
            (click)="guardar()"
            [disabled]="!esValido()"
            class="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Confirmar Despacho
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
  userService = inject(UserService);
  router = inject(Router);

  selectedOrderId = '';
  selectedDriverId = '';
  selectedVehicleId = '';
  pesoBruto: number | undefined = undefined;
  selectedOrder: any = null;

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
    observations: '',
    approvedBy: ''
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

  private readonly productBadgeColors = [
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-amber-50 text-amber-700 border-amber-200',
    'bg-green-50 text-green-700 border-green-200',
    'bg-purple-50 text-purple-700 border-purple-200',
    'bg-rose-50 text-rose-700 border-rose-200',
    'bg-cyan-50 text-cyan-700 border-cyan-200',
  ];

  constructor() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const hh = String(today.getHours()).padStart(2, '0');
    const mi = String(today.getMinutes()).padStart(2, '0');
    this.form.dispatchDate = `${yyyy}-${mm}-${dd}`;
    this.form.dispatchTime = `${hh}:${mi}`;
    this.generarNumeroDespacho();
  }

  getLotCode(itemLot?: string, itemNum?: number): string {
    if (itemLot) return itemLot;
    const dateFormatted = this.form.dispatchDate ? this.form.dispatchDate.replace(/-/g, '') : '20260725';
    const numFormatted = String(itemNum || 1).padStart(3, '0');
    return `L-${dateFormatted}-${numFormatted}`;
  }

  coordinadores() {
    return this.userService.users().filter(u =>
      u.role === 'coordinador' || u.role === 'admin' || u.role === 'contador'
    );
  }

  generarNumeroDespacho() {
    const n = this.dispatchService.dispatches().length + 1;
    this.form.dispatchNumber = 'DES-' + String(n).padStart(5, '0');
  }

  productBadgeClass(index: number): string {
    return this.productBadgeColors[index % this.productBadgeColors.length];
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

      const driver = this.driverService.drivers().find(d =>
        d.documentNumber === order.driverDocument ||
        d.fullName.includes(order.driverName.split(' ')[0])
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
    const driver = this.driverService.drivers().find(d => d.id === this.selectedDriverId);
    if (driver) {
      this.form.driverName = driver.fullName;
      this.form.driverDocument = driver.documentNumber;
      this.form.driverPhone = driver.phone;
    } else {
      this.form.driverName = '';
      this.form.driverDocument = '';
      this.form.driverPhone = '';
    }
  }

  onVehicleChange() {
    const vehicle = this.vehicleService.vehicles().find(v => v.id === this.selectedVehicleId);
    if (vehicle) {
      this.form.vehiclePlate = vehicle.plate;
      this.form.vehicleType = vehicle.vehicleType;
    } else {
      this.form.vehiclePlate = '';
      this.form.vehicleType = '';
    }
  }

  esValido(): boolean {
    return (
      this.form.orderNumber.trim().length > 0 &&
      this.form.driverName.trim().length > 0 &&
      this.form.vehiclePlate.trim().length > 0
    );
  }

  guardar() {
    if (!this.esValido()) return;

    this.dispatchService.addDispatch({
      dispatchNumber: this.form.dispatchNumber,
      orderNumber: this.form.orderNumber,
      dispatchDate: this.form.dispatchDate,
      dispatchTime: this.form.dispatchTime,
      driverName: this.form.driverName,
      driverDocument: this.form.driverDocument,
      driverPhone: this.form.driverPhone,
      vehiclePlate: this.form.vehiclePlate,
      vehicleType: this.form.vehicleType,
      helperName: this.form.helperName.trim() || undefined,
      route: this.form.route.trim(),
      estimatedArrival: this.form.estimatedArrival || '',
      checklist: this.checklist.map(c => ({
        name: c.name,
        checked: c.checked,
        observations: c.observations && c.observations.trim().length > 0 ? c.observations.trim() : undefined
      })),
      status: this.form.status,
      departureKm: this.form.departureKm,
      arrivalKm: this.form.arrivalKm,
      fuelLiters: this.form.fuelLiters,
      observations: this.form.observations.trim() || undefined,
      createdBy: 'Usuario actual',
      approvedBy: this.form.approvedBy.trim() || undefined
    });

    this.router.navigate(['/despachos']);
  }
}
