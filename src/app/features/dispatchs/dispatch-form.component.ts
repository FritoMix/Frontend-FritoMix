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
import { DispatchArrumesFormComponent } from './dispatch-arrumes-form.component';
import { DispatchProductsDetailComponent } from './dispatch-products-detail.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ToastService } from '../../core/services/toast.service';
import {
  aggregateItems,
  buildDispatchPayload,
  orderDimension,
  orderWeight,
  round2,
  validateDispatchForm,
  TipoPedido,
} from './dispatch-form.helper';

@Component({
  selector: 'app-dispatch-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DispatchArrumesFormComponent, DispatchProductsDetailComponent, ConfirmDialogComponent],
  templateUrl: 'dispatch-form.component.html'
})
export class DispatchFormComponent {
  dispatchService = inject(DispatchService);
  orderService = inject(OrderService);
  driverService = inject(DriverService);
  vehicleService = inject(VehicleService);
  productService = inject(ProductService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  editId: number | null = null;
  tipoPedido: '' | TipoPedido = '';
  selectedOrderId = '';
  selectedOrderIds: string[] = [];
  numeroFactura = '';
  facturasPorPedido: Record<string, string> = {};
  selectedDriverId: number | null = null;

  selectedVehicleId: number | null = null;
  pesoTotalCargue = 0;
  totalDimension = 0;
  selectedOrder: Order | null = null;
  itemObservations: Record<number, string> = {};
  itemDelivered: Record<number, number> = {};
  arrumes = signal<CreateArrumeRequest[]>([]);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  errorDialog = signal<string>('');

  showMessage(msg: string, type: 'success' | 'error' = 'error') {
    this.message.set(msg);
    this.messageType.set(type);
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
    this.orderService.loadAll();
    this.driverService.loadAll();
    this.vehicleService.loadAll();
    this.productService.loadAll();
    this.dispatchService.loadAll();

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
      this.facturasPorPedido = {};
    } else {
      this.selectedOrderId = '';
      this.selectedOrder = null;
      this.numeroFactura = '';
    }
  }

  availableOrders(): Order[] {
    const dispatched = new Set<string>(
      this.orderService.items()
        .filter(o => !!o.dispatchDate)
        .map(o => o.id)
    );
    return this.orderService.items()
      .filter(o => o.status === 'APROBADO' && !dispatched.has(o.id));
  }

  previewRows(): Order[] {
    if (!this.isMulti()) return [];
    const map = new Map(this.orderService.items().map(o => [o.id, o]));
    return this.selectedOrderIds
      .map(id => map.get(id))
      .filter((o): o is Order => !!o);
  }

  toggleOrder(id: string) {
    if (this.selectedOrderIds.includes(id)) {
      this.selectedOrderIds = this.selectedOrderIds.filter(x => x !== id);
      delete this.facturasPorPedido[id];
    } else {
      this.selectedOrderIds = [...this.selectedOrderIds, id];
    }
    this.recalcWeight();
  }

  removeOrder(id: string) {
    this.selectedOrderIds = this.selectedOrderIds.filter(x => x !== id);
    delete this.facturasPorPedido[id];
    this.recalcWeight();
  }

  aggregatedItems() {
    return aggregateItems(this.isUnico(), this.selectedOrder, this.previewRows());
  }

  orderWeight(o: Order): number {
    return orderWeight(o);
  }

  orderDimension(o: Order): number {
    return orderDimension(o);
  }

