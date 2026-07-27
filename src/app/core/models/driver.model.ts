export type LicenseType = 'B2' | 'B3' | 'C1' | 'C2' | 'C3';

export interface Driver {
  id: string;
  code: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  licenseType: LicenseType;
  licenseNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  department: string;
  birthDate: string;
  hireDate: string;
  active: boolean;
  avatarInitials?: string;
  avatarColor?: string;
}
