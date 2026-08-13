import { describe, expect, it } from 'vitest';
import { toOrderDisplay } from './order.model';
import type { OrderResponse } from './order.model';

describe('toOrderDisplay', () => {
  it('mapea la respuesta del backend al modelo de la vista', () => {
    const resp: OrderResponse = {
      id: 12,
      orderNumber: 'PED-0042',
      customerId: 3,
      customerName: 'Cliente A',
      customerDocument: '900123456',
      orderDate: '2026-08-12T10:00:00',
      status: 'APROBADO',
      total: 5.6,
      pesoTotalCargue: 250.5,
      notes: '',
      details: [
        { id: 1, productId: 10, productName: 'Papas', productCode: 'P-01', quantity: 2.5 },
        { id: 2, productId: 11, productName: 'Chicharrón', productCode: 'P-02', quantity: 3.1 },
      ],
      createdAt: '2026-08-12T10:00:00',
    };

    const display = toOrderDisplay(resp);

    expect(display.clientName).toBe('Cliente A');
    expect(display.status).toBe('APROBADO');
    expect(display.totalBultos).toBe(5);
    expect(display.pesoTotalKg).toBe(250.5);
    expect(display.items).toHaveLength(2);
    expect(display.items[0].bulto).toBe(2);
    expect(display.items[1].bulto).toBe(3);
    expect(display.items[0].lot).toBe('P-01');
  });
});