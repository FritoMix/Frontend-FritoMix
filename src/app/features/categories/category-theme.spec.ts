import { describe, expect, it } from 'vitest';
import { categoryTheme, categoryColor, categoryGradient, categoryShadow, categoryIcon } from './category-theme';

describe('categoryTheme', () => {
  it('resuelve el color canonico ignorando acentos y mayusculas', () => {
    expect(categoryColor('Bebidas')).toBe('#006BB4');
    expect(categoryColor('bebida')).toBe('#006BB4');
    expect(categoryColor('Panadería')).toBe('#DC2626');
    expect(categoryColor('Panaderias')).toBe('#DC2626');
  });

  it('resuelve plurales quitando la s final', () => {
    expect(categoryColor('Galletas')).toBe('#8B4513');
    expect(categoryColor('Plátanos')).toBe('#059669');
    expect(categoryColor('Papas')).toBe('#D97706');
  });

  it('resuelve variantes registradas en ALTERNATES', () => {
    expect(categoryColor('Pellet')).toBe('#EA580C');
    expect(categoryColor('pelet')).toBe('#EA580C');
  });

  it('resuelve categorias extra del modulo de pedidos', () => {
    expect(categoryColor('Dulces')).toBe('#EC4899');
    expect(categoryColor('Maní')).toBe('#B45309');
    expect(categoryColor('Snacks')).toBe('#0055FF');
  });

  it('usa el tema por defecto para categorias desconocidas', () => {
    expect(categoryColor('Categoría Inventada')).toBe('#2563EB');
  });

  it('construye gradiente y sombra desde el color base', () => {
    const theme = categoryTheme('Galletas');
    expect(theme.gradient).toContain('#8B4513');
    expect(theme.gradient).toContain('#54290B');
    expect(theme.shadow).toBe('rgba(139, 69, 19, 0.3)');
    expect(theme.solidBg).toBe('#8B4513');
    expect(theme.icon).toBe('🍪');
    expect(theme.textColor).toBe('text-white');
  });

  it('le da a frutos secos el mismo tema de mani', () => {
    expect(categoryColor('Frutos secos')).toBe('#B45309');
  });
});

describe('categoryIcon / categoryGradient / categoryShadow', () => {
  it('exponen accesos directos consistentes', () => {
    expect(categoryIcon('Bebidas')).toBe('🥤');
    expect(categoryGradient('Bebidas')).toContain('linear-gradient');
    expect(categoryShadow('Bebidas')).toContain('rgba(0, 107, 180');
  });
});