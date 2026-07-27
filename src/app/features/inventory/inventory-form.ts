import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { ProductService } from '../../core/services/product.service';
import { LotService } from '../../core/services/lot.service';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <a class="hover:text-blue-600 cursor-pointer" (click)="router.navigate(['/inventario'])">Inventario</a>
          <span>/</span>
          <span class="text-gray-700 font-semibold">Nuevo movimiento</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-extrabold text-[#071938]">Nuevo movimiento de inventario</h1>
            <p class="text-sm text-gray-500 mt-0.5">Registra una entrada o salida de productos</p>
          </div>
          <button
            (click)="router.navigate(['/inventario'])"
            class="border border-gray-300 hover:border-gray-400 bg-white text-gray-700 font-bold py-2.5 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
          >
            <span class="text-base leading-none">←</span>
            Volver
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm">📋</div>
            <h3 class="font-bold text-gray-800">Encabezado</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Nro Movimiento</label>
              <input
                type="text"
                [value]="movementNumber()"
                disabled
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm font-mono"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Fecha</label>
              <input
                type="date"
                [(ngModel)]="movementDate"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Hora</label>
              <input
                type="time"
                [(ngModel)]="movementTime"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Tipo de movimiento *</label>
              <select
                [(ngModel)]="movementType"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="">Seleccione...</option>
                <option value="ENTRADA">ENTRADA</option>
                <option value="SALIDA">SALIDA</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Bodega</label>
              <select
                [(ngModel)]="warehouse"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="">Seleccione bodega...</option>
                <option value="Bodega Principal">Bodega Principal</option>
                <option value="Bodega Secundaria">Bodega Secundaria</option>
                <option value="Bodega Devoluciones">Bodega Devoluciones</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-sm">🔗</div>
            <h3 class="font-bold text-gray-800">Referencia</h3>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Tipo de referencia</label>
              <select
                [(ngModel)]="referenceType"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="">Seleccione...</option>
                <option value="Recepción Compra">Recepción Compra</option>
                <option value="Despacho Venta">Despacho Venta</option>
                <option value="Ajuste Inventario">Ajuste Inventario</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Devolución">Devolución</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Documento de referencia</label>
              <input
                type="text"
                [(ngModel)]="referenceDocument"
                placeholder="Ej: OC-2026-0100, PED-00015..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-sm">📦</div>
          <h3 class="font-bold text-gray-800">Producto</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div class="lg:col-span-2">
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Producto *</label>
            <select
              [(ngModel)]="selectedProductId"
              (ngModelChange)="onProductChange()"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Seleccione producto...</option>
              @for (p of activeProducts(); track p.id) {
                <option [value]="p.id">{{ p.code }} - {{ p.description }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Código</label>
            <input
              type="text"
              [ngModel]="selectedProductCode"
              disabled
              class="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm font-mono"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Descripción</label>
            <input
              type="text"
              [ngModel]="selectedProductDescription"
              disabled
              class="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
            />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="lg:col-span-2">
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Lote</label>
            <select
              [(ngModel)]="selectedLotId"
              (ngModelChange)="onLotChange()"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Seleccione lote...</option>
              @for (l of filteredLots(); track l.id) {
                <option [value]="l.id">{{ l.code }} - Vence: {{ l.expirationDate }} ({{ l.quantityAvailable }} disp.)</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Disponible lote</label>
            <input
              type="text"
              [ngModel]="quantityAvailable | number"
              disabled
              class="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Valor unitario ($) *</label>
            <input
              type="number"
              [(ngModel)]="unitValue"
              (ngModelChange)="calculateTotal()"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Cantidad *</label>
            <input
              type="number"
              [(ngModel)]="quantity"
              (ngModelChange)="calculateTotal()"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
        </div>
        <div class="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between">
          <span class="text-sm font-semibold text-blue-800">Valor total del movimiento</span>
          <span class="text-2xl font-extrabold text-blue-900">{{ totalValue | currency:'$':'symbol':'1.0-0' }}</span>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-sm">👤</div>
          <h3 class="font-bold text-gray-800">Responsable y observaciones</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Responsable</label>
            <select
              [(ngModel)]="responsible"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Seleccione responsable...</option>
              <option value="Andrés Producción">Andrés Producción</option>
              <option value="Diana Despacho">Diana Despacho</option>
              <option value="Sofía Pedidos">Sofía Pedidos</option>
              <option value="Luis Coordinador">Luis Coordinador</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Estado</label>
            <div class="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">✅ Creado</span>
              <span class="text-xs text-gray-500">El movimiento se registrará como activo</span>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Observaciones</label>
          <textarea
            [(ngModel)]="observations"
            rows="3"
            placeholder="Observaciones adicionales sobre el movimiento..."
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
          ></textarea>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:justify-end gap-3">
        <button
          (click)="router.navigate(['/inventario'])"
          class="border border-gray-300 hover:border-gray-400 bg-white text-gray-700 font-bold py-3 px-6 rounded-lg text-sm transition-colors"
        >
          Cancelar
        </button>
        <button
          (click)="saveMovement()"
          [disabled]="!isValid()"
          class="bg-[#0055FF] hover:bg-[#0044DD] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors inline-flex items-center gap-2 justify-center"
        >
          <span>💾</span>
          Guardar movimiento
        </button>
      </div>
    </div>
  `
})
export class InventoryMovementFormComponent {
  inventoryService = inject(InventoryService);
  productService = inject(ProductService);
  lotService = inject(LotService);
  router = inject(Router);

  movementType = '';
  warehouse = '';
  referenceType = '';
  referenceDocument = '';
  selectedProductId = '';
  selectedProductCode = '';
  selectedProductDescription = '';
  selectedLotId = '';
  selectedLotCode = '';
  quantityAvailable = 0;
  unitValue: number | null = null;
  quantity: number | null = null;
  totalValue = 0;
  responsible = '';
  observations = '';

  today = new Date();
  movementDate = this.today.toISOString().split('T')[0];
  movementTime = String(this.today.getHours()).padStart(2, '0') + ':' + String(this.today.getMinutes()).padStart(2, '0');

  movementNumber = computed(() => {
    const count = this.inventoryService.movements().length + 1;
    const prefix = this.movementType === 'ENTRADA' ? 'EN' : this.movementType === 'SALIDA' ? 'SA' : 'XX';
    return `MOV-${prefix}-${String(count).padStart(4, '0')}`;
  });

  activeProducts = computed(() => this.productService.products().filter(p => p.active));

  filteredLots = computed(() => {
    if (!this.selectedProductCode) return this.lotService.lots().filter(l => l.status === 'ACTIVO');
    return this.lotService.lots().filter(l => l.productCode === this.selectedProductCode && l.status === 'ACTIVO');
  });

  onProductChange() {
    const product = this.productService.products().find(p => p.id === this.selectedProductId);
    if (product) {
      this.selectedProductCode = product.code;
      this.selectedProductDescription = product.description;
      this.unitValue = product.price;
      this.calculateTotal();
    } else {
      this.selectedProductCode = '';
      this.selectedProductDescription = '';
      this.unitValue = null;
    }
    this.selectedLotId = '';
    this.selectedLotCode = '';
    this.quantityAvailable = 0;
  }

  onLotChange() {
    const lot = this.lotService.lots().find(l => l.id === this.selectedLotId);
    if (lot) {
      this.selectedLotCode = lot.code;
      this.quantityAvailable = lot.quantityAvailable;
    } else {
      this.selectedLotCode = '';
      this.quantityAvailable = 0;
    }
  }

  calculateTotal() {
    const uv = this.unitValue ?? 0;
    const q = this.quantity ?? 0;
    this.totalValue = uv * q;
  }

  isValid(): boolean {
    return !!(this.movementType && this.selectedProductId && this.quantity && this.quantity > 0);
  }

  saveMovement() {
    if (!this.isValid()) return;

    const prefix = this.movementType === 'ENTRADA' ? 'EN' : 'SA';
    const count = this.inventoryService.movements().length + 1;
    const newMovement = {
      movementNumber: `MOV-${prefix}-${String(count).padStart(4, '0')}`,
      movementDate: this.movementDate,
      movementTime: this.movementTime,
      movementType: this.movementType as 'ENTRADA' | 'SALIDA',
      referenceDocument: this.referenceDocument || 'SIN REF',
      referenceType: this.referenceType || 'Sin referencia',
      productCode: this.selectedProductCode,
      productDescription: this.selectedProductDescription,
      quantity: this.quantity!,
      unitValue: this.unitValue ?? 0,
      totalValue: this.totalValue,
      lotCode: this.selectedLotCode || undefined,
      warehouse: this.warehouse || 'Bodega Principal',
      responsible: this.responsible || 'Usuario Sistema',
      observations: this.observations || undefined
    };

    this.inventoryService.addMovement(newMovement);
    this.router.navigate(['/inventario']);
  }
}
