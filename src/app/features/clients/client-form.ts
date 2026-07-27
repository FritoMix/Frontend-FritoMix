import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <nav class="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <a routerLink="/dashboard" class="hover:text-[#0055FF] transition-colors">Inicio</a>
            <span>/</span>
            <a routerLink="/clientes" class="hover:text-[#0055FF] transition-colors">Clientes</a>
            <span>/</span>
            <span class="text-[#071938] font-semibold">Nuevo cliente</span>
          </nav>
          <h1 class="text-2xl font-extrabold text-[#071938]">Nuevo cliente</h1>
          <p class="text-sm text-gray-500 mt-0.5">Registra la información de un nuevo cliente</p>
        </div>
        <button
          (click)="router.navigate(['/clientes'])"
          class="border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <span>←</span>
          Volver
        </button>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <form (ngSubmit)="onSave()" #clientForm="ngForm" class="space-y-6">
        <!-- Form Fields Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Código -->
          <div>
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Código <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              [(ngModel)]="form.code"
              required
              #codeField="ngModel"
              placeholder="Ej: C-100"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              [class.border-red-400]="codeField.invalid && codeField.touched"
            />
            @if (codeField.invalid && codeField.touched) {
              <p class="mt-1 text-xs text-red-500">El código es requerido</p>
            }
          </div>

          <!-- NIT/CC -->
          <div>
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              NIT/CC <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="taxId"
              [(ngModel)]="form.taxId"
              required
              #taxIdField="ngModel"
              placeholder="Ej: 1.234.567.890-0"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              [class.border-red-400]="taxIdField.invalid && taxIdField.touched"
            />
            @if (taxIdField.invalid && taxIdField.touched) {
              <p class="mt-1 text-xs text-red-500">El NIT/CC es requerido</p>
            }
          </div>

          <!-- Nombre -->
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Nombre completo / Razón social <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              [(ngModel)]="form.name"
              required
              #nameField="ngModel"
              placeholder="Ej: SUPERMERCADO LA 14"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              [class.border-red-400]="nameField.invalid && nameField.touched"
            />
            @if (nameField.invalid && nameField.touched) {
              <p class="mt-1 text-xs text-red-500">El nombre es requerido</p>
            }
          </div>

          <!-- Departamento -->
          <div>
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Departamento <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="department"
              [(ngModel)]="form.department"
              required
              #departmentField="ngModel"
              placeholder="Ej: TOLIMA"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              [class.border-red-400]="departmentField.invalid && departmentField.touched"
            />
            @if (departmentField.invalid && departmentField.touched) {
              <p class="mt-1 text-xs text-red-500">El departamento es requerido</p>
            }
          </div>

          <!-- Ciudad -->
          <div>
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Ciudad <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              [(ngModel)]="form.city"
              required
              #cityField="ngModel"
              placeholder="Ej: IBAGUÉ"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              [class.border-red-400]="cityField.invalid && cityField.touched"
            />
            @if (cityField.invalid && cityField.touched) {
              <p class="mt-1 text-xs text-red-500">La ciudad es requerida</p>
            }
          </div>

          <!-- Dirección -->
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Dirección <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              [(ngModel)]="form.address"
              required
              #addressField="ngModel"
              placeholder="Ej: CRA 5 # 21 - 45 B/ CENTRO"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              [class.border-red-400]="addressField.invalid && addressField.touched"
            />
            @if (addressField.invalid && addressField.touched) {
              <p class="mt-1 text-xs text-red-500">La dirección es requerida</p>
            }
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Teléfono <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone"
              [(ngModel)]="form.phone"
              required
              #phoneField="ngModel"
              placeholder="Ej: 300 123 4567"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              [class.border-red-400]="phoneField.invalid && phoneField.touched"
            />
            @if (phoneField.invalid && phoneField.touched) {
              <p class="mt-1 text-xs text-red-500">El teléfono es requerido</p>
            }
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              [(ngModel)]="form.email"
              required
              email
              #emailField="ngModel"
              placeholder="Ej: cliente@correo.com"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              [class.border-red-400]="emailField.invalid && emailField.touched"
            />
            @if (emailField.invalid && emailField.touched) {
              <p class="mt-1 text-xs text-red-500">
                {{ emailField.errors?.['email'] ? 'Ingresa un email válido' : 'El email es requerido' }}
              </p>
            }
          </div>

          <!-- Numeral -->
          <div>
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Numeral
            </label>
            <input
              type="text"
              name="numeral"
              [(ngModel)]="form.numeral"
              placeholder="Ej: C-100 (opcional)"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <!-- Activo -->
          <div class="flex items-end">
            <div class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 w-full">
              <input
                type="checkbox"
                id="active"
                name="active"
                [(ngModel)]="form.active"
                class="w-5 h-5 rounded border-gray-300 text-[#0055FF] focus:ring-[#0055FF] cursor-pointer"
              />
              <label for="active" class="text-sm font-medium text-[#071938] cursor-pointer select-none">
                Cliente activo
              </label>
              @if (form.active) {
                <span class="ml-auto inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Habilitado
                </span>
              } @else {
                <span class="ml-auto inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Deshabilitado
                </span>
              }
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-100 pt-5"></div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            (click)="router.navigate(['/clientes'])"
            class="border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-5 rounded-lg text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            [disabled]="clientForm.invalid || isSubmitting"
            class="bg-[#0055FF] hover:bg-[#0044DD] disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            @if (isSubmitting) {
              <span class="animate-spin">⏳</span>
              Guardando...
            } @else {
              <span>💾</span>
              Guardar cliente
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class ClientFormComponent {
  clientService = inject(ClientService);
  router = inject(Router);

  isSubmitting = false;

  form = {
    code: '',
    name: '',
    taxId: '',
    department: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    active: true,
    numeral: ''
  };

  onSave() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    const avatarInitials = this.form.name.substring(0, 2).toUpperCase();

    const newClient = {
      code: this.form.code,
      name: this.form.name,
      taxId: this.form.taxId,
      department: this.form.department,
      city: this.form.city,
      address: this.form.address,
      phone: this.form.phone,
      email: this.form.email,
      active: this.form.active,
      ...(this.form.numeral ? { numeral: this.form.numeral } : {})
    };

    this.clientService.addClient(newClient);

    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/clientes']);
    }, 400);
  }
}
