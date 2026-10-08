import { describe, expect, it } from 'vitest';
import { roleLabel, roleBadgeClass, roleSoftClass } from './role-theme';

describe('roleLabel', () => {
  it('mapea cada rol a su etiqueta en espanol', () => {
    expect(roleLabel('admin')).toBe('Administrador');
    expect(roleLabel('cartera')).toBe('Cartera');
    expect(roleLabel('coordinador')).toBe('Coordinador');
    expect(roleLabel('despachador')).toBe('Despachador');
    expect(roleLabel('produccion')).toBe('Producción');
    expect(roleLabel('camara')).toBe('Cámara');
    expect(roleLabel('facturacion')).toBe('Facturación');
    expect(roleLabel('despachador1')).toBe('Despachador 1');
    expect(roleLabel('despachador2')).toBe('Despachador 2');
    expect(roleLabel('despachador3')).toBe('Despachador 3');
  });

  it('devuelve el valor crudo para roles desconocidos', () => {
    expect(roleLabel('ROLE_INVENTADO' as never)).toBe('ROLE_INVENTADO');
  });
});

describe('roleBadgeClass', () => {
  it('usa clases con borde para listados', () => {
    expect(roleBadgeClass('admin')).toBe('bg-red-50 text-red-700 border-red-200');
    expect(roleBadgeClass('despachador2')).toBe('bg-pink-50 text-pink-700 border-pink-200');
  });

  it('usa una clase neutra para roles desconocidos', () => {
    expect(roleBadgeClass('x' as never)).toBe('bg-gray-100 text-gray-700 border-gray-200');
  });
});

describe('roleSoftClass', () => {
  it('usa clases suaves sin borde para tarjetas', () => {
    expect(roleSoftClass('admin')).toBe('bg-red-100 text-red-700');
    expect(roleSoftClass('despachador3')).toBe('bg-orange-100 text-orange-700');
  });

  it('usa una clase neutra para roles desconocidos', () => {
    expect(roleSoftClass('x' as never)).toBe('bg-gray-100 text-gray-700');
  });
});