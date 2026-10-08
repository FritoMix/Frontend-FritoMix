export interface ProductResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  unit: string;
  active: boolean;
  presentation: number;
  weight: string;
  weightGrams: number;
  image?: string | null;
  categoryId: number;
  categoryName: string;
  pesoUnidad: number | null;
  dimension: number | null;
  pesoTotalCargue: number | null;
  createdAt: string;
}

export interface CreateProductRequest {
  categoryId: number;
  code: string;
  name: string;
  description?: string;
  unit: string;
  presentation?: number;
  weight?: string;
  weightGrams?: number;
  active?: boolean;
  image?: string | null;
  pesoUnidad?: number;
  dimension?: number;
  pesoTotalCargue?: number;
}

export type UpdateProductRequest = CreateProductRequest;

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  unit: string;
  active: boolean;
  presentation: number;
  weight: string;
  weightGrams: number;
  image?: string | null;
  categoryId: number;
  categoryName: string;
  pesoUnidad: number | null;
  dimension: number | null;
  pesoTotalCargue: number | null;
}

export interface CategoryDTO {
  id: number;
  name: string;
  description: string | null;
  image?: string | null;
  parentId: number | null;
  children?: CategoryDTO[];
  itemCount?: number;
  subcategoriesCount?: number;
}

export interface CategoryGroupDTO {
  id: number;
  name: string;
  description: string | null;
  image?: string | null;
  children: CategoryDTO[];
  itemCount?: number;
  subcategoriesCount?: number;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  parentId?: number | null;
}

export function toProductDisplay(resp: ProductResponse): Product {
  return {
    id: resp.id,
    code: resp.code,
    name: resp.name,
    description: resp.description,
    unit: resp.unit,
    active: resp.active,
    presentation: resp.presentation,
    weight: resp.weight,
    weightGrams: resp.weightGrams,
    image: resp.image ?? null,
    categoryId: resp.categoryId,
    categoryName: resp.categoryName,
    pesoUnidad: resp.pesoUnidad,
    dimension: resp.dimension,
    pesoTotalCargue: resp.pesoTotalCargue,
  };
}
