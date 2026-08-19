import { describe, expect, it } from 'vitest';
import {
  aggregateItems,
  buildDispatchPayload,
  orderDimension,
  orderWeight,
  round2,
  validateDispatchForm,
} from './dispatch-form.helper';
import type { DispatchFormState } from './dispatch-form.helper';
import type { Order } from '../../core/models/order.model';

const baseState: DispatchFormState = {
  tipoPedido: 'pedido_unico',
  selectedOrderId: '5',
  selectedOrderIds: [],
  selectedDriverId: 1,
  selectedVehicleId: 2,
  numeroFactura: 'FAC-001',
  facturasPorPedido: {},
  itemDelivered: {},
  itemObservations: {},
  form: {
    dispatchNumber: 'DES-2608181200',
    dispatchDate: '2026-08-18',
    dispatchTime: '14:30',
    status: 'PENDIENTE',
    observations: 'Entregar en la mañana',
  },
  checklist: [
    { name: 'Documentos OK', checked: true },
    { name: 'Carga asegurada', checked: false },
  ],
  arrumes: [{ numArrume: 1, arrumeProducto: 'Pacas', cantidad: 10, lote: 'L-1' }],
  userId: 7,
};

const order = (id: string, items: Order['items']): Order => ({
  id,
  orderNumber: `PED-${id}`,
  clientName: 'Cliente A',
  status: 'APROBADO',
  dispatchDate: '',
  items,
  city: 'Medellín',
  address: 'Calle 1',
} as Order);

describe('validateDispatchForm', () => {
  it('rechaza sin tipo de pedido', () => {
    expect(validateDispatchForm({ ...baseState, tipoPedido: '' })).toContain('tipo de pedido');
  });

  it('rechaza sin conductor o vehículo', () => {
    expect(validateDispatchForm({ ...baseState, selectedDriverId: null })).toContain('conductor');
  });

  it('rechaza pedido único sin pedido seleccionado', () => {
    expect(validateDispatchForm({ ...baseState, selectedOrderId: '' })).toBeTruthy();
  });

  it('rechaza multipedido sin pedidos', () => {
    expect(validateDispatchForm({
      ...baseState,
      tipoPedido: 'pedido_multipedido',
      selectedOrderIds: [],
    })).toContain('cliente');
  });

  it('acepta un formulario válido', () => {
    expect(validateDispatchForm(baseState)).toBeNull();
    expect(validateDispatchForm({
      ...baseState,
      tipoPedido: 'pedido_multipedido',
      selectedOrderId: '',
      selectedOrderIds: ['1', '2'],
    })).toBeNull();
  });
});

describe('aggregateItems', () => {
  const o1 = order('1', [
    { productId: 10, description: 'Papas', bulto: 3, pesoUnidad: 50, dimension: 1 },
    { productId: 11, description: 'Chicharrón', bulto: 2 },
  ]);
  const o2 = order('2', [
    { productId: 10, description: 'Papas', bulto: 4 },
  ]);

  it('agrupa por producto en multipedido', () => {
    const items = aggregateItems(false, null, [o1, o2]);
    expect(items).toHaveLength(2);
    expect(items.find(i => i.productId === 10)?.qty).toBe(7);
    expect(items.find(i => i.productId === 11)?.qty).toBe(2);
  });

  it('devuelve los items del pedido seleccionado en único', () => {
    const items = aggregateItems(true, o1, []);
    expect(items).toHaveLength(2);
    expect(items[0].qty).toBe(3);
  });
});

describe('pesos y dimensiones', () => {
  const o = order('1', [
    { productId: 10, description: 'Papas', bulto: 3, pesoUnidad: 50.123, dimension: 1.5 },
    { productId: 11, description: 'Yuca', bulto: 2, pesoUnidad: 10, dimension: 0.5 },
  ]);

  it('calcula peso total redondeado', () => {
    expect(orderWeight(o)).toBe(170.37);
  });

  it('calcula dimensión total redondeada', () => {
    expect(orderDimension(o)).toBe(5.5);
  });

  it('redondea a 2 decimales', () => {
    expect(round2(3.14159)).toBe(3.14);
  });
});

describe('buildDispatchPayload', () => {
  it('construye el payload con datos del estado', () => {
    const payload = buildDispatchPayload(baseState, [
      { productId: 10, description: 'Papas', qty: 3 },
    ]);

    expect(payload.dispatchNumber).toBe('DES-2608181200');
    expect(payload.orderIds).toEqual([5]);
    expect(payload.driverId).toBe(1);
    expect(payload.vehicleId).toBe(2);
    expect(payload.userId).toBe(7);
    expect(payload.dispatchDate).toBe('2026-08-18T14:30:00');
    expect(payload.notes).toContain('Entregar en la mañana');
    expect(payload.notes).toContain('Checklist pendiente: Carga asegurada');
    expect(payload.details[0].quantity).toBe(3);
    expect(payload.details[0].delivered).toBe(3);
    expect(payload.arrumes).toHaveLength(1);
    expect(payload.numeroFactura).toBe('FAC-001');
  });

  it('arma orderFacturas solo con facturas no vacías', () => {
    const state = {
      ...baseState,
      tipoPedido: 'pedido_multipedido' as const,
      selectedOrderIds: ['1', '2'],
      facturasPorPedido: { '1': 'FAC-A', '2': '  ' },
    };
    const payload = buildDispatchPayload(state, []);
    expect(payload.orderFacturas).toEqual([{ orderId: 1, numeroFactura: 'FAC-A' }]);
  });

  it('incluye delivered personalizado por producto', () => {
    const state = { ...baseState, itemDelivered: { 10: 1 } };
    const payload = buildDispatchPayload(state, [{ productId: 10, description: 'Papas', qty: 3 }]);
    expect(payload.details[0].delivered).toBe(1);
  });
});