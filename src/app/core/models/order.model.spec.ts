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

  it('muestra el peso total real (pesoTotalCargue) de un pedido de producción real', () => {
    const resp: OrderResponse = {
      id: 1,
      orderNumber: 'PED-00001',
      customerId: 1,
      customerName: 'AMARILES LOPEZ LEIDY MARIEN',
      customerDocument: '42032121-3',
      orderDate: '2026-09-03T11:36:56.637934',
      status: 'LISTO_PRODUCCION',
      total: 802,
      pesoTotalCargue: 5411.4,
      notes: '',
      details: [
        { id: 1, productId: 33, productName: 'AGUA GAS 600ML 12 UNIDADES', productCode: '33', quantity: 2, pesoUnidad: 12.7 },
        { id: 2, productId: 32, productName: 'AGUA NORMAL 600ML 12 UNIDADES', productCode: '32', quantity: 100, pesoUnidad: 12.7 },
        { id: 3, productId: 19, productName: 'GASEOSA KOLA NEGRA 1,7ML 6 UNIDADES', productCode: '19', quantity: 100, pesoUnidad: 10.8 },
        { id: 4, productId: 23, productName: 'GASEOSA KOLA ROJA 250ML 24 UNIDADES', productCode: '23', quantity: 100, pesoUnidad: 6.6 },
        { id: 5, productId: 27, productName: 'POTATOS SURTIDO LS 35G 17UND', productCode: '27', quantity: 100, pesoUnidad: 0.88 },
        { id: 6, productId: 21, productName: 'RULASS NATURAL PRO LS 20G 12UD 12DIS', productCode: '21', quantity: 100, pesoUnidad: 5.72 },
        { id: 7, productId: 20, productName: 'RULASS POLLO PRO LS 20G 12UD 12DIS', productCode: '20', quantity: 100, pesoUnidad: 5.72 },
        { id: 8, productId: 22, productName: 'RULASS QUESO PRO LS 20G 12UD 12DIS', productCode: '22', quantity: 100, pesoUnidad: 5.72 },
        { id: 9, productId: 2, productName: 'RULASS LIMON PRO LS 20G 12UD 12DIS', productCode: '2', quantity: 100, pesoUnidad: 5.72 },
      ],
      createdAt: '2026-09-03T11:36:56.637934',
    };

    const display = toOrderDisplay(resp);

    expect(display.pesoTotalKg).toBe(5411.4);
    expect(display.items.reduce((s, it) => s + (it.pesoUnidad ?? 0) * it.bulto, 0)).toBe(5411.4);
  });
});