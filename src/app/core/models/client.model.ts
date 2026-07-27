export interface Client {
  id: string;
  code: string;
  name: string;
  taxId: string;
  department: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
  numeral?: string;
}
