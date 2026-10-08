import { OrderResponse } from './order.model';

export interface MultipedidoResponse {
  id: number;
  numero: string;
  status: string;
  totalPeso: number;
  totalMonto: number;
  orders: OrderResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMultipedidoRequest {
  orderIds: number[];
}
