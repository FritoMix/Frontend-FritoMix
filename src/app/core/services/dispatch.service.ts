import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Dispatch, DispatchResponse, CreateDispatchRequest, UpdateDispatchRequest, toDispatchDisplay } from '../models/dispatch.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class DispatchService extends BaseCrudService<DispatchResponse, Dispatch, CreateDispatchRequest, UpdateDispatchRequest> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/dispatches`;

  protected toDisplay(item: DispatchResponse): Dispatch {
    return toDispatchDisplay(item);
  }

  override create(data: CreateDispatchRequest): Observable<DispatchResponse> {
    return super.create(data);
  }

  override update(id: number, data: UpdateDispatchRequest): Observable<DispatchResponse> {
    return super.update(id, data);
  }

  updateStatus(id: number, status: string): Observable<DispatchResponse> {
    return this.http.patch<DispatchResponse>(`${this.apiUrl}/${id}/status`, null, { params: { status } });
  }
}