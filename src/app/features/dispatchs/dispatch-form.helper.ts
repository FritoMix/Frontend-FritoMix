import {
  ChecklistItem,
  CreateArrumeRequest,
  CreateDispatchRequest,
  DispatchPreviewItem,
  DispatchStatus,
} from '../../core/models/dispatch.model';
import { Order } from '../../core/models/order.model';

export type TipoPedido = 'pedido_unico' | 'pedido_multipedido';

export interface DispatchFormState {
  tipoPedido: '' | TipoPedido;
  selectedOrderId: string;
  selectedOrderIds: string[];
  selectedDriverId: number | null;
  selectedVehicleId: number | null;
  numeroFactura: string;
  facturasPorPedido: Record<string, string>;
  itemDelivered: Record<number, number>;
  itemObservations: Record<number, string>;
  form: {
    dispatchNumber: string;
    dispatchDate: string;
    dispatchTime: string;
    status: DispatchStatus;
    observations: string;
  };
  checklist: ChecklistItem[];
  arrumes: CreateArrumeRequest[];
  userId: number | null;
}

export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export function orderWeight(o: Order): number {
  return round2(
    (o.items ?? []).reduce((s, it) => s + ((it.pesoUnidad ?? 0) * (it.bulto ?? 0)), 0)
  );
}

export function orderDimension(o: Order): number {
  return round2(
    (o.items ?? []).reduce((s, it) => s + ((it.dimension ?? 0) * (it.bulto ?? 0)), 0)
  );
}

export function aggregateItems(
  isUnico: boolean,
  selectedOrder: Order | null,
  previewRows: Order[]
): DispatchPreviewItem[] {
  if (isUnico) {
    const order = selectedOrder;
    return (order?.items ?? []).map((it) => ({
      productId: it.productId,
      description: it.description,
      lot: it.lot,
      qty: it.bulto || 0,
    }));
  }
  const map = new Map<number, DispatchPreviewItem>();
  for (const order of previewRows) {
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

export function validateDispatchForm(state: DispatchFormState): string | null {
  if (!state.tipoPedido) return 'Debes seleccionar un tipo de pedido.';
  if (!state.selectedDriverId || !state.selectedVehicleId) {
    return state.tipoPedido === 'pedido_unico'
      ? 'Debes seleccionar un pedido, conductor y vehículo.'
      : 'Debes agregar al menos un cliente (pedido), un conductor y un vehículo.';
  }
  if (state.tipoPedido === 'pedido_unico' && !state.selectedOrderId) {
    return 'Debes seleccionar un pedido, conductor y vehículo.';
  }
  if (state.tipoPedido === 'pedido_multipedido' && state.selectedOrderIds.length < 1) {
    return 'Debes agregar al menos un cliente (pedido), un conductor y un vehículo.';
  }
  return null;
}

export function buildDispatchPayload(state: DispatchFormState, items: DispatchPreviewItem[]): CreateDispatchRequest {
  const details = items.map((item) => ({
    productId: item.productId,
    quantity: item.qty,
    delivered: state.itemDelivered[item.productId] ?? item.qty,
    observations: state.itemObservations[item.productId] || '',
  }));

  const obsParts: string[] = [];
  if (state.form.observations) obsParts.push(state.form.observations);
  for (const c of state.checklist) {
    if (!c.checked) obsParts.push(`Checklist pendiente: ${c.name}`);
  }

  const dispatchDateStr = state.form.dispatchDate
    ? `${state.form.dispatchDate}T${state.form.dispatchTime || '00:00'}:00`
    : new Date().toISOString();

  const orderIds = state.tipoPedido === 'pedido_multipedido'
    ? state.selectedOrderIds.map(Number)
    : [Number(state.selectedOrderId)];

  const arrumes = state.arrumes
    .filter((a) => a.arrumeProducto || a.numArrume || a.cantidad != null || a.lote)
    .map((a) => ({
      numArrume: a.numArrume ?? null,
      arrumeProducto: a.arrumeProducto || '',
      cantidad: a.cantidad ?? null,
      lote: a.lote || '',
    }));

  const orderFacturas = state.tipoPedido === 'pedido_multipedido'
    ? Object.entries(state.facturasPorPedido)
        .filter((entry) => !!entry[1] && entry[1].trim() !== '')
        .map(([orderId, fact]) => ({ orderId: Number(orderId), numeroFactura: fact.trim() }))
    : undefined;

  return {
    tipoPedido: state.tipoPedido,
    orderIds,
    driverId: Number(state.selectedDriverId),
    vehicleId: Number(state.selectedVehicleId),
    userId: state.userId,
    dispatchNumber: state.form.dispatchNumber,
    dispatchDate: dispatchDateStr,
    status: state.form.status,
    notes: obsParts.join(' | '),
    details,
    arrumes,
    numeroFactura: state.tipoPedido === 'pedido_unico' && state.numeroFactura.trim()
      ? state.numeroFactura.trim()
      : undefined,
    orderFacturas: orderFacturas && orderFacturas.length > 0 ? orderFacturas : undefined,
  };
}