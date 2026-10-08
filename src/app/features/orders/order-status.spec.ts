import { describe, expect, it } from 'vitest';
import { orderStatusClass, orderStatusLabel, orderStatusColor } from './order-status';

describe('orderStatusClass', () => {
  it('mapea cada estado a clases tailwind', () => {
    expect(orderStatusClass('PENDIENTE')).toContain('bg-amber-50');
    expect(orderStatusClass('APROBADO')).toContain('bg-green-50');
    expect(orderStatusClass('CANCELADO')).toContain('bg-red-50');
    expect(orderStatusClass('EN_PRODUCCION')).toContain('bg-indigo-50');
    expect(orderStatusClass('LISTO_PRODUCCION')).toContain('bg-cyan-50');
  });

  it('usa clase neutra para estados desconocidos', () => {
    expect(orderStatusClass('DESCONOCIDO')).toBe('bg-gray-100 text-gray-700 border-gray-200');
  });
});

describe('orderStatusLabel', () => {
  it('traduce cada estado a su etiqueta', () => {
    expect(orderStatusLabel('PENDIENTE')).toBe('Pendiente');
    expect(orderStatusLabel('APROBADO')).toBe('Aprobado');
    expect(orderStatusLabel('CANCELADO')).toBe('Cancelado');
    expect(orderStatusLabel('EN_PRODUCCION')).toBe('En producción');
    expect(orderStatusLabel('LISTO_PRODUCCION')).toBe('Listo producción');
  });

  it('devuelve el valor crudo para estados desconocidos', () => {
    expect(orderStatusLabel('DESCONOCIDO')).toBe('DESCONOCIDO');
  });
});

describe('orderStatusColor', () => {
  it('mapea cada estado a su color hexadecimal', () => {
    expect(orderStatusColor('PENDIENTE')).toBe('#F59E0B');
    expect(orderStatusColor('APROBADO')).toBe('#10B981');
    expect(orderStatusColor('CANCELADO')).toBe('#EF4444');
    expect(orderStatusColor('EN_PRODUCCION')).toBe('#6366F1');
    expect(orderStatusColor('LISTO_PRODUCCION')).toBe('#06B6D4');
  });

  it('usa color neutro para estados desconocidos', () => {
    expect(orderStatusColor('DESCONOCIDO')).toBe('#6B7280');
  });
});