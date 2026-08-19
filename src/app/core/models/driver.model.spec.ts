import { describe, expect, it } from 'vitest';
import { toDriverDisplay } from './driver.model';
import type { DriverResponse } from './driver.model';

describe('toDriverDisplay', () => {
  it('mapea la respuesta del backend al modelo de la vista', () => {
    const resp: DriverResponse = {
      id: 3,
      document: '1010123456',
      name: 'Juan Carlos Rodríguez',
      phone: '3109876543',
      licenseNumber: 'LIC-002',
      active: true,
      createdAt: '2026-08-10T10:00:00',
    };

    const display = toDriverDisplay(resp);

    expect(display.name).toBe('Juan Carlos Rodríguez');
    expect(display.licenseNumber).toBe('LIC-002');
    expect(display.avatarInitials).toBe('JC');
  });

  it('genera iniciales con un solo nombre', () => {
    const resp: DriverResponse = {
      id: 4,
      document: '1010123457',
      name: 'María',
      phone: '',
      licenseNumber: 'LIC-003',
      active: true,
      createdAt: '2026-08-10T10:00:00',
    };

    expect(toDriverDisplay(resp).avatarInitials).toBe('M');
  });
});