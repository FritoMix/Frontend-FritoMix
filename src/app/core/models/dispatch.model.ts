export type DispatchStatus = 'PENDIENTE' | 'ELABORACION' | 'PRODUCCION' | 'LISTO_CARGUE' | 'DESPACHADO';

export const DISPATCH_STATUS_FLOW: DispatchStatus[] = [
  'PENDIENTE', 'ELABORACION', 'PRODUCCION', 'LISTO_CARGUE', 'DESPACHADO'
];

export function nextDispatchStatus(status: DispatchStatus): DispatchStatus | null {
  const idx = DISPATCH_STATUS_FLOW.indexOf(status);
  if (idx < 0 || idx >= DISPATCH_STATUS_FLOW.length - 1) return null;
  return DISPATCH_STATUS_FLOW[idx + 1];
}

export interface ChecklistItem {
  name: string;
  checked: boolean;
  observations?: string;
}

export interface OrderFacturaRequest {
  orderId: number;
  numeroFactura: string;
}

export interface Dispatch {
  id: string;
  dispatchNumber: string;
  orderId: number;
  orderNumber: string;
  clientes: string;
  tipoPedido: string;
  dispatchDate: string;
  dispatchTime: string;
  numeroFactura?: string | null;
  pesoTotal?: number | null;
  totalDimension?: number | null;
  driverName: string;
  driverDocument: string;
  driverPhone: string;
  vehicleNumber: string;
  vehicleType: string;
  helperName?: string;
  route: string;
  estimatedArrival: string;
  checklist: ChecklistItem[];
  status: DispatchStatus;
  cumplimiento?: string | null;
  departureKm?: number;
  arrivalKm?: number;
  fuelLiters?: number;
  observations?: string;
  createdBy: string;
  approvedBy?: string;
}

export interface DispatchResponse {
  id: number;
  dispatchNumber: string;
  tipoPedido: string;
  orders: DispatchOrderInfo[];
  orderId: number;
  orderNumber: string;
  numeroFactura?: string | null;
  pesoTotal: number | null;
  totalDimension: number | null;
  pesoTotalCargue: number | null;
  driverId: number;
  driverName: string;
  driverDocument: string;
  vehicleId: number;
  vehicleNumber: string;
  vehicleType: string;
  dispatchDate: string;
  status: string;
  cumplimiento?: string | null;
  notes: string;
  dispatchUserName?: string;
  details: DispatchDetailResponse[];
  arrumes: ArrumeResponse[];
  createdAt: string;
}

export interface DispatchOrderInfo {
  id: number;
  orderNumber: string;
  clientName: string;
  pesoTotalCargue: number | null;
  numeroFactura?: string | null;
}

export interface DispatchDetailResponse {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  delivered: number;
  observations: string;
  detalleProducto?: string | null;
  lote?: string | null;
}

export interface CreateDispatchRequest {
  tipoPedido: string;
  orderIds: number[];
  orderId?: number;
  driverId: number;
  vehicleId: number;
  userId: number | null;
  dispatchNumber: string;
  dispatchDate?: string;
  status?: string;
  notes?: string;
  numeroFactura?: string;
  orderFacturas?: OrderFacturaRequest[];
  details: CreateDispatchDetailRequest[];
  arrumes?: CreateArrumeRequest[];
}

export interface CreateArrumeRequest {
  numArrume?: number | null;
  arrumeProducto?: string;
  cantidad?: number | null;
  lote?: string;
}

export interface DispatchPreviewItem {
  productId: number;
  description: string;
  lot?: string;
  qty: number;
}

export interface ArrumeResponse {
  id: number;
  numArrume?: number | null;
  arrumeProducto?: string;
  cantidad?: number | null;
  lote?: string;
}

export interface CreateDispatchDetailRequest {
  productId: number;
  quantity: number;
  delivered?: number;
  observations?: string;
  detalleProducto?: string;
  lote?: string;
}

export type UpdateDispatchRequest = CreateDispatchRequest;

export function toDispatchDisplay(resp: DispatchResponse): Dispatch {
  const clientes = (resp.orders ?? [])
    .map(o => o.clientName)
    .filter(Boolean)
    .join(', ');
  return {
    id: String(resp.id),
    dispatchNumber: resp.dispatchNumber,
    orderId: resp.orderId,
    orderNumber: resp.orderNumber,
    clientes,
    tipoPedido: resp.tipoPedido || 'pedido_unico',
    dispatchDate: resp.dispatchDate ? resp.dispatchDate.split('T')[0] : '',
    dispatchTime: '',
    numeroFactura: resp.numeroFactura || null,
    pesoTotal: resp.pesoTotal,
    totalDimension: resp.totalDimension,
    driverName: resp.driverName,
    driverDocument: resp.driverDocument,
    driverPhone: '',
    vehicleNumber: resp.vehicleNumber,
    vehicleType: resp.vehicleType,
    route: '',
    estimatedArrival: '',
    checklist: [],
    status: resp.status as DispatchStatus,
    cumplimiento: resp.cumplimiento || null,
    observations: resp.notes || '',
    createdBy: resp.dispatchUserName || '',
  };
}

