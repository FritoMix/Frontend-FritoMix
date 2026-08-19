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
  templateUrl: 'role-form.component.html'
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
          this.roleService.loadAll();
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
          this.roleService.loadAll();
          this.saving.set(false);
          this.router.navigate(['/roles']);
        },
        error: () => this.saving.set(false),
      });
    }
  }
}
