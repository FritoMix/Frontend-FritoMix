export type LotStatus = 'ACTIVO' | 'RESERVADO' | 'AGOTADO' | 'VENCIDO';

export interface Lot {
  id: string;
  code: string;
  productCode: string;
  productDescription: string;
  supplier: string;
  receptionDate: string;
  manufacturingDate: string;
  expirationDate: string;
  quantityReceived: number;
  quantityAvailable: number;
  unitCost: number;
  location: string;
  status: LotStatus;
  observations?: string;
}
