export type EstadoCamara =
  | 'PENDIENTE_CAMARAS'
  | 'EN_VERIFICACION'
  | 'OBSERVADA'
  | 'APROBADA'
  | 'RECHAZADA';

export type EstadoLineaCamara = 'PENDIENTE' | 'OK' | 'DIFERENCIA';

export interface DetalleVerificacionResponse {
  id: number;
  dispatchDetailId: number;
  productId: number;
  productName: string;
  productCode: string;
  detalleProducto?: string;
  lote?: string;
  cantidadDespachada: number;
  cantidadVerificada?: number;
  diferencia?: number;
  estadoLinea: EstadoLineaCamara;
  tipoInconsistencia?: string;
  observacionLinea?: string;
}

export interface CamaraVerificacionResponse {
  id: number;
  dispatchId: number;
  dispatchNumber: string;
  estadoCamaras: EstadoCamara;
  clienteNombre: string;
  responsableDespacho?: string;
  fechaDespacho: string;
  vehiclePlate?: string;
  driverName?: string;
  notesDespacho?: string;
  cumplimiento?: string;
  verificadoPorUserId?: number;
  verificadoPorNombre?: string;
  fechaInicioVerificacion?: string;
  aprobadoPorUserId?: number;
  aprobadoPorNombre?: string;
  fechaAprobacion?: string;
  observacionesGenerales?: string;
  detalles: DetalleVerificacionResponse[];
  totalLineas: number;
  lineasOk: number;
  lineasConDiferencia: number;
  lineasPendientes: number;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CamaraHistorialResponse {
  id: number;
  tipoEvento: string;
  userId?: number;
  nombreUsuario?: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  observacion?: string;
  createdAt: string;
}

export interface LineaVerificadaRequest {
  detalleId: number;
  cantidadVerificada: number;
  tipoInconsistencia?: string;
  observacionLinea?: string;
}

export interface CamaraVerificarRequest {
  lineas: LineaVerificadaRequest[];
  observacionesGenerales?: string;
}

export interface CamaraObservarRequest {
  observacion: string;
}

export interface CamaraAprobarRequest {
  confirmacion: string;
}

export interface CamaraRechazarRequest {
  motivo: string;
}

export interface CamaraReabrirRequest {
  motivo: string;
}
