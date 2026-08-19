import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserResponse, CreateUserRequest, UpdateUserRequest, toUserDisplay } from '../models/user.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseCrudService<UserResponse, User, CreateUserRequest, UpdateUserRequest> {
  protected readonly apiUrl = `${environment.apiUrl}/api/v1/users`;

  protected toDisplay(item: UserResponse): User {
    return toUserDisplay(item);
  }

  override create(data: CreateUserRequest): Observable<UserResponse> {
    return super.create(data);
  }

  override update(id: number, data: UpdateUserRequest): Observable<UserResponse> {
    return super.update(id, data);
  }

  toggleStatus(id: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  getProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`);
  }

  updateProfile(data: Record<string, unknown>): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/me`, data);
  }
}