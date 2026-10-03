import { describe, expect, it } from 'vitest';
import { mapRole, toUserDisplay } from './user.model';
import type { UserResponse } from './user.model';

describe('mapRole', () => {
  it('combierte roles del backend a roles locales', () => {
    expect(mapRole('ADMIN')).toBe('admin');
    expect(mapRole('CARTERA')).toBe('cartera');
    expect(mapRole('COORDINADOR')).toBe('coordinador');
    expect(mapRole('DESPACHADOR')).toBe('despachador');
    expect(mapRole('PRODUCCION')).toBe('produccion');
    expect(mapRole('CAMARA')).toBe('camara');
    expect(mapRole('FACTURACION')).toBe('facturacion');
    expect(mapRole('DESPACHADOR1')).toBe('despachador1');
    expect(mapRole('DESPACHADOR2')).toBe('despachador2');
    expect(mapRole('DESPACHADOR3')).toBe('despachador3');
  });

  it('devuelve el rol en minusculas para valores desconocidos', () => {
    expect(mapRole('INVENTADO')).toBe('inventado');
  });
});

describe('toUserDisplay', () => {
  it('calcula nombre, iniciales y rol del usuario', () => {
    const resp: UserResponse = {
      id: 1,
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana@fritomix.co',
      role: 'COORDINADOR',
      enabled: true,
      accountNonLocked: true,
      accountNonExpired: true,
      credentialsNonExpired: true,
      lastLogin: '2026-09-01T08:00:00',
      createdAt: '2026-08-01T08:00:00',
      updatedAt: '2026-09-01T08:00:00',
    };

    const display = toUserDisplay(resp);

    expect(display.name).toBe('Ana García');
    expect(display.avatarInitials).toBe('AG');
    expect(display.role).toBe('coordinador');
    expect(display.enabled).toBe(true);
  });

  it('usa placeholder para iniciales cuando falta apellido', () => {
    const resp: UserResponse = {
      id: 2,
      firstName: 'Luis',
      lastName: '',
      email: 'luis@fritomix.co',
      role: 'ADMIN',
      enabled: true,
      accountNonLocked: true,
      accountNonExpired: true,
      credentialsNonExpired: true,
      lastLogin: null,
      createdAt: '2026-08-01T08:00:00',
      updatedAt: '2026-08-01T08:00:00',
    };

    const display = toUserDisplay(resp);

    expect(display.name).toBe('Luis');
    expect(display.avatarInitials).toBe('L');
  });
});