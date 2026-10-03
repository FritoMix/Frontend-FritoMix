import { OrderStatus } from '../../core/models/order.model';

export function orderStatusClass(status: OrderStatus | string): string {
  const map: Record<string, string> = {
    'PENDIENTE': 'bg-amber-50 text-amber-700 border-amber-200',
    'APROBADO': 'bg-green-50 text-green-700 border-green-200',
    'CANCELADO': 'bg-red-50 text-red-600 border-red-200',
    'EN_PRODUCCION': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'LISTO_PRODUCCION': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };
  return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

export function orderStatusLabel(status: OrderStatus | string): string {
  const map: Record<string, string> = {
    'PENDIENTE': 'Pendiente',
    'APROBADO': 'Aprobado',
    'CANCELADO': 'Cancelado',
    'EN_PRODUCCION': 'En producción',
    'LISTO_PRODUCCION': 'Listo producción',
  };
  return map[status] || status;
}

export function orderStatusColor(status: OrderStatus | string): string {
  const map: Record<string, string> = {
    'PENDIENTE': '#F59E0B',
    'APROBADO': '#10B981',
    'CANCELADO': '#EF4444',
    'EN_PRODUCCION': '#6366F1',
    'LISTO_PRODUCCION': '#06B6D4',
  };
  return map[status] || '#6B7280';
}