export interface VehicleResponse {
  id: number;
  plate: string;
  brand: string;
  model: string;
  capacity: number;
  active: boolean;
  createdAt: string;
}

export interface CreateVehicleRequest {
  plate: string;
  brand: string;
  model: string;
  capacity: number;
  active?: boolean;
}

export type UpdateVehicleRequest = CreateVehicleRequest;

export interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  capacity: number;
  active: boolean;
}

export function toVehicleDisplay(resp: VehicleResponse): Vehicle {
  return {
    id: resp.id,
    plate: resp.plate,
    brand: resp.brand,
    model: resp.model,
    capacity: resp.capacity,
    active: resp.active,
  };
}
