import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Driver, DriverResponse, CreateDriverRequest, UpdateDriverRequest, toDriverDisplay } from '../models/driver.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class DriverService extends BaseCrudService<DriverResponse, Driver, CreateDriverRequest, UpdateDriverRequest> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/drivers`;

  protected toDisplay(item: DriverResponse): Driver {
    return toDriverDisplay(item);
  }
}