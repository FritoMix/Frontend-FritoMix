import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehicle, VehicleResponse, CreateVehicleRequest, UpdateVehicleRequest, toVehicleDisplay } from '../models/vehicle.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class VehicleService extends BaseCrudService<VehicleResponse, Vehicle, CreateVehicleRequest, UpdateVehicleRequest> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/vehicles`;

  protected toDisplay(item: VehicleResponse): Vehicle {
    return toVehicleDisplay(item);
  }

  override create(data: CreateVehicleRequest): Observable<VehicleResponse> {
    return super.create(data);
  }

  override update(id: number, data: UpdateVehicleRequest): Observable<VehicleResponse> {
    return super.update(id, data);
  }
}