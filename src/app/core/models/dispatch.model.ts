export type DispatchStatus = 'PENDIENTE' | 'EN REVISIÓN' | 'APROBADO' | 'EN RUTA' | 'FINALIZADO' | 'CANCELADO';

export interface ChecklistItem {
  name: string;
  checked: boolean;
  observations?: string;
}

export interface Dispatch {
  id: string;
  dispatchNumber: string;
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
