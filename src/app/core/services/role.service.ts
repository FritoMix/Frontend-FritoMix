import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, RoleResponse, CreateRoleRequest, UpdateRoleRequest } from '../models/role.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class RoleService extends BaseCrudService<RoleResponse, Role, CreateRoleRequest, UpdateRoleRequest> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/roles`;

  protected toDisplay(item: RoleResponse): Role {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      permissions: item.permissions,
      permissionCount: item.permissions.length,
      createdAt: item.createdAt,
    };
  }

  findAllPermissions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/permissions`);
  }

  override create(data: CreateRoleRequest): Observable<RoleResponse> {
    return super.create(data);
  }

  override update(id: number, data: UpdateRoleRequest): Observable<RoleResponse> {
    return super.update(id, data);
  }
}