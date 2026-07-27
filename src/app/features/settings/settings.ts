import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--blue">12.</span>
        <h1 class="text-2xl font-extrabold text-[#071938]">Configuración</h1>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left Tab Navigation -->
      <aside class="lg:w-1/4">
        <div class="fm-card p-2">
          <nav class="flex flex-col gap-1">
            @for (tab of tabs; track tab.id) {
              <button
                (click)="activeTab = tab.id"
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-all text-sm"
                [class]="activeTab === tab.id ? 'bg-[#0055FF] text-white font-bold' : 'text-gray-600 hover:bg-gray-50 font-semibold'"
              >
                <span>{{ tab.label }}</span>
              </button>
            }
          </nav>
        </div>
      </aside>

      <!-- Right Content Panel -->
      <main class="lg:w-3/4">
        <div class="fm-card p-6">
          <h3 class="font-bold text-[#071938] text-base mb-5">Parámetros del Sistema</h3>
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
            <div class="pt-4 flex justify-end">
              <button class="bg-[#0055FF] hover:bg-[#0044DD] text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm">
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class SettingsComponent {
  authService = inject(AuthService);
  router = inject(Router);

  activeTab = 'general';
  companyName = 'FritoMix S.A.S';
  nit = '900.123.456-7';
  adminEmail = 'admin@fritomix.com';

  tabs = [
    { id: 'general', label: 'General' },
    { id: 'empresa', label: 'Empresa' },
    { id: 'seguridad', label: 'Seguridad' }
  ];
}
