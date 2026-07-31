export interface ClientResponse {
  id: number;
  code: string;
  document: string;
  businessName: string;
  contactName?: string;
  phone: string;
  email: string;
  active: boolean;
  address: string;
  cityId: number;
  cityName: string;
  departmentId: number;
  departmentName: string;
  createdAt: string;
}

export interface CreateClientRequest {
  document: string;
  businessName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  cityId: number;
  active?: boolean;
}

export type UpdateClientRequest = CreateClientRequest;

export interface Client {
  id: number;
  code: string;
  businessName: string;
  document: string;
  departmentId: number;
  departmentName: string;
  cityId: number;
  cityName: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
}

export interface Department {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
}

export function toClientDisplay(resp: ClientResponse): Client {
  return {
    id: resp.id,
    code: resp.code,
    businessName: resp.businessName,
    document: resp.document,
    departmentId: resp.departmentId,
    departmentName: resp.departmentName,
    cityId: resp.cityId,
    cityName: resp.cityName,
    address: resp.address,
    phone: resp.phone,
    email: resp.email,
    active: resp.active,
  };
}
