import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Vehicle, VehicleResponse, CreateVehicleRequest, UpdateVehicleRequest, toVehicleDisplay } from '../models/vehicle.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class VehicleService extends BaseCrudService<VehicleResponse, Vehicle, CreateVehicleRequest, UpdateVehicleRequest> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/vehicles`;

  protected toDisplay(item: VehicleResponse): Vehicle {
    return toVehicleDisplay(item);
  }
}