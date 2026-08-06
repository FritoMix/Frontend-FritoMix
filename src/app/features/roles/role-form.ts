import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoleService } from '../../core/services/role.service';

interface PermissionGroup {
  module: string;
  label: string;
  permissions: string[];
  selected: Record<string, boolean>;
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="mb-6 flex items-start justify-between">
        <div>
          <nav class="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
            <a
              (click)="router.navigate(['/roles'])"
              class="hover:text-[#0055FF] cursor-pointer transition-colors"
            >Roles</a>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            <span class="text-gray-700 font-medium">{{ isEdit ? 'Editar' : 'Nuevo' }} rol</span>
          </nav>
          <h1 class="text-2xl font-extrabold text-[#071938]">{{ isEdit ? 'Editar rol' : 'Nuevo rol' }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ isEdit ? 'Modifica la información y permisos del rol' : 'Crea un nuevo rol y asígnale permisos' }}</p>
        </div>
        <button
          (click)="router.navigate(['/roles'])"
          class="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Volver
        </button>
      </div>

      @if (loadingPermissions()) {
        <div class="flex items-center justify-center py-16">
          <svg class="animate-spin h-8 w-8 text-[#0055FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        </div>
      } @else {
        <div class="max-w-3xl">
          <!-- Info card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div class="flex items-center gap-2.5 mb-5">
              <div class="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">Información del rol</h3>
                <p class="text-xs text-gray-500">Nombre y descripción</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nombre del rol <span class="text-red-500">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="name"
                  placeholder="Ej: ADMIN, CARTERA..."
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:outline-none transition-all font-mono uppercase"
                  style="text-transform: uppercase;"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Descripción <span class="text-gray-400 text-xs font-normal">(opcional)</span></label>
                <input
                  type="text"
                  [(ngModel)]="description"
                  placeholder="Ej: Rol con todos los permisos"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Permissions card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div class="flex items-center justify-between mb-5">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">Permisos</h3>
                  <p class="text-xs text-gray-500">Selecciona los permisos para este rol</p>
                </div>
              </div>
              <button
                type="button"
                (click)="toggleSelectAll()"
                class="text-xs font-semibold text-[#0055FF] hover:text-[#0044DD] transition-colors"
              >
                {{ allSelected() ? 'Deseleccionar todos' : 'Seleccionar todos' }}
              </button>
            </div>

            <div class="space-y-4">
              @for (group of permissionGroups(); track group.module) {
                <div>
                  <div class="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-100">
                    <h4 class="text-sm font-bold text-gray-700">{{ group.label }}</h4>
                    <button
                      type="button"
                      (click)="toggleGroup(group)"
                      class="text-[11px] font-semibold text-gray-400 hover:text-[#0055FF] transition-colors"
                    >
                      {{ groupSelected(group) ? 'Quitar todos' : 'Seleccionar todos' }}
                    </button>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    @for (perm of group.permissions; track perm) {
                      <label class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors select-none">
                        <input
                          type="checkbox"
                          [checked]="group.selected[perm]"
                          (change)="togglePermission(group, perm)"
                          class="w-4 h-4 rounded border-gray-300 text-[#0055FF] focus:ring-[#0055FF]"
                        />
                        <span class="text-sm text-gray-700">{{ permissionLabel(perm) }}</span>
                      </label>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="router.navigate(['/roles'])"
              class="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-5 rounded-lg text-sm transition-colors"
            >Cancelar</button>
            <button
              type="button"
              (click)="saveRole()"
              [disabled]="!isFormValid() || saving()"
              class="bg-[#0055FF] hover:bg-[#0044DD] disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              @if (saving()) {
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              }
              {{ isEdit ? 'Guardar cambios' : 'Guardar rol' }}
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class RoleFormComponent implements OnInit {
  roleService = inject(RoleService);
  router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  roleId: number | null = null;
  loadingPermissions = signal(false);
  saving = signal(false);

  name = '';
  description = '';
  permissionGroups = signal<PermissionGroup[]>([]);

  ngOnInit() {
    this.loadingPermissions.set(true);
    this.roleService.findAllPermissions().subscribe({
      next: (perms) => {
        this.permissionGroups.set(this.buildGroups(perms));
        this.loadingPermissions.set(false);

        this.route.params.subscribe(params => {
          if (params['id']) {
            this.isEdit = true;
            this.roleId = Number(params['id']);
            this.loadRole();
          }
        });
      },
      error: () => {
        this.loadingPermissions.set(false);
        this.router.navigate(['/roles']);
      },
    });
  }

  private loadRole() {
    if (!this.roleId) return;
    this.roleService.findById(this.roleId).subscribe({
      next: (role) => {
        this.name = role.name;
        this.description = role.description || '';
        const selectedPerms = new Set(role.permissions);
        this.permissionGroups.update(groups =>
          groups.map(g => ({
            ...g,
            selected: Object.fromEntries(g.permissions.map(p => [p, selectedPerms.has(p)])),
          }))
        );
      },
      error: () => this.router.navigate(['/roles']),
    });
  }

  private buildGroups(permissions: string[]): PermissionGroup[] {
    const moduleMap: Record<string, { module: string; label: string; perms: string[] }> = {
      USERS: { module: 'USERS', label: 'Usuarios', perms: [] },
      ROLES: { module: 'ROLES', label: 'Roles', perms: [] },
      PRODUCTS: { module: 'PRODUCTS', label: 'Productos', perms: [] },
      ORDERS: { module: 'ORDERS', label: 'Pedidos', perms: [] },
      DRIVERS: { module: 'DRIVERS', label: 'Conductores', perms: [] },
      VEHICLES: { module: 'VEHICLES', label: 'Vehículos', perms: [] },
      CUSTOMERS: { module: 'CUSTOMERS', label: 'Clientes', perms: [] },
      DISPATCHES: { module: 'DISPATCHES', label: 'Despachos', perms: [] },
      NOTIFICATIONS: { module: 'NOTIFICATIONS', label: 'Notificaciones', perms: [] },
      SETTINGS: { module: 'SETTINGS', label: 'Configuración', perms: [] },
    };

    for (const perm of permissions) {
      const prefix = perm.split('_')[0];
      if (moduleMap[prefix]) {
        moduleMap[prefix].perms.push(perm);
      }
    }

    return Object.values(moduleMap)
      .filter(g => g.perms.length > 0)
      .map(g => ({
        module: g.module,
        label: g.label,
        permissions: g.perms,
        selected: Object.fromEntries(g.perms.map(p => [p, false])),
      }));
  }

  allSelected = computed(() => {
    const groups = this.permissionGroups();
    if (!groups.length) return false;
    return groups.every(g => g.permissions.every(p => g.selected[p]));
  });

  groupSelected(group: PermissionGroup): boolean {
    return group.permissions.every(p => group.selected[p]);
  }

  toggleSelectAll() {
    const all = this.allSelected();
    this.permissionGroups.update(groups =>
      groups.map(g => ({
        ...g,
        selected: Object.fromEntries(g.permissions.map(p => [p, !all])),
      }))
    );
  }

  toggleGroup(group: PermissionGroup) {
    const allSelected = this.groupSelected(group);
    this.permissionGroups.update(groups =>
      groups.map(g =>
        g.module === group.module
          ? { ...g, selected: Object.fromEntries(g.permissions.map(p => [p, !allSelected])) }
          : g
      )
    );
  }

  togglePermission(group: PermissionGroup, perm: string) {
    this.permissionGroups.update(groups =>
      groups.map(g =>
        g.module === group.module
          ? { ...g, selected: { ...g.selected, [perm]: !g.selected[perm] } }
          : g
      )
    );
  }

  permissionLabel(perm: string): string {
    const labels: Record<string, string> = {
      USERS_VIEW: 'Ver usuarios',
      USERS_CREATE: 'Crear usuarios',
      USERS_EDIT: 'Editar usuarios',
      USERS_DELETE: 'Eliminar usuarios',
      USERS_MANAGE_STATUS: 'Gestionar estado',
      ROLES_VIEW: 'Ver roles',
      ROLES_CREATE: 'Crear roles',
      ROLES_EDIT: 'Editar roles',
      ROLES_DELETE: 'Eliminar roles',
      ROLES_MANAGE_PERMISSIONS: 'Gestionar permisos',
      PRODUCTS_VIEW: 'Ver productos',
      PRODUCTS_CREATE: 'Crear productos',
      PRODUCTS_EDIT: 'Editar productos',
      PRODUCTS_DELETE: 'Eliminar productos',
      ORDERS_VIEW: 'Ver pedidos',
      ORDERS_CREATE: 'Crear pedidos',
      ORDERS_EDIT: 'Editar pedidos',
      ORDERS_DELETE: 'Eliminar pedidos',
      DRIVERS_VIEW: 'Ver conductores',
      DRIVERS_CREATE: 'Crear conductores',
      DRIVERS_EDIT: 'Editar conductores',
      DRIVERS_DELETE: 'Eliminar conductores',
      VEHICLES_VIEW: 'Ver vehículos',
      VEHICLES_CREATE: 'Crear vehículos',
      VEHICLES_EDIT: 'Editar vehículos',
      VEHICLES_DELETE: 'Eliminar vehículos',
      CUSTOMERS_VIEW: 'Ver clientes',
      CUSTOMERS_CREATE: 'Crear clientes',
      CUSTOMERS_EDIT: 'Editar clientes',
      CUSTOMERS_DELETE: 'Eliminar clientes',
      DISPATCHES_VIEW: 'Ver despachos',
      DISPATCHES_CREATE: 'Crear despachos',
      DISPATCHES_EDIT: 'Editar despachos',
      DISPATCHES_DELETE: 'Eliminar despachos',
      NOTIFICATIONS_VIEW: 'Ver notificaciones',
      NOTIFICATIONS_MARK_READ: 'Marcar notificaciones',
      SETTINGS_VIEW: 'Ver configuración',
      SETTINGS_EDIT: 'Editar configuración',
    };
    return labels[perm] || perm.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  isFormValid(): boolean {
    return this.name.trim() !== '';
  }

  saveRole() {
    if (!this.isFormValid() || this.saving()) return;
    this.saving.set(true);

    const selectedPerms = this.permissionGroups().flatMap(g =>
      g.permissions.filter(p => g.selected[p])
    );

    if (this.isEdit && this.roleId) {
      this.roleService.update(this.roleId, {
        name: this.name.trim(),
        description: this.description.trim() || undefined,
        permissions: selectedPerms,
      }).subscribe({
        next: () => {
          this.roleService.loadRoles();
          this.saving.set(false);
          this.router.navigate(['/roles']);
        },
        error: () => this.saving.set(false),
      });
    } else {
      this.roleService.create({
        name: this.name.trim(),
        description: this.description.trim() || undefined,
        permissions: selectedPerms,
      }).subscribe({
        next: () => {
          this.roleService.loadRoles();
          this.saving.set(false);
          this.router.navigate(['/roles']);
        },
        error: () => this.saving.set(false),
      });
    }
  }
}
