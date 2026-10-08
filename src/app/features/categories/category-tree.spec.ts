import { describe, expect, it } from 'vitest';
import { categorySubtreeIds, groupOfProductCategory, isInCategorySubtree } from './category-tree';
import { CategoryDTO, CategoryGroupDTO } from '../../core/models/product.model';

/**
 * Mirrors the production tree: Productos Nacionales (30) has subcategories, and almost
 * every product lives one level deeper, under the sub-subcategory.
 */
function cat(id: number, name: string, children: CategoryDTO[] = []): CategoryDTO {
  return { id, name, description: null, image: null, parentId: null, children };
}

function group(id: number, name: string, children: CategoryDTO[] = []): CategoryGroupDTO {
  return { id, name, description: null, image: null, children };
}

const NATIONALS: CategoryGroupDTO = group(30, 'Productos Nacionales', [
  cat(12, 'Pelet', [
    cat(2, 'Granos & Snacks'),
    cat(23, 'PT MEZCLAS'),
    cat(27, 'PT PELLET'),
  ]),
  cat(14, 'Galletas', [cat(7, 'Dulces'), cat(17, 'GALLETAS 19%')]),
  cat(19, 'PT CHICHARRON'),
  cat(11, 'Platano'),
]);

const EXPORTS: CategoryGroupDTO = group(31, 'Productos Exportación', [
  cat(26, 'PT PAPA-LIBRE SELLOS'),
]);

const GROUPS = [EXPORTS, NATIONALS];

describe('categorySubtreeIds', () => {
  it('includes the category itself', () => {
    expect(categorySubtreeIds(GROUPS, 30).has(30)).toBe(true);
  });

  it('includes descendants at any depth', () => {
    const ids = categorySubtreeIds(GROUPS, 30);
    expect(ids.has(12)).toBe(true);
    expect(ids.has(27)).toBe(true);
    expect(ids.has(7)).toBe(true);
  });

  it('does not leak into sibling groups', () => {
    const ids = categorySubtreeIds(GROUPS, 30);
    expect(ids.has(31)).toBe(false);
    expect(ids.has(26)).toBe(false);
  });

  it('returns the id itself when the category is unknown', () => {
    expect([...categorySubtreeIds(GROUPS, 9999)]).toEqual([9999]);
  });

  it('does not loop forever on a cyclic tree', () => {
    const a = cat(1, 'A');
    const b = cat(2, 'B', [a]);
    (a.children ??= []).push(b);
    const cyclic = [group(100, 'Root', [a])];
    const ids = categorySubtreeIds(cyclic, 100);
    expect(ids.has(100)).toBe(true);
    expect(ids.has(1)).toBe(true);
    expect(ids.has(2)).toBe(true);
  });

  it('collects a repeated id that lives on a different branch', () => {
    const shared = cat(5, 'Shared');
    const tree = [group(100, 'Root', [cat(1, 'A', [shared]), cat(2, 'B', [shared])])];
    expect(categorySubtreeIds(tree, 100).has(5)).toBe(true);
  });
});

describe('isInCategorySubtree', () => {
  it('matches a product on the deepest level through its ancestor', () => {
    // PT PELLET (27) sits under Pelet (12), under Productos Nacionales (30)
    expect(isInCategorySubtree(GROUPS, 30, 27)).toBe(true);
    expect(isInCategorySubtree(GROUPS, 12, 27)).toBe(true);
  });

  it('matches a product attached directly to the category', () => {
    expect(isInCategorySubtree(GROUPS, 19, 19)).toBe(true);
  });

  it('rejects a product from a different group', () => {
    expect(isInCategorySubtree(GROUPS, 30, 26)).toBe(false);
  });

  it('rejects a product without a category', () => {
    expect(isInCategorySubtree(GROUPS, 30, null)).toBe(false);
    expect(isInCategorySubtree(GROUPS, 30, undefined)).toBe(false);
  });
});

describe('groupOfProductCategory', () => {
  it('resolves the owning group from a deep category', () => {
    expect(groupOfProductCategory(GROUPS, 27)?.name).toBe('Productos Nacionales');
  });

  it('resolves the owning group for a shallow category', () => {
    expect(groupOfProductCategory(GROUPS, 26)?.name).toBe('Productos Exportación');
  });

  it('returns null for a product without category', () => {
    expect(groupOfProductCategory(GROUPS, null)).toBeNull();
  });
});
