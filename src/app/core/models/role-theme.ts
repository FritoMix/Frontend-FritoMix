import { UserRole } from './user.model';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  cartera: 'Cartera',
  coordinador: 'Coordinador',
  despachador: 'Despachador',
  produccion: 'Producción',
  camara: 'Cámara',
  facturacion: 'Facturación',
  despachador1: 'Despachador 1',
  despachador2: 'Despachador 2',
  despachador3: 'Despachador 3',
};

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  admin: 'bg-red-50 text-red-700 border-red-200',
  cartera: 'bg-purple-50 text-purple-700 border-purple-200',
  coordinador: 'bg-amber-50 text-amber-700 border-amber-200',
  despachador: 'bg-rose-50 text-rose-700 border-rose-200',
  produccion: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  camara: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  facturacion: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  despachador1: 'bg-rose-50 text-rose-700 border-rose-200',
  despachador2: 'bg-pink-50 text-pink-700 border-pink-200',
  despachador3: 'bg-orange-50 text-orange-700 border-orange-200',
};

const ROLE_SOFT_CLASSES: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  cartera: 'bg-purple-100 text-purple-700',
  coordinador: 'bg-amber-100 text-amber-700',
  despachador: 'bg-rose-100 text-rose-700',
  produccion: 'bg-indigo-100 text-indigo-700',
  camara: 'bg-cyan-100 text-cyan-700',
  facturacion: 'bg-emerald-100 text-emerald-700',
  despachador1: 'bg-rose-100 text-rose-700',
  despachador2: 'bg-pink-100 text-pink-700',
  despachador3: 'bg-orange-100 text-orange-700',
};

export function roleLabel(role: UserRole | string): string {
  return ROLE_LABELS[role as UserRole] || role;
}

export function roleBadgeClass(role: UserRole | string): string {
  return ROLE_BADGE_CLASSES[role as UserRole] || 'bg-gray-100 text-gray-700 border-gray-200';
}

export function roleSoftClass(role: UserRole | string): string {
  return ROLE_SOFT_CLASSES[role as UserRole] || 'bg-gray-100 text-gray-700';
}