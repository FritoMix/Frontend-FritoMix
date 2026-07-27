import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
        loadComponent: () => import('./features/clients/client-list').then(m => m.ClientListComponent)
      },
      {
        path: 'clientes/nuevo',
        loadComponent: () => import('./features/clients/client-form').then(m => m.ClientFormComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/products/product-list').then(m => m.ProductListComponent)
      },
      {
        path: 'productos/nuevo',
        loadComponent: () => import('./features/products/product-form').then(m => m.ProductFormComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/users/user-list').then(m => m.UserListComponent)
      },
      {
        path: 'usuarios/nuevo',
        loadComponent: () => import('./features/users/user-form').then(m => m.UserFormComponent)
      },
      {
        path: 'usuarios/:id',
        loadComponent: () => import('./features/users/user-form').then(m => m.UserFormComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/orders/order-list').then(m => m.OrderListComponent)
      },
      {
        path: 'pedidos/nuevo',
        loadComponent: () => import('./features/orders/order-form').then(m => m.OrderFormComponent)
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('./features/orders/order-detail').then(m => m.OrderDetailComponent)
      },
      {
        path: 'despachos',
        loadComponent: () => import('./features/dispatchs/dispatch-list').then(m => m.DispatchListComponent)
      },
      {
        path: 'despachos/nuevo',
        loadComponent: () => import('./features/dispatchs/dispatch-form').then(m => m.DispatchFormComponent)
      },
      {
        path: 'conductores',
        loadComponent: () => import('./features/drivers/driver-list').then(m => m.DriverListComponent)
      },
      {
        path: 'conductores/nuevo',
        loadComponent: () => import('./features/drivers/driver-form').then(m => m.DriverFormComponent)
      },
      {
        path: 'vehiculos',
        loadComponent: () => import('./features/vehicles/vehicle-list').then(m => m.VehicleListComponent)
      },
      {
        path: 'vehiculos/nuevo',
        loadComponent: () => import('./features/vehicles/vehicle-form').then(m => m.VehicleFormComponent)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./features/inventory/inventory-list').then(m => m.InventoryListComponent)
      },
      {
        path: 'inventario/nuevo',
        loadComponent: () => import('./features/inventory/inventory-form').then(m => m.InventoryMovementFormComponent)
      },
      {
        path: 'lotes',
        loadComponent: () => import('./features/lots/lot-list').then(m => m.LotListComponent)
      },
      {
        path: 'lotes/nuevo',
        loadComponent: () => import('./features/lots/lot-form').then(m => m.LotFormComponent)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/reports/report-list').then(m => m.ReportListComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/settings/settings').then(m => m.SettingsComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
