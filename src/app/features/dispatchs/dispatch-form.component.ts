import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DispatchService } from '../../core/services/dispatch.service';
import { OrderService } from '../../core/services/order.service';
import { DriverService } from '../../core/services/driver.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { ProductService } from '../../core/services/product.service';
import { ChecklistItem, DispatchStatus, DispatchResponse, DispatchPreviewItem, CreateArrumeRequest } from '../../core/models/dispatch.model';
import { Order } from '../../core/models/order.model';
import { AuthService } from '../../core/services/auth.service';
import { DispatchArrumesFormComponent } from './dispatch-arrumes-form.component';
import { DispatchProductsDetailComponent } from './dispatch-products-detail.component';

type TipoPedido = 'pedido_unico' | 'pedido_multipedido';

@Component({
  selector: 'app-dispatch-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DispatchArrumesFormComponent, DispatchProductsDetailComponent],
  templateUrl: 'dispatch-form.component.html'
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

  aggregatedItems(): DispatchPreviewItem[] {
    if (this.isUnico()) {
      const order = this.selectedOrder;
      return (order?.items ?? []).map((it) => ({
        productId: it.productId,
        description: it.description,
        lot: it.lot,
        qty: it.bulto || 0
      }));
    }
    const map = new Map<number, DispatchPreviewItem>();
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
      let delivered: Record<number, number> = {};
      let observations: Record<number, string> = {};
      for (const d of resp.details) {
        if (d.delivered != null) delivered[d.productId] = d.delivered;
        if (d.observations) observations[d.productId] = d.observations;
      }
      this.itemDelivered = delivered;
      this.itemObservations = observations;
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