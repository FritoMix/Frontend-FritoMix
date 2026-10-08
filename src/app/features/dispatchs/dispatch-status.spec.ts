import { describe, expect, it } from 'vitest';
import { dispatchStatusClass, dispatchStatusLabel } from './dispatch-status';

describe('dispatchStatusClass', () => {
  it('mapea cada estado a clases tailwind', () => {
    expect(dispatchStatusClass('PENDIENTE')).toContain('bg-gray-100');
    expect(dispatchStatusClass('VEHICULO_ASIGNADO')).toContain('bg-violet-50');
    expect(dispatchStatusClass('CONDUCTOR_ASIGNADO')).toContain('bg-cyan-50');
    expect(dispatchStatusClass('DESPACHADO')).toContain('bg-green-50');
    expect(dispatchStatusClass('ELABORACION')).toContain('bg-amber-50');
    expect(dispatchStatusClass('PRODUCCION')).toContain('bg-blue-50');
    expect(dispatchStatusClass('LISTO_CARGUE')).toContain('bg-teal-50');
  });

  it('usa clase neutra para estados desconocidos', () => {
    expect(dispatchStatusClass('DESCONOCIDO')).toBe('bg-gray-100 text-gray-700 border-gray-300');
  });
});

describe('dispatchStatusLabel', () => {
  it('traduce cada estado a su etiqueta', () => {
    expect(dispatchStatusLabel('PENDIENTE')).toBe('PENDIENTE');
    expect(dispatchStatusLabel('VEHICULO_ASIGNADO')).toBe('VEHÍCULO ASIGNADO');
    expect(dispatchStatusLabel('CONDUCTOR_ASIGNADO')).toBe('CONDUCTOR ASIGNADO');
    expect(dispatchStatusLabel('ELABORACION')).toBe('ELABORACIÓN');
    expect(dispatchStatusLabel('PRODUCCION')).toBe('PRODUCCIÓN');
    expect(dispatchStatusLabel('LISTO_CARGUE')).toBe('LISTO CARGUE');
  });

  it('devuelve el valor crudo para estados desconocidos', () => {
    expect(dispatchStatusLabel('DESCONOCIDO')).toBe('DESCONOCIDO');
  });
});