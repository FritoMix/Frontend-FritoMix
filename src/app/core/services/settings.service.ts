import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SettingResponse, UpdateSettingRequest } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/settings`;

  get(): Observable<SettingResponse> {
    return this.http.get<SettingResponse>(this.apiUrl);
  }

  update(data: UpdateSettingRequest): Observable<SettingResponse> {
    return this.http.put<SettingResponse>(this.apiUrl, data);
  }
}
