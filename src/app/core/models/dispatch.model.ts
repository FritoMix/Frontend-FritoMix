export type DispatchStatus = 'PENDIENTE' | 'EN REVISIÓN' | 'APROBADO' | 'EN RUTA' | 'FINALIZADO' | 'CANCELADO';

export interface ChecklistItem {
  name: string;
  checked: boolean;
  observations?: string;
}

export interface Dispatch {
  id: string;
  dispatchNumber: string;
  orderId: number;
  orderNumber: string;
  dispatchDate: string;
  dispatchTime: string;
  driverName: string;
  driverDocument: string;
  driverPhone: string;
  vehiclePlate: string;
  vehicleType: string;
  helperName?: string;
  route: string;
  estimatedArrival: string;
  checklist: ChecklistItem[];
  status: DispatchStatus;
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
  orderId: number;
  orderNumber: string;
  pesoTotalCargue: number | null;
  driverId: number;
  driverName: string;
  driverDocument: string;
  vehicleId: number;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  dispatchDate: string;
  status: string;
  notes: string;
  dispatchUserName?: string;
  details: DispatchDetailResponse[];
  createdAt: string;
}

export interface DispatchDetailResponse {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  delivered: number;
  observations: string;
}

export interface CreateDispatchRequest {
  orderId: number;
  driverId: number;
  vehicleId: number;
  userId: number | null;
  dispatchNumber: string;
  dispatchDate?: string;
  status?: string;
  notes?: string;
  details: CreateDispatchDetailRequest[];
}

export interface CreateDispatchDetailRequest {
  productId: number;
  quantity: number;
  delivered?: number;
  observations?: string;
}

export type UpdateDispatchRequest = CreateDispatchRequest;

export function toDispatchDisplay(resp: DispatchResponse): Dispatch {
  return {
    id: String(resp.id),
    dispatchNumber: resp.dispatchNumber,
    orderId: resp.orderId,
    orderNumber: resp.orderNumber,
    dispatchDate: resp.dispatchDate ? resp.dispatchDate.split('T')[0] : '',
    dispatchTime: '',
    driverName: resp.driverName,
    driverDocument: resp.driverDocument,
    driverPhone: '',
    vehiclePlate: resp.vehiclePlate,
    vehicleType: resp.vehicleBrand,
    route: '',
    estimatedArrival: '',
    checklist: [],
    status: resp.status as DispatchStatus,
    observations: resp.notes || '',
    createdBy: resp.dispatchUserName || '',
  };
}
