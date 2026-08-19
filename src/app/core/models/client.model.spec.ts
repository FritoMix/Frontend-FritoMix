import { describe, expect, it } from 'vitest';
import { toClientDisplay } from './client.model';
import type { ClientResponse } from './client.model';

describe('toClientDisplay', () => {
  it('mapea la respuesta del backend al modelo de la vista', () => {
    const resp: ClientResponse = {
      id: 7,
      code: 'CLI-007',
      document: '900123456',
      businessName: 'Distribuciones Andinas SAS',
      contactName: 'Carlos Pérez',
      phone: '3001234567',
      email: 'carlos@andinas.co',
      active: true,
      address: 'Calle 10 #20-30',
      cityId: 5,
      cityName: 'Medellín',
      departmentId: 2,
      departmentName: 'Antioquia',
      createdAt: '2026-08-10T10:00:00',
    };

    const display = toClientDisplay(resp);

    expect(display.businessName).toBe('Distribuciones Andinas SAS');
    expect(display.document).toBe('900123456');
    expect(display.cityName).toBe('Medellín');
    expect(display.departmentName).toBe('Antioquia');
    expect(display.active).toBe(true);
    expect(display.phone).toBe('3001234567');
  });
});