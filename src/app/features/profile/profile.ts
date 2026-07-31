import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <nav class="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
          <a routerLink="/dashboard" class="hover:text-[#0055FF] cursor-pointer transition-colors">Dashboard</a>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <span class="text-gray-700 font-medium">Mi Perfil</span>
        </nav>
        <h1 class="text-2xl font-extrabold text-[#071938]">Mi Perfil</h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestiona tu información personal y contraseña</p>
      </div>

      @if (message()) {
        <div class="mb-4 p-3 rounded-lg text-sm" [class.bg-green-50]="messageType() === 'success'" [class.bg-red-50]="messageType() === 'error'" [class.text-green-700]="messageType() === 'success'" [class.text-red-700]="messageType() === 'error'">
          {{ message() }}
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-6">
            <div class="flex flex-col items-center text-center">
              <div class="w-24 h-24 rounded-full bg-[#47679d] flex items-center justify-center font-extrabold text-2xl text-white mb-4">
                {{ user()?.avatarInitials || '?' }}
              </div>
              <h4 class="font-bold text-gray-800 text-lg">{{ user()?.name || 'Usuario' }}</h4>
              <p class="text-sm text-gray-500 mt-0.5">{{ user()?.email || '' }}</p>
              <span class="mt-3 text-[11px] font-bold px-3 py-1 rounded-full" [class]="roleBadge()">{{ roleLabel() }}</span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-5">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center gap-2.5 mb-5">
              <div class="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">Información personal</h3>
                <p class="text-xs text-gray-500">Actualiza tus datos básicos</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nombres</label>
                <input
                  type="text"
                  [(ngModel)]="firstName"
                  placeholder="Tus nombres"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:outline-none transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Apellidos</label>
                <input
                  type="text"
                  [(ngModel)]="lastName"
                  placeholder="Tus apellidos"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:outline-none transition-all"
                />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  [(ngModel)]="email"
                  placeholder="tu@correo.com"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center gap-2.5 mb-5">
              <div class="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">Cambiar contraseña</h3>
                <p class="text-xs text-gray-500">Deja en blanco para mantener la actual</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="sm:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nueva contraseña</label>
                <input
                  type="password"
                  [(ngModel)]="password"
                  placeholder="Mínimo 6 caracteres"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:outline-none transition-all"
                />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar contraseña</label>
                <input
                  type="password"
                  [(ngModel)]="confirmPassword"
                  placeholder="Repite la contraseña"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:outline-none transition-all"
                />
                @if (password && confirmPassword && password !== confirmPassword) {
                  <p class="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                }
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              (click)="cancel()"
              class="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-5 rounded-lg text-sm transition-colors"
            >Cancelar</button>
            <button
              type="button"
              (click)="saveProfile()"
              [disabled]="saving()"
              class="bg-[#0055FF] hover:bg-[#0044DD] disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              @if (saving()) {
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              }
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  user = this.auth.currentUser;

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';

  saving = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  ngOnInit() {
    const u = this.user();
    if (u) {
      this.firstName = u.firstName;
      this.lastName = u.lastName;
      this.email = u.email;
    }
  }

  roleLabel(): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      contador: 'Contador',
      coordinador: 'Coordinador',
      despachador: 'Despachador',
    };
    return labels[this.user()?.role || ''] || this.user()?.role || '';
  }

  roleBadge(): string {
    const classes: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      contador: 'bg-purple-100 text-purple-700',
      coordinador: 'bg-amber-100 text-amber-700',
      despachador: 'bg-rose-100 text-rose-700',
    };
    return classes[this.user()?.role || ''] || 'bg-gray-100 text-gray-700';
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }

  saveProfile() {
    if (this.password && this.password !== this.confirmPassword) {
      this.message.set('Las contraseñas no coinciden');
      this.messageType.set('error');
      return;
    }

    if (this.password && this.password.length < 6) {
      this.message.set('La contraseña debe tener al menos 6 caracteres');
      this.messageType.set('error');
      return;
    }

    this.saving.set(true);
    this.message.set('');

    const body: Record<string, unknown> = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
    };
    if (this.password) {
      body['password'] = this.password;
    }

    this.userService.updateProfile(body).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.message.set('Perfil actualizado correctamente');
        this.messageType.set('success');
        this.password = '';
        this.confirmPassword = '';
        this.auth.refreshUserInfo(res.firstName, res.lastName, res.email);
      },
      error: (err) => {
        this.saving.set(false);
        this.message.set(err.error?.error || 'Error al actualizar el perfil');
        this.messageType.set('error');
      },
    });
  }
}
