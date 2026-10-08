import { UserRole } from '../models/user.model';

export const ALL_ROLES: readonly UserRole[] = [
  'admin',
  'cartera',
  'coordinador',
  'despachador',
  'produccion',
  'camara',
  'facturacion',
  'despachador1',
  'despachador2',
  'despachador3',
];

export const ADMIN_COORDINADOR: readonly UserRole[] = ['admin', 'coordinador'];

export const ROUTE_ROLES: Readonly<Record<string, readonly UserRole[]>> = {
  'dashboard': ['admin', 'cartera', 'coordinador', 'despachador'],
  'clientes': ADMIN_COORDINADOR,
  'clientes/nuevo': ADMIN_COORDINADOR,
  'clientes/:id': ADMIN_COORDINADOR,
  'productos': ADMIN_COORDINADOR,
  'productos/nuevo': ADMIN_COORDINADOR,
  'productos/:id': ADMIN_COORDINADOR,
  'categorias': ADMIN_COORDINADOR,
  'usuarios': ['admin'],
  'usuarios/nuevo': ['admin'],
  'usuarios/:id': ['admin'],
  'roles': ['admin'],
  'roles/nuevo': ['admin'],
  'roles/:id': ['admin'],
  'pedidos': ['admin', 'cartera', 'coordinador'],
  'tipo-pedido': ADMIN_COORDINADOR,
  'pedidos/nuevo': ADMIN_COORDINADOR,
  'pedidos/:id': ['admin', 'cartera', 'coordinador', 'produccion'],
  'pedidos/:id/editar': ADMIN_COORDINADOR,
  'produccion': ['admin', 'produccion'],
  'despacho1': ['despachador1', 'admin'],
  'despacho2': ['despachador2', 'admin'],
  'despachos': ['admin', 'coordinador', 'despachador', 'despachador3'],
  'despachos/nuevo': ['admin', 'coordinador', 'despachador'],
  'despachos/:id': ['admin', 'coordinador', 'despachador', 'despachador1', 'despachador2', 'despachador3'],
  'despachos/:id/editar': ['admin', 'coordinador', 'despachador', 'despachador1', 'despachador2', 'despachador3'],
  'conductores': ['admin', 'despachador', 'despachador2'],
  'conductores/nuevo': ['admin', 'despachador', 'despachador2'],
  'conductores/:id': ['admin', 'despachador', 'despachador2'],
  'vehiculos': ['admin', 'despachador', 'despachador1'],
  'vehiculos/nuevo': ['admin', 'despachador', 'despachador1'],
  'vehiculos/:id': ['admin', 'despachador', 'despachador1'],
  'reportes': ['admin', 'cartera', 'coordinador'],
  'mi-perfil': ALL_ROLES,
  'configuracion': ['admin'],
};

export const roleHomeRoute: Readonly<Record<UserRole, string>> = {
  admin: '/dashboard',
  cartera: '/dashboard',
  coordinador: '/dashboard',
  despachador: '/despachos',
  produccion: '/produccion',
  camara: '/mi-perfil',
  facturacion: '/mi-perfil',
  despachador1: '/despacho1',
  despachador2: '/despacho2',
  despachador3: '/despachos',
};

export function homeRouteFor(role: UserRole | string | undefined): string {
  if (!role) return '/dashboard';
  return roleHomeRoute[role as UserRole] ?? '/dashboard';
}