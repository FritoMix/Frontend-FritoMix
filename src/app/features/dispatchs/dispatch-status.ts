import { DispatchStatus } from '../../core/models/dispatch.model';

export function dispatchStatusClass(status: DispatchStatus | string): string {
  const map: Record<DispatchStatus, string> = {
    'PENDIENTE': 'bg-gray-100 text-gray-700 border-gray-300',
    'VEHICULO_ASIGNADO': 'bg-violet-50 text-violet-700 border-violet-200',
    'CONDUCTOR_ASIGNADO': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'DESPACHADO': 'bg-green-50 text-green-700 border-green-200',
    'ELABORACION': 'bg-amber-50 text-amber-700 border-amber-200',
    'PRODUCCION': 'bg-blue-50 text-blue-700 border-blue-200',
    'LISTO_CARGUE': 'bg-teal-50 text-teal-700 border-teal-200'
  };
  return map[status as DispatchStatus] || 'bg-gray-100 text-gray-700 border-gray-300';
}

export function dispatchStatusLabel(status: DispatchStatus | string): string {
  const map: Record<DispatchStatus, string> = {
    'PENDIENTE': 'PENDIENTE',
    'VEHICULO_ASIGNADO': 'VEHÍCULO ASIGNADO',
    'CONDUCTOR_ASIGNADO': 'CONDUCTOR ASIGNADO',
    'DESPACHADO': 'DESPACHADO',
    'ELABORACION': 'ELABORACIÓN',
    'PRODUCCION': 'PRODUCCIÓN',
    'LISTO_CARGUE': 'LISTO CARGUE'
  };
  return map[status as DispatchStatus] || status;
}