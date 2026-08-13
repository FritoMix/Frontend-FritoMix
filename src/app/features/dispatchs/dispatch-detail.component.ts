import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DispatchService } from '../../core/services/dispatch.service';
import { AuthService } from '../../core/services/auth.service';
import { DispatchResponse, DispatchStatus, nextDispatchStatus } from '../../core/models/dispatch.model';

@Component({
  selector: 'app-dispatch-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--green">10.</span>
        <div>
          <h1 class="text-2xl font-extrabold text-[#071938]">Detalle del Despacho</h1>
          <nav class="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
            <a routerLink="/despachos" class="text-[#0055FF] hover:underline">Despachos</a>
            <span>/</span>
            <span class="text-gray-700 font-semibold">{{ despacho()?.dispatchNumber || 'DES-XXXXX' }}</span>
          </nav>
        </div>
      </div>
      <div class="flex items-center gap-2 mt-3 flex-wrap">
        <a routerLink="/despachos"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Volver
        </a>
        <a [routerLink]="['/despachos', despacho()?.id, 'editar']"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0055FF] hover:bg-[#0044DD] text-white text-sm font-bold transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          Editar
        </a>
        @if (puedeAvanzar() && nextStatus()) {
          <button (click)="avanzar()"
            class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            Avanzar a {{ statusLabel(nextStatus()!) }}
          </button>
        }
      </div>
    </div>

    @if (loading()) {
      <div class="flex items-center justify-center py-20">
        <span class="text-gray-500 text-sm">Cargando despacho...</span>
      </div>
    } @else if (despacho(); as d) {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div class="fm-card overflow-hidden">
          <div class="bg-[#071938] px-4 py-2"><h3 class="text-white font-bold text-sm">INFORMACIÓN DEL DESPACHO</h3></div>
          <div class="p-4 space-y-1.5 text-sm">
            <div class="flex gap-2"><span class="text-gray-500 w-32">N° Despacho:</span><span class="font-semibold font-mono">{{ d.dispatchNumber }}</span></div>
            <div class="flex gap-2"><span class="text-gray-500 w-32">Tipo:</span><span class="font-semibold">{{ d.tipoPedido === 'pedido_multipedido' ? 'MULTIPEDIDO' : 'ÚNICO' }}</span></div>
            <div class="flex gap-2"><span class="text-gray-500 w-32">Fecha:</span><span class="font-semibold">{{ d.dispatchDate | date:'dd/MM/yyyy HH:mm' }}</span></div>
            <div class="flex gap-2 items-center">
              <span class="text-gray-500 w-32">Estado:</span>
              <span class="status-badge" [class]="statusClass(d.status)">{{ statusLabel(d.status) }}</span>
            </div>
            <div class="flex gap-2 items-center">
              <span class="text-gray-500 w-32">Cumplimiento:</span>
              @if (d.cumplimiento) {
                <span [class]="d.cumplimiento === 'COMPLETO'
                  ? 'status-badge bg-green-50 text-green-700 border-green-200'
                  : 'status-badge bg-amber-50 text-amber-700 border-amber-200'">
                  {{ d.cumplimiento }}
                </span>
              } @else {
                <span class="text-gray-400">—</span>
              }
            </div>
            <div class="flex gap-2"><span class="text-gray-500 w-32">Creado por:</span><span class="font-semibold">{{ d.dispatchUserName || '—' }}</span></div>
          </div>
        </div>

        <div class="fm-card overflow-hidden">
          <div class="bg-blue-700 px-4 py-2"><h3 class="text-white font-bold text-sm">CONDUCTOR / VEHÍCULO</h3></div>
          <div class="p-4 space-y-1.5 text-sm">
            <div class="flex gap-2"><span class="text-gray-500 w-32">Conductor:</span><span class="font-semibold">{{ d.driverName || '—' }}</span></div>
            <div class="flex gap-2"><span class="text-gray-500 w-32">Documento:</span><span class="font-semibold">{{ d.driverDocument || '—' }}</span></div>
            <div class="flex gap-2"><span class="text-gray-500 w-32">Vehículo:</span><span class="font-semibold capitalize">{{ d.vehicleType || '—' }}</span></div>
            <div class="flex gap-2"><span class="text-gray-500 w-32">Nº Vehículo:</span><span class="font-semibold font-mono">{{ d.vehicleNumber || '—' }}</span></div>
          </div>
        </div>

        <div class="fm-card overflow-hidden">
          <div class="bg-[#071938] px-4 py-2"><h3 class="text-white font-bold text-sm">PEDIDOS</h3></div>
          <div class="p-4 space-y-1.5 text-sm">
            @for (o of d.orders ?? []; track o.id) {
              <div class="flex justify-between items-center">
                <a [routerLink]="['/pedidos', o.id]" class="font-mono font-semibold text-[#071938] hover:text-[#0055FF] transition-colors">
                  {{ o.orderNumber }}
                </a>
                <span class="text-xs text-gray-500">{{ o.clientName || '—' }}</span>
              </div>
            } @empty {
              <span class="text-gray-400">—</span>
            }
          </div>
        </div>
      </div>

      <div class="fm-card overflow-hidden mb-5">
        <div class="bg-[#071938] px-4 py-2"><h3 class="text-white font-bold text-sm">DETALLE DE PRODUCTOS</h3></div>
        <div class="overflow-x-auto">
          <table class="fm-table">
            <thead>
              <tr class="bg-gray-100">
                <th class="!pl-5 w-10">#</th>
                <th>Producto</th>
                <th class="text-center">Solicitado</th>
                <th class="text-center">Despachado</th>
                <th>Lotes</th>
                <th>Detalle de Producto</th>
                <th class="!pr-5">Observación</th>
              </tr>
            </thead>
            <tbody>
              @for (item of d.details ?? []; track item.id; let i = $index) {
                <tr>
                  <td class="!pl-5 font-mono text-sm">{{ i + 1 }}</td>
                  <td class="font-medium text-[#071938]">
                    {{ item.productName }}
                    <span class="block text-xs text-gray-400 font-mono">{{ item.productCode }}</span>
                  </td>
                  <td class="text-center font-semibold">{{ item.quantity }}</td>
                  <td class="text-center font-semibold">{{ item.delivered }}</td>
                  <td class="text-xs text-gray-600">{{ item.lote || '—' }}</td>
                  <td class="text-xs text-gray-600">{{ item.detalleProducto || '—' }}</td>
                  <td class="text-xs text-gray-600 !pr-5">{{ item.observations || '—' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-10 text-center text-sm text-gray-400">Sin productos</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="fm-card overflow-hidden mb-5">
        <div class="bg-[#071938] px-4 py-2"><h3 class="text-white font-bold text-sm">DETALLE DE ARRUMES</h3></div>
        <div class="overflow-x-auto">
          <table class="fm-table">
            <thead>
              <tr class="bg-gray-100">
                <th class="!pl-5 w-10">#</th>
                <th class="text-center">Nº Arrume</th>
                <th>Arrume Producto</th>
                <th class="text-center">Cantidad</th>
                <th>Lote</th>
              </tr>
            </thead>
            <tbody>
              @for (a of d.arrumes ?? []; track a.id; let i = $index) {
                <tr>
                  <td class="!pl-5 font-mono text-sm">{{ i + 1 }}</td>
                  <td class="text-center font-mono font-semibold">{{ a.numArrume ?? '—' }}</td>
                  <td class="font-medium text-[#071938]">{{ a.arrumeProducto || '—' }}</td>
                  <td class="text-center font-semibold">{{ a.cantidad ?? '—' }}</td>
                  <td class="text-xs text-gray-600">{{ a.lote || '—' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-10 text-center text-sm text-gray-400">Sin arrumes registrados</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="fm-card p-5">
        <h3 class="font-bold text-[#071938] text-sm mb-2">OBSERVACIONES DEL DESPACHO</h3>
        <p class="text-sm text-gray-600 whitespace-pre-wrap">{{ d.notes || '—' }}</p>
      </div>
    } @else {
      <div class="flex items-center justify-center py-16">
        <span class="text-gray-500 text-sm">No se encontró el despacho.</span>
      </div>
    }
  `
})
export class DispatchDetailComponent implements OnInit {
  private dispatchService = inject(DispatchService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  despacho = signal<DispatchResponse | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.dispatchService.findById(id).subscribe({
        next: (res) => this.despacho.set(res),
        error: () => this.despacho.set(null),
        complete: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  puedeAvanzar(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'despachador' || role === 'admin';
  }

  nextStatus(): DispatchStatus | null {
    const d = this.despacho();
    if (!d) return null;
    return nextDispatchStatus(d.status as DispatchStatus);
  }

  avanzar() {
    const d = this.despacho();
    if (!d) return;
    const next = nextDispatchStatus(d.status as DispatchStatus);
    if (!next) return;
    this.dispatchService.updateStatus(d.id, next).subscribe({
      next: (res) => this.despacho.set(res),
      error: () => alert('Error al avanzar el estado del despacho.')
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'bg-gray-100 text-gray-700 border-gray-300',
      'ELABORACION': 'bg-amber-50 text-amber-700 border-amber-200',
      'PRODUCCION': 'bg-blue-50 text-blue-700 border-blue-200',
      'LISTO_CARGUE': 'bg-teal-50 text-teal-700 border-teal-200',
      'DESPACHADO': 'bg-green-50 text-green-700 border-green-200'
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'PENDIENTE',
      'ELABORACION': 'ELABORACIÓN',
      'PRODUCCION': 'PRODUCCIÓN',
      'LISTO_CARGUE': 'LISTO CARGUE',
      'DESPACHADO': 'DESPACHADO'
    };
    return map[status] || status;
  }
}
