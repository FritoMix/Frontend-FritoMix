import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LotService } from '../../core/services/lot.service';
import { ProductService } from '../../core/services/product.service';
import { LotStatus } from '../../core/models/lot.model';

@Component({
  selector: 'app-lot-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <nav class="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
            <a [routerLink]="['/dashboard']" class="hover:text-[#0055FF] transition-colors">Dashboard</a>
            <span>/</span>
            <a [routerLink]="['/lotes']" class="hover:text-[#0055FF] transition-colors">Lotes</a>
            <span>/</span>
            <span class="text-gray-700 font-medium">Nuevo lote</span>
          </nav>
          <h1 class="text-2xl font-extrabold text-[#071938]">Nuevo lote</h1>
          <p class="text-sm text-gray-500 mt-0.5">Registra un nuevo lote de producto con su trazabilidad y fechas</p>
        </div>
        <button
          [routerLink]="['/lotes']"
          class="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#071938] border border-gray-200 hover:border-gray-300 bg-white px-4 py-2.5 rounded-lg transition-colors"
        >
          <span>←</span>
          Volver
        </button>
      </div>

      <!-- Sección 1: Producto -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <div class="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
          <span class="w-7 h-7 rounded-lg bg-[#0055FF] text-white flex items-center justify-center text-xs font-bold">1</span>
          <h3 class="font-bold text-gray-800">Producto</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-3">
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Seleccionar producto <span class="text-red-500">*</span></label>
            <select
              [(ngModel)]="selectedProductId"
              (ngModelChange)="onProductChange()"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
            >
              <option value="">Seleccionar producto del catálogo</option>
              @for (p of productService.products().filter(pr => pr.active); track p.id) {
                <option [value]="p.id">
                  {{ p.code }} - {{ p.description }} ({{ p.category }})
                </option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Código producto</label>
            <input
              type="text"
              [(ngModel)]="form.productCode"
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 outline-none text-sm font-mono font-bold"
              readonly
            />
          </div>
          <div class="md:col-span-2 lg:col-span-2">
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Descripción producto</label>
            <input
              type="text"
              [(ngModel)]="form.productDescription"
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 outline-none text-sm"
              readonly
            />
          </div>
        </div>
      </div>

      <!-- Sección 2: Datos del lote -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <div class="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
          <span class="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">2</span>
          <h3 class="font-bold text-gray-800">Datos del lote</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Código lote <span class="text-red-500">*</span></label>
            <input
              type="text"
              [(ngModel)]="form.code"
              placeholder="Ej: LOT-109"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono font-bold transition-all"
            />
          </div>
          <div class="md:col-span-2 lg:col-span-2">
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Proveedor <span class="text-red-500">*</span></label>
            <input
              type="text"
              [(ngModel)]="form.supplier"
              placeholder="Nombre o razón social del proveedor"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Fecha recepción <span class="text-red-500">*</span></label>
            <input
              type="date"
              [(ngModel)]="form.receptionDate"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Fecha fabricación <span class="text-red-500">*</span></label>
            <input
              type="date"
              [(ngModel)]="form.manufacturingDate"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Fecha vencimiento <span class="text-red-500">*</span></label>
            <input
              type="date"
              [(ngModel)]="form.expirationDate"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
        </div>
      </div>

      <!-- Sección 3: Cantidades y costo -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <div class="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
          <span class="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center text-xs font-bold">3</span>
          <h3 class="font-bold text-gray-800">Cantidades y costo</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Cantidad recibida <span class="text-red-500">*</span></label>
            <input
              type="number"
              [(ngModel)]="form.quantityReceived"
              (ngModelChange)="onQuantityReceivedChange()"
              placeholder="Ej: 2500"
              min="0"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Cantidad disponible</label>
            <input
              type="number"
              [(ngModel)]="form.quantityAvailable"
              placeholder="Inicialmente igual a recibida"
              min="0"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
            <p class="text-[11px] text-gray-400 mt-1">Se ajusta automáticamente al recibir</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Costo unitario ($) <span class="text-red-500">*</span></label>
            <input
              type="number"
              [(ngModel)]="form.unitCost"
              placeholder="Ej: 9800"
              min="0"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Ubicación bodega <span class="text-red-500">*</span></label>
            <input
              type="text"
              [(ngModel)]="form.location"
              placeholder="Ej: A-01-05 (Pasillo-Rack-Nivel)"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono transition-all"
            />
          </div>
          <div class="md:col-span-2 lg:col-span-2 flex items-end">
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-3.5 w-full">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-[11px] text-gray-500 mb-0.5">Valor total lote</p>
                  <p class="text-xl font-extrabold text-[#071938]">
                    {{ valorTotal | currency:'$':'symbol':'1.0-0' }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] text-gray-500 mb-0.5">Días de vida útil</p>
                  <p class="text-xl font-extrabold" [class]="diasVidaUtilClass">
                    {{ diasVidaUtil !== null ? (diasVidaUtil >= 0 ? diasVidaUtil + ' días' : 'Vencido') : '-' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección 4: Estado y observaciones -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <div class="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
          <span class="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold">4</span>
          <h3 class="font-bold text-gray-800">Estado y observaciones</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Estado lote <span class="text-red-500">*</span></label>
            <select
              [(ngModel)]="form.status"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
            >
              <option value="ACTIVO">ACTIVO - Disponible para venta</option>
              <option value="RESERVADO">RESERVADO - Pedidos separados</option>
              <option value="AGOTADO">AGOTADO - Sin existencias</option>
              <option value="VENCIDO">VENCIDO - No disponible</option>
            </select>
          </div>
          <div></div>
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Observaciones</label>
            <textarea
              [(ngModel)]="form.observations"
              placeholder="Comentarios adicionales: control de calidad, temperatura, recepción parcial, etc."
              rows="3"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        <button
          type="button"
          (click)="cancelar()"
          class="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          (click)="guardar()"
          [disabled]="!esValido()"
          class="bg-[#0055FF] hover:bg-[#0044DD] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
        >
          <span>💾</span>
          Guardar lote
        </button>
      </div>
    </div>
  `
})
export class LotFormComponent {
  lotService = inject(LotService);
  productService = inject(ProductService);
  router = inject(Router);

  selectedProductId = '';

  form = {
    code: '',
    productCode: '',
    productDescription: '',
    supplier: '',
    receptionDate: '',
    manufacturingDate: '',
    expirationDate: '',
    quantityReceived: 0,
    quantityAvailable: 0,
    unitCost: 0,
    location: '',
    status: 'ACTIVO' as LotStatus,
    observations: ''
  };

  constructor() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.form.receptionDate = `${yyyy}-${mm}-${dd}`;
    this.generarCodigoLote();
  }

  get valorTotal(): number {
    return (this.form.quantityAvailable || 0) * (this.form.unitCost || 0);
  }

  get diasVidaUtil(): number | null {
    if (!this.form.expirationDate) return null;
    const venc = new Date(this.form.expirationDate + 'T23:59:59');
    if (isNaN(venc.getTime())) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const msPorDia = 1000 * 60 * 60 * 24;
    return Math.ceil((venc.getTime() - hoy.getTime()) / msPorDia);
  }

  get diasVidaUtilClass(): string {
    const d = this.diasVidaUtil;
    if (d === null) return 'text-gray-500';
    if (d < 0) return 'text-red-600';
    if (d < 30) return 'text-amber-600';
    return 'text-emerald-600';
  }

  generarCodigoLote() {
    const n = this.lotService.lots().length + 101;
    this.form.code = 'LOT-' + n;
  }

  onProductChange() {
    const p = this.productService.products().find(pr => pr.id === this.selectedProductId);
    if (p) {
      this.form.productCode = p.code;
      this.form.productDescription = p.description;
      if (p.cost && p.cost > 0 && !this.form.unitCost) {
        this.form.unitCost = p.cost;
      }
    } else {
      this.form.productCode = '';
      this.form.productDescription = '';
    }
  }

  onQuantityReceivedChange() {
    if (this.form.quantityReceived > 0 && (this.form.quantityAvailable === 0 || this.form.quantityAvailable === this.form.quantityReceived - 1 || this.form.quantityAvailable === this.form.quantityReceived)) {
      this.form.quantityAvailable = this.form.quantityReceived;
    }
  }

  esValido(): boolean {
    return (
      this.form.code.trim().length > 0 &&
      this.form.productCode.trim().length > 0 &&
      this.form.productDescription.trim().length > 0 &&
      this.form.supplier.trim().length > 0 &&
      this.form.receptionDate.trim().length > 0 &&
      this.form.manufacturingDate.trim().length > 0 &&
      this.form.expirationDate.trim().length > 0 &&
      this.form.quantityReceived > 0 &&
      this.form.quantityAvailable >= 0 &&
      this.form.unitCost > 0 &&
      this.form.location.trim().length > 0
    );
  }

  cancelar() {
    this.router.navigate(['/lotes']);
  }

  guardar() {
    if (!this.esValido()) return;

    this.lotService.addLot({
      code: this.form.code.trim(),
      productCode: this.form.productCode.trim(),
      productDescription: this.form.productDescription.trim(),
      supplier: this.form.supplier.trim(),
      receptionDate: this.form.receptionDate,
      manufacturingDate: this.form.manufacturingDate,
      expirationDate: this.form.expirationDate,
      quantityReceived: this.form.quantityReceived,
      quantityAvailable: this.form.quantityAvailable,
      unitCost: this.form.unitCost,
      location: this.form.location.trim(),
      status: this.form.status,
      observations: this.form.observations.trim() || undefined
    });

    this.router.navigate(['/lotes']);
  }
}
