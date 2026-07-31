export interface SettingResponse {
  id: number;
  companyName: string;
  nit: string;
  adminEmail: string;
  address: string;
  phone: string;
  city: string;
  department: string;
  economicActivity: string;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  passwordExpirationDays: number;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  updatedAt: string;
}

export interface UpdateSettingRequest {
  companyName: string;
  nit?: string;
  adminEmail?: string;
  address?: string;
  phone?: string;
  city?: string;
  department?: string;
  economicActivity?: string;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  passwordExpirationDays: number;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
}
