import { describe, expect, it } from 'vitest';
import { clampPage } from './pagination.model';

describe('clampPage', () => {
  it('clampa a 0 cuando no hay páginas', () => {
    expect(clampPage(0, 0)).toBe(0);
    expect(clampPage(3, 0)).toBe(0);
  });

  it('clampa a la última página cuando se excede', () => {
    expect(clampPage(10, 3)).toBe(2);
    expect(clampPage(1, 1)).toBe(0);
  });

  it('clampa a 0 cuando es negativo', () => {
    expect(clampPage(-2, 5)).toBe(0);
  });

  it('deja pasar páginas válidas', () => {
    expect(clampPage(0, 5)).toBe(0);
    expect(clampPage(4, 5)).toBe(4);
  });
});