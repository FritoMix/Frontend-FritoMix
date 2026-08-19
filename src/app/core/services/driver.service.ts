import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Driver, DriverResponse, CreateDriverRequest, UpdateDriverRequest, toDriverDisplay } from '../models/driver.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class DriverService extends BaseCrudService<DriverResponse, Driver, CreateDriverRequest, UpdateDriverRequest> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/drivers`;

  protected toDisplay(item: DriverResponse): Driver {
    return toDriverDisplay(item);
  }

  override create(data: CreateDriverRequest): Observable<DriverResponse> {
    return super.create(data);
  }

  override update(id: number, data: UpdateDriverRequest): Observable<DriverResponse> {
    return super.update(id, data);
  }
}