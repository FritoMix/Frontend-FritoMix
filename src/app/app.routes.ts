import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ROUTE_ROLES } from './core/config/route-access';
import { UserRole } from './core/models/user.model';

function roles(path: string): UserRole[] {
  return [...(ROUTE_ROLES[path] ?? [])] as UserRole[];
}

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard(roles('dashboard'))]
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clients/client-list.component').then(m => m.ClientListComponent),
        canActivate: [roleGuard(roles('clientes'))]
      },
      {
        path: 'clientes/nuevo',
        loadComponent: () => import('./features/clients/client-form.component').then(m => m.ClientFormComponent),
        canActivate: [roleGuard(roles('clientes/nuevo'))]
      },
      {
        path: 'clientes/:id',
        loadComponent: () => import('./features/clients/client-form.component').then(m => m.ClientFormComponent),
        canActivate: [roleGuard(roles('clientes/:id'))]
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/products/product-list.component').then(m => m.ProductListComponent),
        canActivate: [roleGuard(roles('productos'))]
      },
      {
        path: 'productos/nuevo',
        loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent),
        canActivate: [roleGuard(roles('productos/nuevo'))]
      },
      {
        path: 'productos/:id',
        loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent),
        canActivate: [roleGuard(roles('productos/:id'))]
      },
      {
        path: 'categorias',
        loadComponent: () => import('./features/categories/category-list.component').then(m => m.CategoryListComponent),
        canActivate: [roleGuard(roles('categorias'))]
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/users/user-list.component').then(m => m.UserListComponent),
        canActivate: [roleGuard(roles('usuarios'))]
      },
      {
        path: 'usuarios/nuevo',
        loadComponent: () => import('./features/users/user-form.component').then(m => m.UserFormComponent),
        canActivate: [roleGuard(roles('usuarios/nuevo'))]
      },
      {
        path: 'usuarios/:id',
        loadComponent: () => import('./features/users/user-form.component').then(m => m.UserFormComponent),
        canActivate: [roleGuard(roles('usuarios/:id'))]
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/role-list.component').then(m => m.RoleListComponent),
        canActivate: [roleGuard(roles('roles'))]
      },
      {
        path: 'roles/nuevo',
        loadComponent: () => import('./features/roles/role-form.component').then(m => m.RoleFormComponent),
        canActivate: [roleGuard(roles('roles/nuevo'))]
      },
      {
        path: 'roles/:id',
        loadComponent: () => import('./features/roles/role-form.component').then(m => m.RoleFormComponent),
        canActivate: [roleGuard(roles('roles/:id'))]
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/orders/order-list.component').then(m => m.OrderListComponent),
        canActivate: [roleGuard(roles('pedidos'))]
      },
      {
        path: 'tipo-pedido',
        loadComponent: () => import('./features/tipo-pedido/tipo-pedido-list.component').then(m => m.TipoPedidoListComponent),
        canActivate: [roleGuard(roles('tipo-pedido'))]
      },
      {
        path: 'pedidos/nuevo',
        loadComponent: () => import('./features/orders/order-form.component').then(m => m.OrderFormComponent),
        canActivate: [roleGuard(roles('pedidos/nuevo'))]
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('./features/orders/order-detail.component').then(m => m.OrderDetailComponent),
        canActivate: [roleGuard(roles('pedidos/:id'))]
      },
      {
        path: 'pedidos/:id/editar',
        loadComponent: () => import('./features/orders/order-form.component').then(m => m.OrderFormComponent),
        canActivate: [roleGuard(roles('pedidos/:id/editar'))]
      },
      {
        path: 'produccion',
        loadComponent: () => import('./features/production/production-list.component').then(m => m.ProductionListComponent),
        canActivate: [roleGuard(roles('produccion'))]
      },
      {
        path: 'despacho1',
        loadComponent: () => import('./features/dispatchs/despacho1.component').then(m => m.Despacho1Component),
        canActivate: [roleGuard(roles('despacho1'))]
      },
      {
        path: 'despacho2',
        loadComponent: () => import('./features/dispatchs/despacho2.component').then(m => m.Despacho2Component),
        canActivate: [roleGuard(roles('despacho2'))]
      },
      {
        path: 'despachos',
        loadComponent: () => import('./features/dispatchs/dispatch-list.component').then(m => m.DispatchListComponent),
        canActivate: [roleGuard(roles('despachos'))]
      },
      {
        path: 'despachos/nuevo',
        loadComponent: () => import('./features/dispatchs/dispatch-form.component').then(m => m.DispatchFormComponent),
        canActivate: [roleGuard(roles('despachos/nuevo'))]
      },
      {
        path: 'despachos/:id',
        loadComponent: () => import('./features/dispatchs/dispatch-detail.component').then(m => m.DispatchDetailComponent),
        canActivate: [roleGuard(roles('despachos/:id'))]
      },
      {
        path: 'despachos/:id/editar',
        loadComponent: () => import('./features/dispatchs/dispatch-form.component').then(m => m.DispatchFormComponent),
        canActivate: [roleGuard(roles('despachos/:id/editar'))]
      },
      {
        path: 'conductores',
        loadComponent: () => import('./features/drivers/driver-list.component').then(m => m.DriverListComponent),
        canActivate: [roleGuard(roles('conductores'))]
      },
      {
        path: 'conductores/nuevo',
        loadComponent: () => import('./features/drivers/driver-form.component').then(m => m.DriverFormComponent),
        canActivate: [roleGuard(roles('conductores/nuevo'))]
      },
      {
        path: 'conductores/:id',
        loadComponent: () => import('./features/drivers/driver-form.component').then(m => m.DriverFormComponent),
        canActivate: [roleGuard(roles('conductores/:id'))]
      },
      {
        path: 'vehiculos',
        loadComponent: () => import('./features/vehicles/vehicle-list.component').then(m => m.VehicleListComponent),
        canActivate: [roleGuard(roles('vehiculos'))]
      },
      {
        path: 'vehiculos/nuevo',
        loadComponent: () => import('./features/vehicles/vehicle-form.component').then(m => m.VehicleFormComponent),
        canActivate: [roleGuard(roles('vehiculos/nuevo'))]
      },
      {
        path: 'vehiculos/:id',
        loadComponent: () => import('./features/vehicles/vehicle-form.component').then(m => m.VehicleFormComponent),
        canActivate: [roleGuard(roles('vehiculos/:id'))]
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/reports/report-list.component').then(m => m.ReportListComponent),
        canActivate: [roleGuard(roles('reportes'))]
      },
      {
        path: 'mi-perfil',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [roleGuard(roles('mi-perfil'))]
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [roleGuard(roles('configuracion'))]
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];