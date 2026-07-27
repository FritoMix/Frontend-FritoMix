import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--blue">1.</span>
        <div>
          <h1 class="text-2xl font-extrabold text-[#071938]">Dashboard</h1>
          <p class="text-xs text-gray-500 mt-0.5">Resumen general de la operación</p>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
      @for (kpi of kpis; track kpi.label) {
        <div class="fm-card p-5 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ kpi.label }}</p>
            <p class="text-3xl font-extrabold text-[#071938] mt-2">{{ kpi.value }}</p>
            <span class="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full" [class]="kpi.changeColor">
              {{ kpi.change }}
            </span>
          </div>
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl" [class]="kpi.bgColor">
            {{ kpi.icon }}
          </div>
        </div>
      }
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
      <!-- Ventas por mes (3/5) -->
      <div class="lg:col-span-3 fm-card p-5">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-[#071938]">Ventas por mes</h3>
          <select class="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none bg-white">
            <option>Este año</option>
            <option>Año pasado</option>
          </select>
        </div>
        <div class="flex items-end gap-2 h-44">
          @for (bar of monthlyBars; track bar.month) {
            <div class="flex-1 flex flex-col items-center gap-1">
              <div
                class="w-full rounded-t bg-[#0055FF] transition-all hover:bg-[#0044DD]"
                [style.height.%]="bar.percent"
              ></div>
              <span class="text-[10px] text-gray-500 font-semibold">{{ bar.month }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Pedidos por estado (2/5) -->
      <div class="lg:col-span-2 fm-card p-5">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-[#071938]">Pedidos por estado</h3>
          <select class="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none bg-white">
            <option>Este año</option>
          </select>
        </div>
        <div class="flex items-center gap-6">
          <!-- Donut chart -->
          <div
            class="w-32 h-32 rounded-full flex-shrink-0 relative flex items-center justify-center"
            style="background: conic-gradient(#0055FF 0deg 144deg, #F59E0B 144deg 216deg, #EF4444 216deg 264deg, #10B981 264deg 360deg);"
          >
            <div class="w-20 h-20 bg-white rounded-full"></div>
          </div>
          <!-- Legend -->
          <div class="flex flex-col gap-2.5 text-xs">
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-[#0055FF]"></span> <span class="text-gray-600 font-medium">Pendiente</span> <span class="ml-auto font-bold text-[#071938]">12</span></div>
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-[#F59E0B]"></span> <span class="text-gray-600 font-medium">En preparación</span> <span class="ml-auto font-bold text-[#071938]">6</span></div>
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-[#EF4444]"></span> <span class="text-gray-600 font-medium">Despachado</span> <span class="ml-auto font-bold text-[#071938]">4</span></div>
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-[#10B981]"></span> <span class="text-gray-600 font-medium">Entregado</span> <span class="ml-auto font-bold text-[#071938]">8</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Tables Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Productos más vendidos -->
      <div class="fm-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-[#071938]">Productos más vendidos</h3>
          <a href="#" class="text-xs text-[#0055FF] font-semibold hover:underline">Ver todos</a>
        </div>
        <table class="fm-table">
          <thead>
            <tr class="bg-gray-50/60">
              <th>Producto</th>
              <th>Código</th>
              <th class="text-right">Unidades</th>
            </tr>
          </thead>
          <tbody>
            @for (p of topProducts; track p.code) {
              <tr>
                <td class="font-semibold text-[#071938] text-xs">{{ p.name }}</td>
                <td><span class="code-badge" [class]="p.codeBg">{{ p.code }}</span></td>
                <td class="text-right font-bold text-[#071938]">{{ p.units | number }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Últimos pedidos -->
      <div class="fm-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-[#071938]">Últimos pedidos</h3>
          <a href="#" class="text-xs text-[#0055FF] font-semibold hover:underline">Ver todos</a>
        </div>
        <table class="fm-table">
          <thead>
            <tr class="bg-gray-50/60">
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th class="text-right">Fecha</th>
            </tr>
          </thead>
          <tbody>
            @for (o of recentOrders; track o.id) {
              <tr>
                <td class="font-mono text-xs font-bold text-[#071938]">{{ o.id }}</td>
                <td class="text-gray-600 text-xs font-medium">{{ o.client }}</td>
                <td>
                  <span class="status-badge" [class]="o.statusClass">{{ o.status }}</span>
                </td>
                <td class="text-right text-gray-500 text-xs">{{ o.date }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DashboardComponent {
  kpis = [
    { label: 'Pedidos del día', value: 24, icon: '📋', bgColor: 'bg-blue-50 text-[#0055FF]', change: '↑ 12%', changeColor: 'bg-green-50 text-green-700' },
    { label: 'Despachos pendientes', value: 8, icon: '🚚', bgColor: 'bg-amber-50 text-amber-600', change: '↑ 5%', changeColor: 'bg-green-50 text-green-700' },
    { label: 'Productos inventario', value: 152, icon: '📦', bgColor: 'bg-emerald-50 text-emerald-600', change: '↑ 8%', changeColor: 'bg-green-50 text-green-700' },
    { label: 'Clientes nuevos', value: 12, icon: '👥', bgColor: 'bg-purple-50 text-purple-600', change: '↑ 15%', changeColor: 'bg-green-50 text-green-700' },
  ];

  monthlyBars = [
    { month: 'Ene', percent: 10 }, { month: 'Feb', percent: 12 },
    { month: 'Mar', percent: 25 }, { month: 'Abr', percent: 30 },
    { month: 'May', percent: 35 }, { month: 'Jun', percent: 42 },
    { month: 'Jul', percent: 55 }, { month: 'Ago', percent: 50 },
    { month: 'Sep', percent: 65 }, { month: 'Oct', percent: 72 },
    { month: 'Nov', percent: 88 }, { month: 'Dic', percent: 95 },
  ];

  topProducts = [
    { name: 'TRADICIONAL SURT MIX 250 UND', code: 'PR-101', units: 1250, codeBg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'LENTEJA CRIOLLA 200 G 24X1', code: 'PR-102', units: 980, codeBg: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'ALMENDRA HOLLADA 250 G 30X1', code: 'PR-103', units: 860, codeBg: 'bg-green-50 text-green-700 border-green-200' },
    { name: 'YISMREL TOCINO 200 UND MDS', code: 'PR-104', units: 720, codeBg: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'NACHO PICANTE 200G X30 UND', code: 'PR-105', units: 640, codeBg: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  recentOrders = [
    { id: 'PED-00015', client: 'Sandra Saenz', status: 'PENDIENTE', statusClass: 'bg-amber-50 text-amber-700 border-amber-200', date: '15/07/2026' },
    { id: 'PED-00014', client: 'Supermercado La 14', status: 'EN PREPARACIÓN', statusClass: 'bg-blue-50 text-blue-700 border-blue-200', date: '15/07/2026' },
    { id: 'PED-00013', client: 'Tienda El Ahorro', status: 'DESPACHADO', statusClass: 'bg-purple-50 text-purple-700 border-purple-200', date: '14/07/2026' },
    { id: 'PED-00012', client: 'Distribuciones Elite', status: 'ENTREGADO', statusClass: 'bg-green-50 text-green-700 border-green-200', date: '14/07/2026' },
    { id: 'PED-00011', client: 'Comercializadora JJ', status: 'DESPACHADO', statusClass: 'bg-purple-50 text-purple-700 border-purple-200', date: '13/07/2026' },
  ];
}
