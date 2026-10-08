import { CategoryDTO, CategoryGroupDTO } from '../../core/models/product.model';

/**
 * The category tree is three levels deep in production (group -> subcategory ->
 * sub-subcategory), while most products are attached to the deepest level. Matching a
 * product by exact category id therefore finds nothing for a subcategory, which is what
 * made the subcategories look empty.
 *
 * The backend already resolves this recursively in
 * `countProductsByCategoryIdRecursive`; these helpers mirror that behaviour on the client
 * so both sides agree on what belongs to a category.
 */

type CategoryNode = CategoryGroupDTO | CategoryDTO;

/**
 * Collects a node and its descendants.
 *
 * `path` holds only the ancestors of the current branch, so a repeated id on a different
 * branch is still collected while a genuine cycle terminates.
 */
function collect(
  nodes: readonly CategoryNode[],
  target: Set<number>,
  path: ReadonlySet<number>
): void {
  for (const node of nodes) {
    if (!node || path.has(node.id)) continue;
    const nextPath = new Set(path);
    nextPath.add(node.id);
    target.add(node.id);
    collect(node.children ?? [], target, nextPath);
  }
}

/**
 * Ids of the given category plus every descendant, at any depth, or null when the
 * category is not part of the tree.
 *
 * Guards against cycles so malformed data cannot cause infinite recursion.
 */
function subtreeOf(
  nodes: readonly CategoryNode[],
  categoryId: number
): Set<number> | null {
  const ids = new Set<number>();

  const walk = (candidates: readonly CategoryNode[], path: ReadonlySet<number>): boolean => {
    for (const node of candidates) {
      if (!node || path.has(node.id)) continue;
      if (node.id === categoryId) {
        collect([node], ids, new Set());
        return true;
      }
      const nextPath = new Set(path);
      nextPath.add(node.id);
      if (walk(node.children ?? [], nextPath)) return true;
    }
    return false;
  };

  return walk(nodes, new Set()) ? ids : null;
}

/**
 * Ids belonging to the given category. An unknown id resolves to itself, so filtering by
 * a category that is not loaded yet still behaves predictably.
 */
export function categorySubtreeIds(
  groups: readonly CategoryGroupDTO[],
  categoryId: number
): Set<number> {
  return subtreeOf(groups, categoryId) ?? new Set([categoryId]);
}

/**
 * True when a product belongs to the given category or to any of its descendants.
 */
export function isInCategorySubtree(
  groups: readonly CategoryGroupDTO[],
  categoryId: number,
  productCategoryId: number | null | undefined
): boolean {
  if (productCategoryId == null) return false;
  return categorySubtreeIds(groups, categoryId).has(productCategoryId);
}

/**
 * Group that owns the product category, or null when no group contains it.
 */
export function groupOfProductCategory(
  groups: readonly CategoryGroupDTO[],
  productCategoryId: number | null | undefined
): CategoryGroupDTO | null {
  if (productCategoryId == null) return null;
  return groups.find(group => subtreeOf([group], productCategoryId) !== null) ?? null;
}
