export interface DriverResponse {
  id: number;
  document: string;
  name: string;
  phone: string;
  licenseNumber: string;
  active: boolean;
  createdAt: string;
}

export interface CreateDriverRequest {
  document: string;
  name: string;
  phone?: string;
  licenseNumber: string;
  active?: boolean;
}

export type UpdateDriverRequest = CreateDriverRequest;

export interface Driver {
  id: number;
  document: string;
  name: string;
  phone: string;
  licenseNumber: string;
  active: boolean;
  avatarInitials: string;
}

export function toDriverDisplay(resp: DriverResponse): Driver {
  const initials = resp.name
    .split(' ')
    .filter(p => p.length > 0)
    .slice(0, 2)
    .map(p => p.charAt(0).toUpperCase())
    .join('');
  return {
    id: resp.id,
    document: resp.document,
    name: resp.name,
    phone: resp.phone,
    licenseNumber: resp.licenseNumber,
    active: resp.active,
    avatarInitials: initials,
  };
}
