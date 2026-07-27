export type MovementType = 'ENTRADA' | 'SALIDA';

export interface InventoryMovementItem {
  productCode: string;
  productDescription: string;
  lotCode?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InventoryMovement {
  id: string;
  movementNumber: string;
  movementDate: string;
  movementTime: string;
  movementType: MovementType;
  referenceDocument: string;
  referenceType: string;
  productCode: string;
  productDescription: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  lotCode?: string;
  warehouse: string;
  responsible: string;
  items?: InventoryMovementItem[];
  observations?: string;
}
