import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { Department, City } from '../../core/models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <nav class="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <a routerLink="/dashboard" class="hover:text-[#0055FF] transition-colors">Inicio</a>
            <span>/</span>
            <a routerLink="/clientes" class="hover:text-[#0055FF] transition-colors">Clientes</a>
            <span>/</span>
            <span class="text-[#071938] font-semibold">{{ isEdit ? 'Editar cliente' : 'Nuevo cliente' }}</span>
          </nav>
          <h1 class="text-2xl font-extrabold text-[#071938]">{{ isEdit ? 'Editar cliente' : 'Nuevo cliente' }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ isEdit ? 'Actualiza los datos del cliente' : 'Registra la información de un nuevo cliente' }}</p>
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

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <form (ngSubmit)="onSave()" #clientForm="ngForm" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- NIT/CC -->
          <div>
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              NIT/CC <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="document"
              [(ngModel)]="form.document"
              required
              #documentField="ngModel"
              placeholder="Ej: 1.234.567.890-0"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              [class.border-red-400]="documentField.invalid && documentField.touched"
            />
            @if (documentField.invalid && documentField.touched) {
              <p class="mt-1 text-xs text-red-500">El NIT/CC es requerido</p>
            }
          </div>

          <!-- Contacto -->
          <div>
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Nombre de contacto
            </label>
            <input
              type="text"
              name="contactName"
              [(ngModel)]="form.contactName"
              placeholder="Ej: Sandra Saenz"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <!-- Nombre / Razón social -->
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Nombre completo / Razón social <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessName"
              [(ngModel)]="form.businessName"
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
            <select
              name="departmentId"
              [(ngModel)]="selectedDepartmentId"
              (ngModelChange)="onDepartmentChange()"
              required
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="">Seleccionar departamento</option>
              @for (dept of departments(); track dept.id) {
                <option [value]="dept.id">{{ dept.name }}</option>
              }
            </select>
          </div>

          <!-- Ciudad -->
          <div>
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Ciudad <span class="text-red-500">*</span>
            </label>
            <select
              name="cityId"
              [(ngModel)]="form.cityId"
              required
              #cityField="ngModel"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              [class.border-red-400]="cityField.invalid && cityField.touched"
            >
              <option value="">Seleccionar ciudad</option>
              @for (city of cities(); track city.id) {
                <option [value]="city.id">{{ city.name }}</option>
              }
            </select>
            @if (cityField.invalid && cityField.touched) {
              <p class="mt-1 text-xs text-red-500">La ciudad es requerida</p>
            }
          </div>

          <!-- Dirección -->
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              [(ngModel)]="form.address"
              placeholder="Ej: CRA 5 # 21 - 45 B/ CENTRO"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Teléfono
            </label>
            <input
              type="text"
              name="phone"
              [(ngModel)]="form.phone"
              placeholder="Ej: 300 123 4567"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-[#071938] mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              [(ngModel)]="form.email"
              email
              #emailField="ngModel"
              placeholder="Ej: cliente@correo.com"
              class="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              [class.border-red-400]="emailField.invalid && emailField.touched"
            />
            @if (emailField.invalid && emailField.touched) {
              <p class="mt-1 text-xs text-red-500">
                {{ emailField.errors?.['email'] ? 'Ingresa un email válido' : '' }}
              </p>
            }
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

        <div class="border-t border-gray-100 pt-5"></div>

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
              {{ isEdit ? 'Actualizar cliente' : 'Guardar cliente' }}
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class ClientFormComponent implements OnInit {
  clientService = inject(ClientService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isSubmitting = false;
  isEdit = false;
  editId: number | null = null;

  departments = signal<Department[]>([]);
  cities = signal<City[]>([]);
  selectedDepartmentId = signal<string>('');

  form = {
    document: '',
    businessName: '',
    contactName: '',
    address: '',
    phone: '',
    email: '',
    cityId: null as number | null,
    active: true,
  };

  ngOnInit() {
    this.clientService.getDepartments().subscribe({
      next: (res) => this.departments.set(res),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      this.clientService.findById(this.editId).subscribe({
        next: (res) => {
          this.form.document = res.document;
          this.form.businessName = res.businessName;
          this.form.contactName = res.contactName || '';
          this.form.address = res.address || '';
          this.form.phone = res.phone || '';
          this.form.email = res.email || '';
          this.form.active = res.active;
          this.form.cityId = res.cityId;
          this.selectedDepartmentId.set(String(res.departmentId));
          this.loadCities(res.departmentId);
        },
      });
    }
  }

  onDepartmentChange() {
    const deptId = this.selectedDepartmentId();
    if (deptId) {
      this.form.cityId = null;
      this.loadCities(Number(deptId));
    } else {
      this.cities.set([]);
      this.form.cityId = null;
    }
  }

  private loadCities(departmentId: number) {
    this.clientService.getCitiesByDepartment(departmentId).subscribe({
      next: (res) => this.cities.set(res),
    });
  }

  onSave() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const data = {
      document: this.form.document,
      businessName: this.form.businessName,
      contactName: this.form.contactName || undefined,
      address: this.form.address || undefined,
      phone: this.form.phone || undefined,
      email: this.form.email || undefined,
      cityId: this.form.cityId!,
      active: this.form.active,
    };

    const request$ = this.isEdit
      ? this.clientService.update(this.editId!, data)
      : this.clientService.create(data);

    request$.subscribe({
      next: () => {
        this.clientService.loadClients();
        this.isSubmitting = false;
        this.router.navigate(['/clientes']);
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }
}
