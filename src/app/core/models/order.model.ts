export type OrderStatus = 'PENDIENTE' | 'EN PREPARACIÓN' | 'DESPACHADO' | 'ENTREGADO' | 'CANCELADO';

export interface OrderItem {
  item: number;
  description: string;
  bulto: number;
  caja: number;
  dcho: number;
  group: number;
  lot?: string;
  observation?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  documentCode: string;
  version: string;
  date: string;
  page: string;
  
  // Cliente
  clientName: string;
  numeral: string;
  city: string;
  department: string;
  phone: string;
  address: string;
  
  // Despachador & Transporte
  coordinatorName: string;
  dispatcherName: string;
  auxProduction: string;
  vehicle: string;
  lotGeneral: string;

  // Driver details
  driverName: string;
  driverDocument: string;
  driverPhone: string;
  dispatchDate: string;
  dispatchTime: string;

  // Status & items
  status: OrderStatus;
  items: OrderItem[];

  // Totals
  totalBultos: number;
  totalCajas: number;
  totalUnidades: number;
  pesoTotalKg: number;

  observations?: string;
}