  cargarDespacho(resp: DispatchResponse) {
    this.form.dispatchNumber = resp.dispatchNumber;
    this.form.orderNumber = resp.orderNumber;
    this.form.status = resp.status as DispatchStatus;
    this.form.observations = resp.notes || '';
    this.tipoPedido = (resp.tipoPedido || 'pedido_unico') as TipoPedido;
    this.selectedDriverId = resp.driverId;
    this.selectedVehicleId = resp.vehicleId;
    this.numeroFactura = resp.numeroFactura || '';

    this.facturasPorPedido = {};
    (resp.orders ?? []).forEach(o => {
      if (o.id && o.numeroFactura) {
        this.facturasPorPedido[String(o.id)] = o.numeroFactura;
      }
    });

    if (resp.dispatchDate) {
      this.form.dispatchDate = resp.dispatchDate.split('T')[0];
    }

    const orderList = this.orderService.items();
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
    if (resp.pesoTotal != null) this.pesoTotalCargue = round2(resp.pesoTotal);
    if (resp.totalDimension != null) this.totalDimension = round2(resp.totalDimension);
    this.onDriverChange();
    this.onVehicleChange();

    if (resp.details) {
      const delivered: Record<number, number> = {};
      const observations: Record<number, string> = {};
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
    const order = this.orderService.items().find(o => o.id === this.selectedOrderId) || null;
    this.selectedOrder = order;
    if (order) {
      this.form.orderNumber = order.orderNumber;
      this.form.route = `${order.city} - ${order.address}`;
      if (order.dispatchDate) this.form.dispatchDate = order.dispatchDate;
      if (order.dispatchTime) this.form.dispatchTime = order.dispatchTime;
      this.itemObservations = {};
      this.recalcWeight();

      const driver = this.driverService.items().find(d =>
        d.document === order.driverDocument ||
        d.name.includes((order.driverName || '').split(' ')[0])
      );
      if (driver) {
        this.selectedDriverId = driver.id;
        this.onDriverChange();
      }
      const vehicle = this.vehicleService.items().find(v => v.vehicleNumber === order.vehicle);
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
    if (this.isUnico()) {
      this.pesoTotalCargue = this.selectedOrder ? orderWeight(this.selectedOrder) : 0;
      this.totalDimension = this.selectedOrder ? orderDimension(this.selectedOrder) : 0;
    } else if (this.isMulti()) {
      const orders = this.previewRows();
      this.pesoTotalCargue = round2(orders.reduce((s, o) => s + orderWeight(o), 0));
      this.totalDimension = round2(orders.reduce((s, o) => s + orderDimension(o), 0));
    }
  }

  onDriverChange() {
    if (!this.selectedDriverId) {
      this.form.driverName = '';
      this.form.driverDocument = '';
      this.form.driverPhone = '';
      return;
    }
    const driver = this.driverService.items().find(d => d.id === this.selectedDriverId);
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
    const vehicle = this.vehicleService.items().find(v => v.id === this.selectedVehicleId);
    if (vehicle) {
      this.form.vehicleNumber = vehicle.vehicleNumber;
      this.form.vehicleType = vehicle.type;
    }
  }

  esValido(): boolean {
    return validateDispatchForm(this.dispatchState()) === null;
  }

  private dispatchState() {
    return {
      tipoPedido: this.tipoPedido,
      selectedOrderId: this.selectedOrderId,
      selectedOrderIds: this.selectedOrderIds,
      selectedDriverId: this.selectedDriverId,
      selectedVehicleId: this.selectedVehicleId,
      numeroFactura: this.numeroFactura,
      facturasPorPedido: this.facturasPorPedido,
      itemDelivered: this.itemDelivered,
      itemObservations: this.itemObservations,
      form: this.form,
      checklist: this.checklist,
      arrumes: this.arrumes(),
      userId: this.authService.currentUser()?.id ?? null,
    };
  }

  guardar() {
    const invalidMsg = validateDispatchForm(this.dispatchState());
    if (invalidMsg) {
      this.showMessage(invalidMsg);
      return;
    }

    const payload = buildDispatchPayload(this.dispatchState(), this.aggregatedItems());

    const request = this.editId
      ? this.dispatchService.update(this.editId, payload)
      : this.dispatchService.create(payload);

    request.subscribe({
      next: () => {
        this.orderService.loadAll();
        this.dispatchService.loadAll();
        this.toastService.success(this.editId ? 'Despacho actualizado exitosamente.' : 'Despacho creado exitosamente.');
        this.router.navigate(['/despachos']);
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Error al guardar el despacho. Verifica los datos e intenta de nuevo.';
        this.errorDialog.set(msg);
      }
    });
  }

}
