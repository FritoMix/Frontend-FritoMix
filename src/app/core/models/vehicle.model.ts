export interface VehicleResponse {
  id: number;
  vehicleNumber: string;
  type: string;
  capacity: number;
  dimension: number;
  active: boolean;
  createdAt: string;
}

export interface CreateVehicleRequest {
  vehicleNumber: string;
  type: string;
  capacity: number;
  dimension: number;
  active?: boolean;
}

export type UpdateVehicleRequest = CreateVehicleRequest;

export interface Vehicle {
  id: number;
  vehicleNumber: string;
  type: string;
  capacity: number;
  dimension: number;
  active: boolean;
}

export function toVehicleDisplay(resp: VehicleResponse): Vehicle {
  return {
    id: resp.id,
    vehicleNumber: resp.vehicleNumber,
    type: resp.type,
    capacity: resp.capacity,
    dimension: resp.dimension,
    active: resp.active,
  };
}
