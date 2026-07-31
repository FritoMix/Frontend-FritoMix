import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--blue">12.</span>
        <h1 class="text-2xl font-extrabold text-[#071938]">Configuración</h1>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <aside class="lg:w-1/4">
        <div class="fm-card p-2">
          <nav class="flex flex-col gap-1">
            @for (tab of tabs; track tab.id) {
              <button
                (click)="activeTab.set(tab.id)"
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-all text-sm"
                [class]="activeTab() === tab.id ? 'bg-[#0055FF] text-white font-bold' : 'text-gray-600 hover:bg-gray-50 font-semibold'"
              >
                {{ tab.label }}
              </button>
            }
          </nav>
        </div>
      </aside>

      <main class="lg:w-3/4">
        @if (loading()) {
          <div class="fm-card p-6 flex items-center justify-center py-16">
            <span class="text-gray-500 text-sm">Cargando configuración...</span>
          </div>
        } @else {
          <div class="fm-card p-6">
            @if (activeTab() === 'general') {
              <h3 class="font-bold text-[#071938] text-base mb-5">Parámetros Generales</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Nombre Empresa</label>
                  <input type="text" [(ngModel)]="companyName" class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-[#071938]" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">NIT</label>
                  <input type="text" [(ngModel)]="nit" class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Email Administrador</label>
                  <input type="email" [(ngModel)]="adminEmail" class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Teléfono</label>
                  <input type="text" [(ngModel)]="phone" class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            }

            @if (activeTab() === 'empresa') {
              <h3 class="font-bold text-[#071938] text-base mb-5">Datos de la Empresa</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Dirección</label>
                  <input type="text" [(ngModel)]="address" class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Ciudad</label>
                  <input type="text" [(ngModel)]="city" class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Departamento</label>
                  <input type="text" [(ngModel)]="department" class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Actividad Económica</label>
                  <input type="text" [(ngModel)]="economicActivity" class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            }

            @if (activeTab() === 'seguridad') {
              <h3 class="font-bold text-[#071938] text-base mb-5">Políticas de Seguridad</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Longitud mínima de contraseña</label>
                  <input type="number" [(ngModel)]="passwordMinLength" min="4" max="32" class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Exigir caracteres especiales</label>
                  <div class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <input
                      type="checkbox"
                      [(ngModel)]="passwordRequireSpecial"
                      class="w-5 h-5 rounded border-gray-300 text-[#0055FF] focus:ring-[#0055FF] cursor-pointer"
                    />
                    <span class="text-sm text-gray-700">Requerir al menos un carácter especial (!@#$%)</span>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Expiración de contraseña (días)</label>
                  <input type="number" [(ngModel)]="passwordExpirationDays" min="0" max="365" class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  <p class="text-xs text-gray-400 mt-1">0 = nunca expira</p>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Timeout de sesión (minutos)</label>
                  <input type="number" [(ngModel)]="sessionTimeoutMinutes" min="5" max="480" class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Intentos máximos de inicio de sesión</label>
                  <input type="number" [(ngModel)]="maxLoginAttempts" min="1" max="20" class="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            }

            <div class="pt-6 flex justify-end border-t border-gray-100 mt-6">
              <button
                (click)="onSave()"
                [disabled]="saving()"
                class="bg-[#0055FF] hover:bg-[#0044DD] disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
              >
                @if (saving()) {
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Guardando...
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Guardar Configuración
                }
              </button>
            </div>
          </div>
        }
      </main>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  router = inject(Router);

  activeTab = signal('general');
  loading = signal(true);
  saving = signal(false);

  companyName = '';
  nit = '';
  adminEmail = '';
  address = '';
  phone = '';
  city = '';
  department = '';
  economicActivity = '';
  passwordMinLength = 8;
  passwordRequireSpecial = true;
  passwordExpirationDays = 90;
  sessionTimeoutMinutes = 60;
  maxLoginAttempts = 5;

  tabs = [
    { id: 'general', label: 'General' },
    { id: 'empresa', label: 'Empresa' },
    { id: 'seguridad', label: 'Seguridad' }
  ];

  ngOnInit() {
    this.loadSettings();
  }

  private loadSettings() {
    this.loading.set(true);
    this.settingsService.get().subscribe({
      next: (res) => {
        this.companyName = res.companyName;
        this.nit = res.nit || '';
        this.adminEmail = res.adminEmail || '';
        this.address = res.address || '';
        this.phone = res.phone || '';
        this.city = res.city || '';
        this.department = res.department || '';
        this.economicActivity = res.economicActivity || '';
        this.passwordMinLength = res.passwordMinLength;
        this.passwordRequireSpecial = res.passwordRequireSpecial;
        this.passwordExpirationDays = res.passwordExpirationDays;
        this.sessionTimeoutMinutes = res.sessionTimeoutMinutes;
        this.maxLoginAttempts = res.maxLoginAttempts;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSave() {
    if (this.saving()) return;
    this.saving.set(true);

    this.settingsService.update({
      companyName: this.companyName,
      nit: this.nit || undefined,
      adminEmail: this.adminEmail || undefined,
      address: this.address || undefined,
      phone: this.phone || undefined,
      city: this.city || undefined,
      department: this.department || undefined,
      economicActivity: this.economicActivity || undefined,
      passwordMinLength: this.passwordMinLength,
      passwordRequireSpecial: this.passwordRequireSpecial,
      passwordExpirationDays: this.passwordExpirationDays,
      sessionTimeoutMinutes: this.sessionTimeoutMinutes,
      maxLoginAttempts: this.maxLoginAttempts,
    }).subscribe({
      next: () => {
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
