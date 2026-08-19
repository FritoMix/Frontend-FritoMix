import { describe, expect, it } from 'vitest';
import { toProductDisplay } from './product.model';
import type { ProductResponse } from './product.model';

describe('toProductDisplay', () => {
  it('mapea la respuesta del backend al modelo de la vista', () => {
    const resp: ProductResponse = {
      id: 11,
      code: 'PROD-011',
      name: 'Papas Criollas',
      description: 'Bulto de 50kg',
      unit: 'BULTO',
      active: true,
      presentation: 1,
      weight: '50 kg',
      weightGrams: 50000,
      categoryId: 1,
      categoryName: 'Víveres',
      pesoUnidad: 50,
      dimension: 1,
      pesoTotalCargue: 50,
      createdAt: '2026-08-10T10:00:00',
    };

    const display = toProductDisplay(resp);

    expect(display.code).toBe('PROD-011');
    expect(display.name).toBe('Papas Criollas');
    expect(display.categoryName).toBe('Víveres');
    expect(display.weightGrams).toBe(50000);
    expect(display.pesoUnidad).toBe(50);
    expect(display.active).toBe(true);
  });
});