import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clients/client-list').then(m => m.ClientListComponent),
        canActivate: [roleGuard(['admin', 'coordinador'])]
      },
      {
        path: 'clientes/nuevo',
        loadComponent: () => import('./features/clients/client-form').then(m => m.ClientFormComponent),
        canActivate: [roleGuard(['admin', 'coordinador'])]
      },
      {
        path: 'clientes/:id',
        loadComponent: () => import('./features/clients/client-form').then(m => m.ClientFormComponent),
        canActivate: [roleGuard(['admin', 'coordinador'])]
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/products/product-list').then(m => m.ProductListComponent),
        canActivate: [roleGuard(['admin', 'contador', 'coordinador'])]
      },
      {
        path: 'productos/nuevo',
        loadComponent: () => import('./features/products/product-form').then(m => m.ProductFormComponent),
        canActivate: [roleGuard(['admin', 'contador', 'coordinador'])]
      },
      {
        path: 'productos/:id',
        loadComponent: () => import('./features/products/product-form').then(m => m.ProductFormComponent),
        canActivate: [roleGuard(['admin', 'contador', 'coordinador'])]
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/users/user-list').then(m => m.UserListComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'usuarios/nuevo',
        loadComponent: () => import('./features/users/user-form').then(m => m.UserFormComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'usuarios/:id',
        loadComponent: () => import('./features/users/user-form').then(m => m.UserFormComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/role-list').then(m => m.RoleListComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'roles/nuevo',
        loadComponent: () => import('./features/roles/role-form').then(m => m.RoleFormComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'roles/:id',
        loadComponent: () => import('./features/roles/role-form').then(m => m.RoleFormComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/orders/order-list').then(m => m.OrderListComponent),
        canActivate: [roleGuard(['admin', 'coordinador'])]
      },
      {
        path: 'pedidos/nuevo',
        loadComponent: () => import('./features/orders/order-form').then(m => m.OrderFormComponent),
        canActivate: [roleGuard(['admin', 'coordinador'])]
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('./features/orders/order-detail').then(m => m.OrderDetailComponent),
        canActivate: [roleGuard(['admin', 'coordinador'])]
      },
      {
        path: 'pedidos/:id/editar',
        loadComponent: () => import('./features/orders/order-form').then(m => m.OrderFormComponent),
        canActivate: [roleGuard(['admin', 'coordinador'])]
      },
      {
        path: 'despachos',
        loadComponent: () => import('./features/dispatchs/dispatch-list').then(m => m.DispatchListComponent),
        canActivate: [roleGuard(['admin', 'coordinador', 'despachador'])]
      },
      {
        path: 'despachos/nuevo',
        loadComponent: () => import('./features/dispatchs/dispatch-form').then(m => m.DispatchFormComponent),
        canActivate: [roleGuard(['admin', 'coordinador', 'despachador'])]
      },
      {
        path: 'despachos/:id/editar',
        loadComponent: () => import('./features/dispatchs/dispatch-form').then(m => m.DispatchFormComponent),
        canActivate: [roleGuard(['admin', 'coordinador', 'despachador'])]
      },
      {
        path: 'conductores',
        loadComponent: () => import('./features/drivers/driver-list').then(m => m.DriverListComponent),
        canActivate: [roleGuard(['admin', 'despachador'])]
      },
      {
        path: 'conductores/nuevo',
        loadComponent: () => import('./features/drivers/driver-form').then(m => m.DriverFormComponent),
        canActivate: [roleGuard(['admin', 'despachador'])]
      },
      {
        path: 'conductores/:id',
        loadComponent: () => import('./features/drivers/driver-form').then(m => m.DriverFormComponent),
        canActivate: [roleGuard(['admin', 'despachador'])]
      },
      {
        path: 'vehiculos',
        loadComponent: () => import('./features/vehicles/vehicle-list').then(m => m.VehicleListComponent),
        canActivate: [roleGuard(['admin', 'despachador'])]
      },
      {
        path: 'vehiculos/nuevo',
        loadComponent: () => import('./features/vehicles/vehicle-form').then(m => m.VehicleFormComponent),
        canActivate: [roleGuard(['admin', 'despachador'])]
      },
      {
        path: 'vehiculos/:id',
        loadComponent: () => import('./features/vehicles/vehicle-form').then(m => m.VehicleFormComponent),
        canActivate: [roleGuard(['admin', 'despachador'])]
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/reports/report-list').then(m => m.ReportListComponent),
        canActivate: [roleGuard(['admin', 'contador', 'coordinador'])]
      },
      {
        path: 'mi-perfil',
        loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent),
        canActivate: [roleGuard(['admin', 'contador', 'coordinador', 'despachador'])]
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/settings/settings').then(m => m.SettingsComponent),
        canActivate: [roleGuard(['admin'])]
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
