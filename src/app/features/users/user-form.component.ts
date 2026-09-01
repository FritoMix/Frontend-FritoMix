import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'user-form.component.html'
})
export class UserFormComponent implements OnInit {
  userService = inject(UserService);
  settingsService = inject(SettingsService);
  toastService = inject(ToastService);
  router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  userId: number | null = null;
  loading = signal(false);
  saving = signal(false);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  role: UserRole | '' = '';
  enabled = true;

  passwordMinLength = 8;
  passwordRequireSpecial = true;

  passwordPolicyMessage = computed(() => {
    const parts: string[] = [
      `Mínimo ${this.passwordMinLength} caracteres`,
    ];
    if (this.passwordRequireSpecial) {
      parts.push('debe incluir al menos un carácter especial (ej: @, #, !, $)');
    }
    return `La contraseña debe tener: ${parts.join(' y ')}.`;
  });

  avatarInitials = computed(() => {
    const f = this.firstName.trim().charAt(0) || '';
    const l = this.lastName.trim().charAt(0) || '';
    return (f + l).toUpperCase() || '??';
  });

  avatarColor = computed(() => {
    if (!this.role) return 'bg-gray-100 text-gray-700';
    return this.getRoleBadgeClass(this.role);
  });

  ngOnInit() {
    this.settingsService.get().subscribe({
      next: (settings) => {
        this.passwordMinLength = settings.passwordMinLength;
        this.passwordRequireSpecial = settings.passwordRequireSpecial;
      },
      error: () => {
        this.passwordMinLength = 8;
        this.passwordRequireSpecial = true;
      },
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.userId = Number(params['id']);
        this.loadUser();
      }
    });
  }

  private loadUser() {
    if (!this.userId) return;
    this.loading.set(true);
    this.userService.findById(this.userId).subscribe({
      next: (user) => {
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.role = mapFormRole(user.role);
        this.enabled = user.enabled;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/usuarios']);
      },
    });
  }

  roleLabel(role: UserRole | string): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      cartera: 'Cartera',
      coordinador: 'Coordinador',
      despachador: 'Despachador',
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: UserRole | string): string {
    const classes: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      cartera: 'bg-purple-100 text-purple-700',
      coordinador: 'bg-amber-100 text-amber-700',
      despachador: 'bg-rose-100 text-rose-700',
    };
    return classes[role] || 'bg-gray-100 text-gray-700';
  }

  isFormValid(): boolean {
    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim() || !this.role) return false;
    if (!this.isEdit && !this.password) return false;
    if (this.password && this.password.length < this.passwordMinLength) return false;
    if (this.password && this.passwordRequireSpecial && !/[^A-Za-z0-9]/.test(this.password)) return false;
    return true;
  }

  saveUser() {
    if (!this.isFormValid() || this.saving()) return;
    this.saving.set(true);

    const roleUppercase = (this.role as string).toUpperCase();

    if (this.isEdit && this.userId) {
      const body: Record<string, unknown> = {
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email: this.email.trim(),
        role: roleUppercase,
        enabled: this.enabled,
      };
      if (this.password) body['password'] = this.password;

      this.userService.update(this.userId, body).subscribe({
        next: () => {
          this.userService.loadAll();
          this.saving.set(false);
          this.toastService.success('Usuario actualizado exitosamente.');
          this.router.navigate(['/usuarios']);
        },
        error: (err) => {
          this.saving.set(false);
          this.toastService.error(err.error?.message || err.error?.error || 'Error al actualizar el usuario.');
        },
      });
    } else {
      this.userService.create({
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email: this.email.trim(),
        password: this.password,
        role: roleUppercase,
      }).subscribe({
        next: () => {
          this.userService.loadAll();
          this.saving.set(false);
          this.toastService.success('Usuario creado exitosamente.');
          this.router.navigate(['/usuarios']);
        },
        error: (err) => {
          this.saving.set(false);
          this.toastService.error(err.error?.message || err.error?.error || 'Error al crear el usuario.');
        },
      });
    }
  }
}

function mapFormRole(role: string): UserRole {
  const map: Record<string, UserRole> = {
    'ADMIN': 'admin',
    'CARTERA': 'cartera',
    'COORDINADOR': 'coordinador',
    'DESPACHADOR': 'despachador',
  };
  return map[role] || 'admin';
}
