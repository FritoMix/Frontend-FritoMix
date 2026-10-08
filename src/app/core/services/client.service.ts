import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, ClientResponse, CreateClientRequest, UpdateClientRequest, Department, City, toClientDisplay } from '../models/client.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class ClientService extends BaseCrudService<ClientResponse, Client, CreateClientRequest, UpdateClientRequest> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/customers`;
  private readonly locationsUrl = `${environment.apiUrl}/api/v1/locations`;

  hasError = signal(false);

  protected toDisplay(item: ClientResponse): Client {
    return toClientDisplay(item);
  }

  override load(): void {
    this.hasError.set(false);
    super.load();
  }

  protected override onLoadError(): void {
    this.hasError.set(true);
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.locationsUrl}/departments`);
  }

  getCitiesByDepartment(departmentId: number): Observable<City[]> {
    return this.http.get<City[]>(`${this.locationsUrl}/cities`, { params: { departmentId } });
  }
}