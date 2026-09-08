import { describe, expect, it } from 'vitest';
import { nextDispatchStatus, toDispatchDisplay } from './dispatch.model';
import type { DispatchResponse } from './dispatch.model';

describe('nextDispatchStatus', () => {
  it('avanza un paso en el flujo de despacho de 3 pasos', () => {
    expect(nextDispatchStatus('PENDIENTE')).toBe('VEHICULO_ASIGNADO');
    expect(nextDispatchStatus('VEHICULO_ASIGNADO')).toBe('CONDUCTOR_ASIGNADO');
    expect(nextDispatchStatus('CONDUCTOR_ASIGNADO')).toBe('DESPACHADO');
  });

  it('devuelve null al estar en el último estado', () => {
    expect(nextDispatchStatus('DESPACHADO')).toBeNull();
  });

  it('devuelve null en estados legados que ya no avanzan', () => {
    expect(nextDispatchStatus('ELABORACION')).toBeNull();
    expect(nextDispatchStatus('PRODUCCION')).toBeNull();
    expect(nextDispatchStatus('LISTO_CARGUE')).toBeNull();
  });

  it('devuelve null ante un estado desconocido', () => {
    expect(nextDispatchStatus('INVENTADO' as never)).toBeNull();
  });
});

describe('toDispatchDisplay', () => {
  it('mapea la respuesta del backend al modelo de la vista', () => {
    const resp: DispatchResponse = {
      id: 42,
      dispatchNumber: 'DESP-0001',
      tipoPedido: 'multipedido',
      orders: [
        { id: 1, orderNumber: 'PED-0001', clientName: 'Cliente A', pesoTotalCargue: 10 },
        { id: 2, orderNumber: 'PED-0002', clientName: 'Cliente B', pesoTotalCargue: 20 },
      ],
      orderId: 1,
      orderNumber: 'PED-0001',
      pesoTotal: 30,
      totalDimension: null,
      pesoTotalCargue: 30,
      driverId: 7,
      driverName: 'Juan Pérez',
      driverDocument: '123',
      vehicleId: 9,
      vehicleNumber: 'XYZ-123',
      vehicleType: 'camion',
      dispatchDate: '2026-08-12T14:30:00',
      status: 'ELABORACION',
      notes: '',
      details: [],
      arrumes: [],
      createdAt: '2026-08-12T14:30:00',
    };

    const display = toDispatchDisplay(resp);

    expect(display.clientes).toBe('Cliente A, Cliente B');
    expect(display.orderNumber).toBe('PED-0001');
    expect(display.id).toBe('42');
    expect(display.dispatchDate).toBe('2026-08-12');
    expect(display.status).toBe('ELABORACION');
  });
});