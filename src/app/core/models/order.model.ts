export type OrderStatus = 'PENDIENTE' | 'EN PREPARACIÓN' | 'DESPACHADO' | 'ENTREGADO' | 'CANCELADO';

export interface OrderItem {
  item: number;
  productId: number;
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
  clientName: string;
  numeral: string;
  city: string;
  department: string;
  phone: string;
  address: string;
  coordinatorName: string;
  dispatcherName: string;
  auxProduction: string;
  vehicle: string;
  lotGeneral: string;
  driverName: string;
  driverDocument: string;
  driverPhone: string;
  dispatchDate: string;
  dispatchTime: string;
  status: OrderStatus;
  items: OrderItem[];
  totalBultos: number;
  totalCajas: number;
  totalUnidades: number;
  pesoTotalKg: number;
  observations?: string;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerDocument: string;
  phone?: string;
  address?: string;
  cityName?: string;
  departmentName?: string;
  userId: number;
  coordinatorName?: string;
  orderDate: string;
  status: string;
  total: number;
  pesoTotalCargue: number | null;
  notes: string;
  dispatchUserName?: string;
  dispatchDriverName?: string;
  dispatchDriverDocument?: string;
  dispatchDriverPhone?: string;
  dispatchVehiclePlate?: string;
  dispatchDate?: string;
  details: OrderDetailResponse[];
  createdAt: string;
}

export interface OrderDetailResponse {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  productType?: string;
  pesoUnidad?: number;
  dimension?: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: number;
  userId: number;
  orderNumber: string;
  orderDate?: string;
  status?: string;
  total: number;
  notes?: string;
  details: CreateOrderDetailRequest[];
}

export interface CreateOrderDetailRequest {
  productId: number;
  quantity: number;
}

export type UpdateOrderRequest = CreateOrderRequest;

export function toOrderDisplay(resp: OrderResponse): Order {
  return {
    id: String(resp.id),
    orderNumber: resp.orderNumber,
    documentCode: resp.orderNumber,
    version: '1.0',
    date: resp.orderDate ? resp.orderDate.split('T')[0] : '',
    page: '1 de 1',
    clientName: resp.customerName,
    numeral: resp.customerDocument || '',
    city: resp.cityName ?? '',
    department: resp.departmentName ?? '',
    phone: resp.phone ?? '',
    address: resp.address ?? '',
    coordinatorName: '',
    dispatcherName: '',
    auxProduction: '',
    vehicle: '',
    lotGeneral: '',
    driverName: '',
    driverDocument: '',
    driverPhone: '',
    dispatchDate: '',
    dispatchTime: '',
    status: resp.status as OrderStatus,
    items: resp.details.map((d, i) => ({
      item: i + 1,
      productId: d.productId,
      description: d.productName,
      bulto: Math.floor(d.quantity),
      caja: 0,
      dcho: 0,
      group: 1,
      lot: d.productCode,
    })),
    totalBultos: Math.floor(resp.total),
    totalCajas: 0,
    totalUnidades: 0,
    pesoTotalKg: resp.pesoTotalCargue ?? 0,
    observations: resp.notes || '',
  };
}
