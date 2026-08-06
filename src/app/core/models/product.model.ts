export interface ProductResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  unit: string;
  active: boolean;
  price: number;
  cost: number;
  presentation: number;
  weight: string;
  weightGrams: number;
  categoryId: number;
  categoryName: string;
  pesoUnidad: number | null;
  dimension: number | null;
  pesoTotalCargue: number | null;
  stock: number | null;
  createdAt: string;
}

export interface CreateProductRequest {
  categoryId: number;
  code: string;
  name: string;
  description?: string;
  unit: string;
  price?: number;
  cost?: number;
  presentation?: number;
  weight?: string;
  weightGrams?: number;
  active?: boolean;
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
  price: number;
  cost: number;
  presentation: number;
  weight: string;
  weightGrams: number;
  categoryId: number;
  categoryName: string;
  pesoUnidad: number | null;
  dimension: number | null;
  pesoTotalCargue: number | null;
  stock: number | null;
}

export interface CategoryDTO {
  id: number;
  name: string;
}

export function toProductDisplay(resp: ProductResponse): Product {
  return {
    id: resp.id,
    code: resp.code,
    name: resp.name,
    description: resp.description,
    unit: resp.unit,
    active: resp.active,
    price: resp.price,
    cost: resp.cost,
    presentation: resp.presentation,
    weight: resp.weight,
    weightGrams: resp.weightGrams,
    categoryId: resp.categoryId,
    categoryName: resp.categoryName,
    pesoUnidad: resp.pesoUnidad,
    dimension: resp.dimension,
    pesoTotalCargue: resp.pesoTotalCargue,
    stock: resp.stock ?? null,
  };
}
