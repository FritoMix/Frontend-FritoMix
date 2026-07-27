import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface OrderItem {
  item: number;
  code: string;
  description: string;
  presentation: string;
  bultos: number;
  cajas: number;
  units: number;
  weight: string;
  status: string;
  family: string;
}

interface DispatchGroup {
  group: string;
  products: { product: string; quantity: number; lot: string; prodDate: string; expDate: string; location: string; notes: string }[];
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Action Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <a routerLink="/pedidos" class="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            Volver a Pedidos
          </a>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
            Guardar
          </button>
          <button class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Editar
          </button>
          <button class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Aprobar
          </button>
          <button (click)="generatePDF()" class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            Generar PDF
          </button>
          <button (click)="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Imprimir
          </button>
          <button class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Enviar Correo
          </button>
          <button class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Exportar Excel
          </button>
        </div>
      </div>

      <!-- Document Content for PDF -->
      <div id="order-document" class="space-y-6">
        <!-- Header -->
        <div class="fm-card p-6">
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div class="flex items-center gap-5">
              <div class="w-20 h-20 bg-[#071938] rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg flex-shrink-0">
                <span class="text-3xl">FM</span>
              </div>
              <div>
                <h1 class="text-3xl font-extrabold text-[#071938] tracking-tight">ORDEN DE PEDIDO Y CARGUE</h1>
                <p class="text-lg font-bold text-[#1E3A8A] mt-0.5">FRITOMIX S.A.S.</p>
                <p class="text-sm text-gray-500">Gesti&oacute;n de Ventas y Despachos</p>
              </div>
            </div>
            <div class="bg-gray-50 rounded-xl border border-gray-200 p-4 min-w-[200px]">
              <table class="text-sm w-full">
                <tr><td class="font-semibold text-gray-500 pr-4 py-1">C&oacute;digo:</td><td class="font-bold text-[#071938]">FM-OPC-001</td></tr>
                <tr><td class="font-semibold text-gray-500 pr-4 py-1">Versi&oacute;n:</td><td class="font-bold text-[#071938]">2.0</td></tr>
                <tr><td class="font-semibold text-gray-500 pr-4 py-1">Fecha:</td><td class="font-bold text-[#071938]">{{ today }}</td></tr>
                <tr><td class="font-semibold text-gray-500 pr-4 py-1">P&aacute;gina:</td><td class="font-bold text-[#071938]">1 / 1</td></tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Info Cards Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Cliente -->
          <div class="fm-card p-5">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <h3 class="font-bold text-[#071938] text-sm">Informaci&oacute;n del Cliente</h3>
            </div>
            <div class="space-y-2.5 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Cliente:</span><span class="font-semibold text-[#071938] text-right">DISTRIBUCIONES ELITE S.A.S</span></div>
              <div class="flex justify-between"><span class="text-gray-500">C&oacute;digo:</span><span class="font-semibold text-[#071938]">CLI-0042</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Ciudad:</span><span class="font-semibold text-[#071938]">BOGOT&Aacute; D.C.</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Departamento:</span><span class="font-semibold text-[#071938]">CUNDINAMARCA</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Direcci&oacute;n:</span><span class="font-semibold text-[#071938] text-right">Cra 42 # 15-35 Bodega 7</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Tel&eacute;fono:</span><span class="font-semibold text-[#071938]">(601) 745 6321</span></div>
            </div>
          </div>

          <!-- Comercial -->
          <div class="fm-card p-5">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <h3 class="font-bold text-[#071938] text-sm">Informaci&oacute;n Comercial</h3>
            </div>
            <div class="space-y-2.5 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Fecha Pedido:</span><span class="font-semibold text-[#071938]">25/07/2026</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Coordinador:</span><span class="font-semibold text-[#071938]">Mar&iacute;a Fernanda L&oacute;pez</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Estado:</span><span class="status-badge bg-amber-50 text-amber-700 border-amber-200 text-xs">EN PREPARACI&Oacute;N</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Prioridad:</span><span class="font-semibold text-[#071938]"><span class="text-amber-500">●●●</span> Alta</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Tipo Venta:</span><span class="font-semibold text-[#071938]">Contado</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Canal:</span><span class="font-semibold text-[#071938]">Mayorista</span></div>
            </div>
          </div>

          <!-- Despacho -->
          <div class="fm-card p-5">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
              </div>
              <h3 class="font-bold text-[#071938] text-sm">Informaci&oacute;n del Despacho</h3>
            </div>
            <div class="space-y-2.5 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Despachador:</span><span class="font-semibold text-[#071938]">Carlos Andr&eacute;s Mu&ntilde;oz</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Aux. Producci&oacute;n:</span><span class="font-semibold text-[#071938]">Pedro Jim&eacute;nez</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Veh&iacute;culo:</span><span class="font-semibold text-[#071938]">Turbo 3000</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Placa:</span><span class="font-semibold text-[#071938]">ABC-123</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Lote General:</span><span class="font-semibold text-[#071938]">LTE-2026-07-25</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Estado Despacho:</span><span class="status-badge bg-blue-50 text-blue-700 border-blue-200 text-xs">PREPARANDO</span></div>
            </div>
          </div>
        </div>

        <!-- Tabla Principal: Pedido -->
        <div class="fm-card overflow-hidden">
          <div class="p-5 pb-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              </div>
              <h3 class="font-bold text-[#071938]">Detalle del Pedido</h3>
            </div>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input [(ngModel)]="searchTerm" placeholder="Buscar producto..." class="border border-gray-300 rounded-lg py-1.5 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-56"/>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="fm-table">
              <thead>
                <tr class="bg-gray-50/60">
                  <th class="!pl-6 w-12">Item</th>
                  <th class="w-20">C&oacute;digo</th>
                  <th>Descripci&oacute;n del Producto</th>
                  <th class="text-center w-24">Presentaci&oacute;n</th>
                  <th class="text-right w-16">Bultos</th>
                  <th class="text-right w-16">Cajas</th>
                  <th class="text-right w-20">Unidades</th>
                  <th class="text-right w-20">Peso</th>
                  <th class="text-center w-24">Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filteredItems(); track item.item; let i = $index) {
                  <tr [class]="getRowClass(item.family, i)">
                    <td class="!pl-6 font-mono text-sm">{{ item.item }}</td>
                    <td class="font-mono text-sm font-semibold text-[#071938]">{{ item.code }}</td>
                    <td><span class="font-medium text-[#071938]">{{ item.description }}</span></td>
                    <td class="text-center text-sm text-gray-600">{{ item.presentation }}</td>
                    <td class="text-right font-semibold">{{ item.bultos }}</td>
                    <td class="text-right font-semibold">{{ item.cajas }}</td>
                    <td class="text-right font-semibold">{{ item.units }}</td>
                    <td class="text-right text-sm text-gray-600">{{ item.weight }}</td>
                    <td class="text-center">
                      <span class="inline-block w-2 h-2 rounded-full" [class]="item.status === 'Disponible' ? 'bg-green-500' : item.status === 'Pendiente' ? 'bg-amber-500' : 'bg-red-500'" [title]="item.status"></span>
                      <span class="text-xs ml-1.5 text-gray-500">{{ item.status }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="flex items-center justify-between px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>{{ filteredItems().length }} productos</span>
          </div>
        </div>

        <!-- Tabla Despacho -->
        <div class="fm-card overflow-hidden">
          <div class="p-5 pb-3 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <h3 class="font-bold text-[#071938]">Despacho por Grupos</h3>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="fm-table">
              <thead>
                <tr class="bg-gray-50/60">
                  <th class="!pl-6">Grupo</th>
                  <th>Producto</th>
                  <th class="text-right w-20">Cantidad</th>
                  <th class="w-28">Lote</th>
                  <th class="w-28">Fecha Producci&oacute;n</th>
                  <th class="w-28">Fecha Vencimiento</th>
                  <th class="w-32">Ubicaci&oacute;n Bodega</th>
                  <th class="!pr-6">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                @for (group of dispatchGroups; track group.group) {
                  @for (prod of group.products; track prod.lot; let first = $first) {
                    <tr class="hover:bg-gray-50/50">
                      @if (first) {
                        <td class="!pl-6 font-bold text-[#071938]" [attr.rowspan]="group.products.length">{{ group.group }}</td>
                      }
                      <td><span class="font-medium text-[#071938]">{{ prod.product }}</span></td>
                      <td class="text-right font-semibold">{{ prod.quantity }}</td>
                      <td class="font-mono text-sm">{{ prod.lot }}</td>
                      <td class="text-sm">{{ prod.prodDate }}</td>
                      <td class="text-sm">{{ prod.expDate }}</td>
                      <td class="text-sm">{{ prod.location }}</td>
                      <td class="!pr-6 text-sm text-gray-500">{{ prod.notes }}</td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- KPI Summary -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="fm-card p-4 text-center">
            <div class="w-10 h-10 mx-auto rounded-xl bg-blue-100 flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <p class="text-2xl font-extrabold text-[#071938]">12</p>
            <p class="text-xs text-gray-500 mt-0.5">Productos</p>
          </div>
          <div class="fm-card p-4 text-center">
            <div class="w-10 h-10 mx-auto rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
            <p class="text-2xl font-extrabold text-[#071938]">45</p>
            <p class="text-xs text-gray-500 mt-0.5">Bultos</p>
          </div>
          <div class="fm-card p-4 text-center">
            <div class="w-10 h-10 mx-auto rounded-xl bg-amber-100 flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
            </div>
            <p class="text-2xl font-extrabold text-[#071938]">180</p>
            <p class="text-xs text-gray-500 mt-0.5">Cajas</p>
          </div>
          <div class="fm-card p-4 text-center">
            <div class="w-10 h-10 mx-auto rounded-xl bg-purple-100 flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
            <p class="text-2xl font-extrabold text-[#071938]">3,600</p>
            <p class="text-xs text-gray-500 mt-0.5">Unidades</p>
          </div>
          <div class="fm-card p-4 text-center">
            <div class="w-10 h-10 mx-auto rounded-xl bg-rose-100 flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
            </div>
            <p class="text-2xl font-extrabold text-[#071938]">2,850</p>
            <p class="text-xs text-gray-500 mt-0.5">Peso Total (Kg)</p>
          </div>
          <div class="fm-card p-4 text-center border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <div class="w-10 h-10 mx-auto rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p class="text-2xl font-extrabold text-[#071938]">$ 18,450,000</p>
            <p class="text-xs text-gray-500 mt-0.5">Valor Total</p>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="fm-card p-5">
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </div>
            <h3 class="font-bold text-[#071938] text-sm">Observaciones del Pedido</h3>
          </div>
          <textarea
            class="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            rows="4"
            placeholder="Agregar observaciones..."
          >{{ 'Producto delicado, manejar con cuidado.\\nEntrega antes de las 2:00 PM.\\nFacturar a nombre de la empresa.' }}</textarea>
        </div>

        <!-- Transporte y Firmas -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Transporte -->
          <div class="fm-card p-5">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div class="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 01-4 0zM3 9h1l2-4h8l2 4h5v4h-1m-16 0h16"/></svg>
              </div>
              <h3 class="font-bold text-[#071938] text-sm">Informaci&oacute;n del Transporte</h3>
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div><span class="text-gray-500 block text-xs">Conductor</span><span class="font-semibold text-[#071938]">Jhon Jairo Rojas</span></div>
              <div><span class="text-gray-500 block text-xs">Documento</span><span class="font-semibold text-[#071938]">CC 79.543.210</span></div>
              <div><span class="text-gray-500 block text-xs">Tel&eacute;fono</span><span class="font-semibold text-[#071938]">310 245 7890</span></div>
              <div><span class="text-gray-500 block text-xs">Veh&iacute;culo / Placa</span><span class="font-semibold text-[#071938]">Turbo 3000 - ABC-123</span></div>
              <div><span class="text-gray-500 block text-xs">Fecha Despacho</span><span class="font-semibold text-[#071938]">25/07/2026</span></div>
              <div><span class="text-gray-500 block text-xs">Hora Salida</span><span class="font-semibold text-[#071938]">14:30</span></div>
              <div><span class="text-gray-500 block text-xs">Hora Est. Entrega</span><span class="font-semibold text-[#071938]">16:45</span></div>
              <div><span class="text-gray-500 block text-xs">Ruta</span><span class="font-semibold text-[#071938]">Bogot&aacute; - Soacha</span></div>
              <div class="col-span-2"><span class="text-gray-500 block text-xs">Ciudad Destino</span><span class="font-semibold text-[#071938]">Soacha - Cundinamarca</span></div>
            </div>
          </div>

          <!-- Firmas -->
          <div class="fm-card p-5">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </div>
              <h3 class="font-bold text-[#071938] text-sm">Firmas</h3>
            </div>
            <div class="space-y-5">
              <div>
                <p class="text-xs font-semibold text-gray-500 mb-1">Elabor&oacute; (Coordinador)</p>
                <div class="border-b border-gray-300 pb-2"></div>
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Firma</span><span>Mar&iacute;a Fernanda L&oacute;pez</span><span>Coordinadora</span>
                </div>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 mb-1">Revis&oacute; (Despachador)</p>
                <div class="border-b border-gray-300 pb-2"></div>
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Firma</span><span>Carlos Andr&eacute;s Mu&ntilde;oz</span><span>Despachador</span>
                </div>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 mb-1">Recibi&oacute; (Conductor)</p>
                <div class="border-b border-gray-300 pb-2"></div>
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Firma</span><span>Jhon Jairo Rojas</span><span>Conductor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .row-tradicional { background-color: #F8FAFC; }
    :host ::ng-deep .row-granos { background-color: #FFFBEB; }
    :host ::ng-deep .row-frutos { background-color: #ECFDF5; }
    :host ::ng-deep .row-maiz { background-color: #FAF5FF; }
    :host ::ng-deep .row-mani { background-color: #FFF7ED; }
    :host ::ng-deep .row-nacho { background-color: #FEF2F2; }
  `]
})
export class OrderDetailComponent {
  window = window;
  searchTerm = signal('');
  today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });

  orderItems = signal<OrderItem[]>([
    { item: 1, code: 'PR-101', description: 'TRADICIONAL SURT MIX X 250 UND', presentation: '12 UND', bultos: 8, cajas: 32, units: 384, weight: '96 Kg', status: 'Disponible', family: 'Tradicional' },
    { item: 2, code: 'PR-102', description: 'LENTEJA CRIOLLA 500 G Bx24', presentation: '24 UND', bultos: 5, cajas: 20, units: 480, weight: '240 Kg', status: 'Disponible', family: 'Granos & Snacks' },
    { item: 3, code: 'PR-103', description: 'ALMENDRA HOLLADA 250 G Bx30', presentation: '30 UND', bultos: 6, cajas: 24, units: 720, weight: '180 Kg', status: 'Disponible', family: 'Frutos Secos' },
    { item: 4, code: 'PR-104', description: 'MAÍZ PIRA TOSTADO 250 G Bx40', presentation: '40 UND', bultos: 7, cajas: 28, units: 1120, weight: '280 Kg', status: 'Pendiente', family: 'Maíz' },
    { item: 5, code: 'PR-105', description: 'MANÍ SALADO JUMBO 150 G Bx50', presentation: '50 UND', bultos: 10, cajas: 40, units: 2000, weight: '300 Kg', status: 'Disponible', family: 'Maní' },
    { item: 6, code: 'PR-106', description: 'NACHO PICANTE 200G X30 UND', presentation: '30 UND', bultos: 4, cajas: 16, units: 480, weight: '96 Kg', status: 'Disponible', family: 'Nachos & Totopos' },
    { item: 7, code: 'PR-107', description: 'TOZIMIEL TOCINO 20G 12UD 16DIS', presentation: '12 UND', bultos: 3, cajas: 12, units: 144, weight: '28.8 Kg', status: 'Disponible', family: 'Tradicional' },
    { item: 8, code: 'PR-108', description: 'KIKITOS SURTIDO LS 33G 12 UD 10DIS', presentation: '12 UND', bultos: 2, cajas: 8, units: 96, weight: '31.68 Kg', status: 'Pendiente', family: 'Maíz' },
  ]);

  filteredItems = () => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.orderItems();
    return this.orderItems().filter(i =>
      i.description.toLowerCase().includes(term) ||
      i.code.toLowerCase().includes(term)
    );
  };

  getRowClass(family: string, index: number): string {
    const base = index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30';
    const familyMap: Record<string, string> = {
      'Tradicional': 'hover:bg-blue-50/50',
      'Granos & Snacks': 'hover:bg-amber-50/50',
      'Frutos Secos': 'hover:bg-emerald-50/50',
      'Maíz': 'hover:bg-purple-50/50',
      'Maní': 'hover:bg-orange-50/50',
      'Nachos & Totopos': 'hover:bg-red-50/50',
    };
    return `${base} ${familyMap[family] || 'hover:bg-gray-50/50'}`;
  }

  dispatchGroups: DispatchGroup[] = [
    {
      group: 'Grupo A',
      products: [
        { product: 'TRADICIONAL SURT MIX X 250 UND', quantity: 384, lot: 'LTE-2026-07-A01', prodDate: '20/07/2026', expDate: '20/10/2026', location: 'Bodega 1 - Est. A1', notes: 'Pallet 1' },
        { product: 'LENTEJA CRIOLLA 500 G Bx24', quantity: 480, lot: 'LTE-2026-07-A02', prodDate: '18/07/2026', expDate: '18/01/2027', location: 'Bodega 1 - Est. B2', notes: '' },
      ]
    },
    {
      group: 'Grupo B',
      products: [
        { product: 'ALMENDRA HOLLADA 250 G Bx30', quantity: 720, lot: 'LTE-2026-07-B01', prodDate: '22/07/2026', expDate: '22/01/2027', location: 'Bodega 2 - Est. C3', notes: 'Pallet 2' },
        { product: 'MAÍZ PIRA TOSTADO 250 G Bx40', quantity: 1120, lot: 'LTE-2026-07-B02', prodDate: '19/07/2026', expDate: '19/10/2026', location: 'Bodega 2 - Est. D4', notes: 'Pendiente producción' },
      ]
    },
    {
      group: 'Grupo C',
      products: [
        { product: 'MANÍ SALADO JUMBO 150 G Bx50', quantity: 2000, lot: 'LTE-2026-07-C01', prodDate: '21/07/2026', expDate: '21/10/2026', location: 'Bodega 1 - Est. E5', notes: 'Pallet 3' },
        { product: 'NACHO PICANTE 200G X30 UND', quantity: 480, lot: 'LTE-2026-07-C02', prodDate: '20/07/2026', expDate: '20/10/2026', location: 'Bodega 3 - Est. F6', notes: '' },
        { product: 'TOZIMIEL TOCINO 20G 12UD 16DIS', quantity: 144, lot: 'LTE-2026-07-C03', prodDate: '23/07/2026', expDate: '23/10/2026', location: 'Bodega 1 - Est. G7', notes: 'Caja sellada' },
      ]
    },
    {
      group: 'Grupo D',
      products: [
        { product: 'KIKITOS SURTIDO LS 33G 12 UD 10DIS', quantity: 96, lot: 'LTE-2026-07-D01', prodDate: '24/07/2026', expDate: '24/10/2026', location: 'Bodega 3 - Est. H8', notes: 'Pendiente' },
      ]
    }
  ];

  generatePDF() {
    const element = document.getElementById('order-document');
    if (!element) return;

    html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(`ORDEN-PEDIDO-FM-OPC-001-${this.today.replace(/\//g, '-')}.pdf`);
    });
  }
}
