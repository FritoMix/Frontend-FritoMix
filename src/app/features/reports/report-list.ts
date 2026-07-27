import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { ClientService } from '../../core/services/client.service';
import { DispatchService } from '../../core/services/dispatch.service';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--blue">11.</span>
        <h1 class="text-2xl font-extrabold text-[#071938]">Reportes</h1>
      </div>
    </div>

    <!-- Filters & Actions -->
    <div class="fm-card p-5 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">Periodo</label>
          <select
            [(ngModel)]="periodo"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
          >
            <option value="hoy">Hoy</option>
            <option value="semana">Semana actual</option>
            <option value="mes">Mes actual</option>
            <option value="trimestre">Trimestre</option>
            <option value="ano">Año</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">Tipo de reporte</label>
          <select
            [(ngModel)]="tipoReporte"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
          >
            <option value="ventas">Ventas</option>
            <option value="inventario">Inventario</option>
            <option value="despachos">Despachos</option>
            <option value="clientes">Clientes</option>
            <option value="productos">Productos</option>
          </select>
        </div>
        <div class="flex gap-2 col-span-2 justify-end">
          <button
            class="bg-[#0055FF] hover:bg-[#0044DD] text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm"
          >
            Aplicar Filtro
          </button>
          <button
            class="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-4 rounded-lg text-sm transition-colors"
          >
            Exportar Excel
          </button>
        </div>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
      @for (kpi of kpis; track kpi.label) {
        <div class="fm-card p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg" [class]="kpi.bgColor">
              {{ kpi.icon }}
            </div>
            <span class="status-badge bg-green-50 text-green-700 border-green-200">
              {{ kpi.change }}
            </span>
          </div>
          <p class="text-xs text-gray-500 mb-0.5">{{ kpi.label }}</p>
          <p class="text-2xl font-extrabold text-[#071938]">{{ kpi.value }}</p>
        </div>
      }
    </div>

    <!-- Tables Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Top Productos -->
      <div class="fm-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-[#071938]">Top Productos Vendidos</h3>
        </div>
        <table class="fm-table">
          <thead>
            <tr class="bg-gray-50/60">
              <th>#</th>
              <th>Producto</th>
              <th class="text-right">Unidades</th>
              <th class="text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            @for (p of topProducts; track p.rank) {
              <tr>
                <td class="font-bold text-xs text-gray-500">{{ p.rank }}</td>
                <td class="font-semibold text-[#071938] text-xs">{{ p.name }}</td>
                <td class="text-right font-bold text-xs text-gray-800">{{ p.units | number }}</td>
                <td class="text-right font-extrabold text-xs text-[#071938]">{{ p.amount | currency:'$':'symbol':'1.0-0' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Top Clientes -->
      <div class="fm-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-[#071938]">Top Clientes</h3>
        </div>
        <table class="fm-table">
          <thead>
            <tr class="bg-gray-50/60">
              <th>Cliente</th>
              <th class="text-right">Pedidos</th>
              <th class="text-right">Monto Total</th>
            </tr>
          </thead>
          <tbody>
            @for (c of topClients; track c.name) {
              <tr>
                <td class="font-semibold text-[#071938] text-xs">{{ c.name }}</td>
                <td class="text-right font-bold text-xs text-gray-800">{{ c.orders }}</td>
                <td class="text-right font-extrabold text-xs text-[#071938]">{{ c.amount | currency:'$':'symbol':'1.0-0' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ReportListComponent {
  router = inject(Router);
  orderService = inject(OrderService);
  productService = inject(ProductService);
  clientService = inject(ClientService);
  dispatchService = inject(DispatchService);
  inventoryService = inject(InventoryService);

  periodo = 'mes';
  tipoReporte = 'ventas';

  kpis = [
    { label: 'Ventas totales período', value: '$48.560.000', icon: '💰', bgColor: 'bg-emerald-50 text-emerald-600', change: '↑ 12%' },
    { label: 'Pedidos completados', value: '68', icon: '📋', bgColor: 'bg-blue-50 text-blue-600', change: '↑ 8%' },
    { label: 'Productos despachados (und)', value: '25.680', icon: '📦', bgColor: 'bg-purple-50 text-purple-600', change: '↑ 15%' }
  ];

  topProducts = [
    { rank: 1, name: 'TRADICIONAL SURT MIX X 250 UND', code: 'PR-101', units: 5280, amount: 66000000 },
    { rank: 2, name: 'LENTEJA CRIOLLA 500 G Bx24', code: 'PR-102', units: 4820, amount: 41000000 },
    { rank: 3, name: 'MANÍ SALADO JUMBO 150 G Bx50', code: 'PR-105', units: 4350, amount: 19600000 }
  ];

  topClients = [
    { name: 'IBAGUÉ - SANDRA SAENZ', orders: 18, amount: 15200000 },
    { name: 'SUPERMERCADO LA 14', orders: 12, amount: 11800000 },
    { name: 'DISTRIBUCIONES ELITE', orders: 8, amount: 8500000 }
  ];
}
