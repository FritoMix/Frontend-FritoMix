import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleType } from '../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <nav class="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <a routerLink="/dashboard" class="hover:text-[#0055FF] transition-colors">Dashboard</a>
            <span>/</span>
            <a routerLink="/vehiculos" class="hover:text-[#0055FF] transition-colors">Vehículos</a>
            <span>/</span>
            <span class="text-[#071938] font-semibold">Nuevo vehículo</span>
          </nav>
          <h1 class="text-2xl font-extrabold text-[#071938]">Nuevo vehículo</h1>
          <p class="text-sm text-gray-500 mt-0.5">Registra la información de un nuevo vehículo</p>
        </div>
        <button
          (click)="router.navigate(['/vehiculos'])"
          class="border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
        >
          <span>←</span>
          Volver
        </button>
      </div>
    </div>

    <!-- Layout 2 columnas -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Columna izquierda: Preview -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-6">
          <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Vista previa</h2>
          <div class="flex flex-col items-center text-center">
            <div class="w-28 h-28 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl mb-4 border border-gray-200">
              🚛
            </div>
            <div class="px-3 py-1.5 rounded-lg bg-gray-900 text-white font-bold font-mono text-lg tracking-wider mb-3">
              {{ form.plate || 'XXX-000' }}
            </div>
            <h3 class="text-lg font-extrabold text-[#071938] mb-1">
              {{ form.brand || 'Marca' }} {{ form.model || 'Modelo' }}
            </h3>
            @if (form.year) {
              <p class="text-xs text-gray-500 mb-3">Modelo {{ form.year }} · {{ form.color || 'Color' }}</p>
            } @else {
              <p class="text-xs text-gray-500 mb-3">{{ form.color || 'Color del vehículo' }}</p>
            }
            @if (form.vehicleType) {
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold mb-3 {{ colorTipo(form.vehicleType) }}">
                {{ form.vehicleType }}
              </span>
            }
            <div class="w-full border-t border-gray-100 my-3"></div>
            <div class="w-full space-y-2 text-left text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Capacidad:</span>
                <span class="text-gray-700 font-semibold">{{ form.capacityKg || 0 }} kg</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Unidades:</span>
                <span class="text-gray-700 font-semibold">{{ form.capacityUnits || 0 }} und</span>
              </div>
              @if (form.code) {
                <div class="flex justify-between">
                  <span class="text-gray-500">Código:</span>
                  <span class="text-gray-700 font-mono text-xs">{{ form.code }}</span>
                </div>
              }
            </div>
            <div class="w-full border-t border-gray-100 my-3"></div>
            @if (form.active) {
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">Activo</span>
            } @else {
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">Inactivo</span>
            }
          </div>
        </div>
      </div>

      <!-- Columna derecha: Formulario -->
      <div class="lg:col-span-2 space-y-5">
        <!-- Identificación -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 class="text-base font-bold text-[#071938] mb-4 flex items-center gap-2">
            <span>🚙</span> Identificación
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Código <span class="text-red-500">*</span></label>
              <input
                type="text"
                name="code"
                [(ngModel)]="form.code"
                required
                placeholder="Ej: VEH-007"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Placa <span class="text-red-500">*</span></label>
              <input
                type="text"
                name="plate"
                [(ngModel)]="form.plate"
                required
                placeholder="Ej: ABC-123"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono uppercase"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Marca</label>
              <input
                type="text"
                name="brand"
                [(ngModel)]="form.brand"
                placeholder="Ej: Hino"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Modelo</label>
              <input
                type="text"
                name="model"
                [(ngModel)]="form.model"
                placeholder="Ej: FD 1J"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Año</label>
              <input
                type="number"
                name="year"
                [(ngModel)]="form.year"
                min="1990"
                max="2030"
                placeholder="Ej: 2024"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Color</label>
              <input
                type="text"
                name="color"
                [(ngModel)]="form.color"
                placeholder="Ej: Blanco"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Número de chasis</label>
              <input
                type="text"
                name="chassisNumber"
                [(ngModel)]="form.chassisNumber"
                placeholder="Ej: JHDFD1JEXKX001234"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-xs"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Número de motor</label>
              <input
                type="text"
                name="engineNumber"
                [(ngModel)]="form.engineNumber"
                placeholder="Ej: J08E-UV12345"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Tipo y capacidad -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 class="text-base font-bold text-[#071938] mb-4 flex items-center gap-2">
            <span>📦</span> Tipo y capacidad
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Tipo de vehículo</label>
              <select
                name="vehicleType"
                [(ngModel)]="form.vehicleType"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="CAMIÓN">CAMIÓN</option>
                <option value="FURGÓN">FURGÓN</option>
                <option value="VAN">VAN</option>
                <option value="CAMIONETA">CAMIONETA</option>
                <option value="MOTO">MOTO</option>
                <option value="VOLQUETA">VOLQUETA</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Capacidad (kg)</label>
              <input
                type="number"
                name="capacityKg"
                [(ngModel)]="form.capacityKg"
                min="0"
                placeholder="Ej: 8000"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Capacidad (unidades)</label>
              <input
                type="number"
                name="capacityUnits"
                [(ngModel)]="form.capacityUnits"
                min="0"
                placeholder="Ej: 60"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Documentos y seguro -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 class="text-base font-bold text-[#071938] mb-4 flex items-center gap-2">
            <span>📋</span> Documentos y seguro
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Vencimiento SOAT</label>
              <input
                type="date"
                name="soatExpiration"
                [(ngModel)]="form.soatExpiration"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Venc. Tecnomecánica</label>
              <input
                type="date"
                name="tecnomecanicaExpiration"
                [(ngModel)]="form.tecnomecanicaExpiration"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Compañía de seguros</label>
              <input
                type="text"
                name="insuranceCompany"
                [(ngModel)]="form.insuranceCompany"
                placeholder="Ej: Seguros Bolívar"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Número de póliza</label>
              <input
                type="text"
                name="policyNumber"
                [(ngModel)]="form.policyNumber"
                placeholder="Ej: POL-BOL-2026-00001"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Combustible y extras -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 class="text-base font-bold text-[#071938] mb-4 flex items-center gap-2">
            <span>⛽</span> Combustible y extras
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Tipo de combustible</label>
              <select
                name="fuelType"
                [(ngModel)]="form.fuelType"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="GASOLINA">GASOLINA</option>
                <option value="DIÉSEL">DIÉSEL</option>
                <option value="GLP">GLP</option>
                <option value="ELÉCTRICO">ELÉCTRICO</option>
                <option value="HÍBRIDO">HÍBRIDO</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Cap. tanque (L)</label>
              <input
                type="number"
                name="fuelTankCapacity"
                [(ngModel)]="form.fuelTankCapacity"
                min="0"
                placeholder="Ej: 150"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Km actuales</label>
              <input
                type="number"
                name="currentKm"
                [(ngModel)]="form.currentKm"
                min="0"
                placeholder="Ej: 45000"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Estado y comentarios -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 class="text-base font-bold text-[#071938] mb-4 flex items-center gap-2">
            <span>💬</span> Estado y comentarios
          </h2>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <div class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  [(ngModel)]="form.active"
                  class="w-5 h-5 rounded border-gray-300 text-[#0055FF] focus:ring-[#0055FF] cursor-pointer"
                />
                <label for="active" class="text-sm font-semibold text-[#071938] cursor-pointer">
                  Vehículo activo / operativo
                </label>
                @if (form.active) {
                  <span class="ml-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">Activo</span>
                } @else {
                  <span class="ml-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">Inactivo</span>
                }
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Observaciones</label>
              <textarea
                name="observations"
                [(ngModel)]="form.observations"
                rows="3"
                placeholder="Notas, detalles de mantenimiento, accesorios..."
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            (click)="router.navigate(['/vehiculos'])"
            class="border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-5 rounded-lg text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            (click)="onSave()"
            class="bg-[#0055FF] hover:bg-[#0044DD] text-white font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
          >
            <span>💾</span>
            Guardar vehículo
          </button>
        </div>
      </div>
    </div>
  `
})
export class VehicleFormComponent {
  vehicleService = inject(VehicleService);
  router = inject(Router);

  form = {
    code: '',
    plate: '',
    brand: '',
    model: '',
    year: 2025,
    color: '',
    chassisNumber: '',
    engineNumber: '',
    vehicleType: 'CAMIÓN' as VehicleType,
    capacityKg: 0,
    capacityUnits: 0,
    soatExpiration: '',
    tecnomecanicaExpiration: '',
    insuranceCompany: '',
    policyNumber: '',
    active: true,
    fuelType: 'DIÉSEL' as 'GASOLINA' | 'DIÉSEL' | 'GLP' | 'ELÉCTRICO' | 'HÍBRIDO',
    fuelTankCapacity: 0,
    currentKm: 0,
    observations: ''
  };

  colorTipo(tipo: string): string {
    const mapa: Record<string, string> = {
      'CAMIÓN': 'bg-purple-100 text-purple-700',
      'FURGÓN': 'bg-blue-100 text-blue-700',
      'VAN': 'bg-cyan-100 text-cyan-700',
      'CAMIONETA': 'bg-amber-100 text-amber-700',
      'MOTO': 'bg-emerald-100 text-emerald-700',
      'VOLQUETA': 'bg-red-100 text-red-700'
    };
    return mapa[tipo] || 'bg-gray-100 text-gray-700';
  }

  onSave() {
    if (!this.form.code || !this.form.plate) return;

    this.vehicleService.addVehicle({
      code: this.form.code,
      plate: this.form.plate.toUpperCase(),
      brand: this.form.brand,
      model: this.form.model,
      year: this.form.year,
      color: this.form.color,
      chassisNumber: this.form.chassisNumber,
      engineNumber: this.form.engineNumber,
      vehicleType: this.form.vehicleType,
      capacityKg: this.form.capacityKg,
      capacityUnits: this.form.capacityUnits,
      soatExpiration: this.form.soatExpiration,
      tecnomecanicaExpiration: this.form.tecnomecanicaExpiration,
      insuranceCompany: this.form.insuranceCompany,
      policyNumber: this.form.policyNumber,
      active: this.form.active
    });

    this.router.navigate(['/vehiculos']);
  }
}
