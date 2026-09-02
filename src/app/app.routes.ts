import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

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
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clients/client-list.component').then(m => m.ClientListComponent),
        canActivate: [roleGuard(['admin', 'coordinador'])]
      },
      {
        path: 'clientes/nuevo',
        loadComponent: () => import('./features/clients/client-form.component').then(m => m.ClientFormComponent),
        canActivate: [roleGuard(['admin', 'coordinador'])]
      },
      {
        path: 'clientes/:id',
        loadComponent: () => import('./features/clients/client-form.component').then(m => m.ClientFormComponent),
        canActivate: [roleGuard(['admin', 'coordinador'])]
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/products/product-list.component').then(m => m.ProductListComponent),
        canActivate: [roleGuard(['admin', 'cartera', 'coordinador'])]
      },
      {
        path: 'productos/nuevo',
        loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent),
        canActivate: [roleGuard(['admin', 'cartera', 'coordinador'])]
      },
      {
        path: 'productos/:id',
        loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent),
        canActivate: [roleGuard(['admin', 'cartera', 'coordinador'])]
      },
      {
        path: 'categorias',
        loadComponent: () => import('./features/categories/category-list.component').then(m => m.CategoryListComponent),
        canActivate: [roleGuard(['admin', 'cartera', 'coordinador'])]
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/users/user-list.component').then(m => m.UserListComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'usuarios/nuevo',
        loadComponent: () => import('./features/users/user-form.component').then(m => m.UserFormComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'usuarios/:id',
        loadComponent: () => import('./features/users/user-form.component').then(m => m.UserFormComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/role-list.component').then(m => m.RoleListComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'roles/nuevo',
        loadComponent: () => import('./features/roles/role-form.component').then(m => m.RoleFormComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'roles/:id',
        loadComponent: () => import('./features/roles/role-form.component').then(m => m.RoleFormComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/orders/order-list.component').then(m => m.OrderListComponent),
        canActivate: [roleGuard(['admin', 'cartera', 'coordinador'])]
      },
      {
        path: 'pedidos/nuevo',
        loadComponent: () => import('./features/orders/order-form.component').then(m => m.OrderFormComponent),
        canActivate: [roleGuard(['admin', 'coordinador'])]
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('./features/orders/order-detail.component').then(m => m.OrderDetailComponent),
        canActivate: [roleGuard(['admin', 'cartera', 'coordinador'])]
      },
      {
        path: 'pedidos/:id/editar',
        loadComponent: () => import('./features/orders/order-form.component').then(m => m.OrderFormComponent),
        canActivate: [roleGuard(['admin', 'coordinador'])]
      },
      {
        path: 'despachos',
        loadComponent: () => import('./features/dispatchs/dispatch-list.component').then(m => m.DispatchListComponent),
        canActivate: [roleGuard(['admin', 'cartera', 'coordinador', 'despachador'])]
      },
      {
        path: 'despachos/nuevo',
        loadComponent: () => import('./features/dispatchs/dispatch-form.component').then(m => m.DispatchFormComponent),
        canActivate: [roleGuard(['admin', 'coordinador', 'despachador'])]
      },
      {
        path: 'despachos/:id',
        loadComponent: () => import('./features/dispatchs/dispatch-detail.component').then(m => m.DispatchDetailComponent),
        canActivate: [roleGuard(['admin', 'cartera', 'coordinador', 'despachador'])]
      },
      {
        path: 'despachos/:id/editar',
        loadComponent: () => import('./features/dispatchs/dispatch-form.component').then(m => m.DispatchFormComponent),
        canActivate: [roleGuard(['admin', 'coordinador', 'despachador'])]
      },
      {
        path: 'conductores',
        loadComponent: () => import('./features/drivers/driver-list.component').then(m => m.DriverListComponent),
        canActivate: [roleGuard(['admin', 'despachador'])]
      },
      {
        path: 'conductores/nuevo',
        loadComponent: () => import('./features/drivers/driver-form.component').then(m => m.DriverFormComponent),
        canActivate: [roleGuard(['admin', 'despachador'])]
      },
      {
        path: 'conductores/:id',
        loadComponent: () => import('./features/drivers/driver-form.component').then(m => m.DriverFormComponent),
        canActivate: [roleGuard(['admin', 'despachador'])]
      },
      {
        path: 'vehiculos',
        loadComponent: () => import('./features/vehicles/vehicle-list.component').then(m => m.VehicleListComponent),
        canActivate: [roleGuard(['admin', 'despachador'])]
      },
      {
        path: 'vehiculos/nuevo',
        loadComponent: () => import('./features/vehicles/vehicle-form.component').then(m => m.VehicleFormComponent),
        canActivate: [roleGuard(['admin', 'despachador'])]
      },
      {
        path: 'vehiculos/:id',
        loadComponent: () => import('./features/vehicles/vehicle-form.component').then(m => m.VehicleFormComponent),
        canActivate: [roleGuard(['admin', 'despachador'])]
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/reports/report-list.component').then(m => m.ReportListComponent),
        canActivate: [roleGuard(['admin', 'cartera', 'coordinador'])]
      },
      {
        path: 'mi-perfil',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [roleGuard(['admin', 'cartera', 'coordinador', 'despachador'])]
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [roleGuard(['admin'])]
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
