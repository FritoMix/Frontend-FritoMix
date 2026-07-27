export interface Product {
  id: string;
  code: string;
  description: string;
  presentation: number | string;
  unit: string;
  weight: string;
  weightGrams: number;
  category: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  active: boolean;
  codeColorBg?: string;
  codeColorText?: string;
}
