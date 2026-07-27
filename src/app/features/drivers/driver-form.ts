import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DriverService } from '../../core/services/driver.service';
import { LicenseType } from '../../core/models/driver.model';

@Component({
  selector: 'app-driver-form',
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
            <a routerLink="/conductores" class="hover:text-[#0055FF] transition-colors">Conductores</a>
            <span>/</span>
            <span class="text-[#071938] font-semibold">Nuevo conductor</span>
          </nav>
          <h1 class="text-2xl font-extrabold text-[#071938]">Nuevo conductor</h1>
          <p class="text-sm text-gray-500 mt-0.5">Registra la información de un nuevo conductor</p>
        </div>
        <button
          (click)="router.navigate(['/conductores'])"
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
            <div class="w-24 h-24 rounded-full flex items-center justify-center font-bold text-2xl mb-4 {{ avatarColor() }}">
              {{ avatarInitials() }}
            </div>
            <h3 class="text-lg font-extrabold text-[#071938] mb-1">
              {{ form.fullName || 'Nombre del conductor' }}
            </h3>
            <p class="text-xs text-gray-500 mb-3">{{ form.email || 'correo@fritomix.com' }}</p>
            @if (form.licenseType) {
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold mb-3 {{ colorLicencia(form.licenseType) }}">
                Licencia {{ form.licenseType }}
              </span>
            }
            <div class="w-full border-t border-gray-100 my-3"></div>
            <div class="w-full space-y-2 text-left">
              <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-400">📞</span>
                <span class="text-gray-700">{{ form.phone || 'Teléfono' }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-400">📍</span>
                <span class="text-gray-700">{{ form.city || (form.department ? form.department : 'Ciudad / Departamento') }}</span>
              </div>
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
        <!-- Datos personales -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 class="text-base font-bold text-[#071938] mb-4 flex items-center gap-2">
            <span>👤</span> Datos personales
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Código <span class="text-red-500">*</span></label>
              <input
                type="text"
                name="code"
                [(ngModel)]="form.code"
                required
                placeholder="Ej: CHF-007"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Nombre completo <span class="text-red-500">*</span></label>
              <input
                type="text"
                name="fullName"
                [(ngModel)]="form.fullName"
                required
                placeholder="Ej: Juan Gabriel Restrepo Muñoz"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Tipo documento</label>
              <select
                name="documentType"
                [(ngModel)]="form.documentType"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="Cédula de Ciudadanía">CC - Cédula de Ciudadanía</option>
                <option value="Cédula de Extranjería">CE - Cédula de Extranjería</option>
                <option value="Pasaporte">PA - Pasaporte</option>
                <option value="Tarjeta de Identidad">TI - Tarjeta de Identidad</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Número documento</label>
              <input
                type="text"
                name="documentNumber"
                [(ngModel)]="form.documentNumber"
                placeholder="Ej: 1.234.567.890"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Fecha de nacimiento</label>
              <input
                type="date"
                name="birthDate"
                [(ngModel)]="form.birthDate"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Teléfono</label>
              <input
                type="text"
                name="phone"
                [(ngModel)]="form.phone"
                placeholder="Ej: 310 123 4567"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="form.email"
                placeholder="Ej: conductor@fritomix.com"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Dirección</label>
              <input
                type="text"
                name="address"
                [(ngModel)]="form.address"
                placeholder="Ej: Carrera 10 # 20-30"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Ciudad</label>
              <input
                type="text"
                name="city"
                [(ngModel)]="form.city"
                placeholder="Ej: IBAGUÉ"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Departamento</label>
              <input
                type="text"
                name="department"
                [(ngModel)]="form.department"
                placeholder="Ej: TOLIMA"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Licencia -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 class="text-base font-bold text-[#071938] mb-4 flex items-center gap-2">
            <span>🪪</span> Licencia
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Tipo de licencia</label>
              <select
                name="licenseType"
                [(ngModel)]="form.licenseType"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="A2">A2 - Motocicletas</option>
                <option value="B1">B1 - Particular</option>
                <option value="B2">B2 - Carga liviana</option>
                <option value="C1">C1 - Carga pesada</option>
                <option value="C2">C2 - Carga especial</option>
                <option value="C3">C3 - Vehículos pesados</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Número de licencia</label>
              <input
                type="text"
                name="licenseNumber"
                [(ngModel)]="form.licenseNumber"
                placeholder="Ej: LIC-C3-00001"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Vencimiento licencia</label>
              <input
                type="date"
                name="licenseExpiry"
                [(ngModel)]="form.licenseExpiry"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Fecha de contratación</label>
              <input
                type="date"
                name="hireDate"
                [(ngModel)]="form.hireDate"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Emergencia y extra -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 class="text-base font-bold text-[#071938] mb-4 flex items-center gap-2">
            <span>🚨</span> Emergencia y extra
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Tipo de sangre</label>
              <select
                name="bloodType"
                [(ngModel)]="form.bloodType"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="O">O</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Factor RH</label>
              <select
                name="rhFactor"
                [(ngModel)]="form.rhFactor"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="+">+ Positivo</option>
                <option value="-">- Negativo</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Contacto de emergencia</label>
              <input
                type="text"
                name="emergencyContact"
                [(ngModel)]="form.emergencyContact"
                placeholder="Ej: María López - Esposa"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Teléfono emergencia</label>
              <input
                type="text"
                name="emergencyPhone"
                [(ngModel)]="form.emergencyPhone"
                placeholder="Ej: 311 000 1122"
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div class="md:col-span-2">
              <div class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  [(ngModel)]="form.active"
                  class="w-5 h-5 rounded border-gray-300 text-[#0055FF] focus:ring-[#0055FF] cursor-pointer"
                />
                <label for="active" class="text-sm font-semibold text-[#071938] cursor-pointer">
                  Conductor activo
                </label>
                @if (form.active) {
                  <span class="ml-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">Activo</span>
                } @else {
                  <span class="ml-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">Inactivo</span>
                }
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-[#071938] mb-1.5">Observaciones</label>
              <textarea
                name="observations"
                [(ngModel)]="form.observations"
                rows="3"
                placeholder="Información adicional relevante..."
                class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            (click)="router.navigate(['/conductores'])"
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
            Guardar conductor
          </button>
        </div>
      </div>
    </div>
  `
})
export class DriverFormComponent {
  driverService = inject(DriverService);
  router = inject(Router);

  form = {
    code: '',
    fullName: '',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    department: '',
    licenseType: 'B2' as LicenseType,
    licenseNumber: '',
    licenseExpiry: '',
    hireDate: new Date().toISOString().split('T')[0],
    bloodType: 'O',
    rhFactor: '+',
    emergencyContact: '',
    emergencyPhone: '',
    active: true,
    observations: ''
  };

  avatarInitials = computed(() => {
    if (!this.form.fullName) return '--';
    return this.form.fullName
      .split(' ')
      .filter(p => p.length > 0)
      .slice(0, 2)
      .map(p => p.charAt(0).toUpperCase())
      .join('');
  });

  avatarColor = computed(() => this.colorLicencia(this.form.licenseType));

  colorLicencia(tipo: string): string {
    const mapa: Record<string, string> = {
      A2: 'bg-amber-100 text-amber-700',
      B1: 'bg-sky-100 text-sky-700',
      B2: 'bg-blue-100 text-blue-700',
      B3: 'bg-indigo-100 text-indigo-700',
      C1: 'bg-purple-100 text-purple-700',
      C2: 'bg-emerald-100 text-emerald-700',
      C3: 'bg-rose-100 text-rose-700'
    };
    return mapa[tipo] || 'bg-blue-100 text-blue-700';
  }

  onSave() {
    if (!this.form.code || !this.form.fullName) return;

    const avatarInitials = this.form.fullName
      .split(' ')
      .filter(p => p.length > 0)
      .slice(0, 2)
      .map(p => p.charAt(0).toUpperCase())
      .join('');

    const avatarColor = this.colorLicencia(this.form.licenseType);

    this.driverService.addDriver({
      code: this.form.code,
      fullName: this.form.fullName,
      documentType: this.form.documentType,
      documentNumber: this.form.documentNumber,
      birthDate: this.form.birthDate,
      phone: this.form.phone,
      email: this.form.email,
      address: this.form.address,
      city: this.form.city,
      department: this.form.department,
      licenseType: this.form.licenseType,
      licenseNumber: this.form.licenseNumber,
      hireDate: this.form.hireDate,
      active: this.form.active,
      avatarInitials,
      avatarColor
    });

    this.router.navigate(['/conductores']);
  }
}
