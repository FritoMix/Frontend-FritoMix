export type VehicleType = 'CAMIÓN' | 'FURGÓN' | 'CAMIONETA' | 'VOLQUETA' | 'VAN';

export interface Vehicle {
  id: string;
  code: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  color: string;
  chassisNumber: string;
  engineNumber: string;
  capacityKg: number;
  capacityUnits: number;
  soatExpiration: string;
  tecnomecanicaExpiration: string;
  insuranceCompany: string;
  policyNumber: string;
  active: boolean;
}
