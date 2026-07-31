import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-[#47679d] flex flex-col relative overflow-hidden">
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle, #ffffff 1px, transparent 1px); background-size: 24px 24px;"></div>

      <div class="flex-1 flex items-center justify-center px-6 relative z-10">
        <div class="flex flex-col lg:flex-row items-center gap-16 w-full max-w-5xl">

          <div class="flex flex-col items-center lg:items-start text-center lg:text-left flex-1">
            <img src="logo-fritomix.png" alt="FritoMix" class="w-56 h-56 object-contain mb-4" />
            <h1 class="text-white text-4xl font-extrabold tracking-tight">FritoMix S.A.S</h1>
            <p class="text-gray-300 text-lg mt-1">Gesti&oacute;n de Ventas y Despachos</p>
          </div>

          <div class="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 w-full max-w-md">
            <h2 class="text-2xl font-extrabold text-gray-900">Iniciar Sesi&oacute;n</h2>
            <p class="text-gray-500 text-sm mt-1 mb-8">Ingresa tus credenciales para continuar</p>

            @if (error()) {
              <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {{ error() }}
              </div>
            }

            <form (ngSubmit)="onLogin()">
              <div class="mb-5">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Usuario</label>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="usuario@fritomix.com"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <div class="mb-5">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Contrase&ntilde;a</label>
                <div class="relative">
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    [(ngModel)]="password"
                    name="password"
                    placeholder="••••••••••••"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-12"
                    required
                  />
                  <button
                    type="button"
                    (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      @if (showPassword()) {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                      } @else {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      }
                    </svg>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between mb-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span class="text-sm text-gray-600">Recordarme</span>
                </label>
                <a href="#" class="text-sm text-blue-600 hover:text-blue-700 font-medium">&iquest;Olvidaste tu contrase&ntilde;a?</a>
              </div>

              <button
                type="submit"
                [disabled]="loading()"
                class="w-full bg-[#0055FF] hover:bg-[#0044DD] disabled:bg-blue-300 text-white font-bold py-3 rounded-lg text-sm transition-colors shadow-lg shadow-blue-500/25"
              >
                {{ loading() ? 'Ingresando...' : 'Iniciar Sesi&oacute;n' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer class="text-center py-5 relative z-10">
        <p class="text-gray-400 text-xs">&copy; 2026 FritoMix S.A.S - Todos los derechos reservados</p>
      </footer>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);

  email = '';
  password = '';
  showPassword = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  onLogin() {
    if (!this.email || !this.password) return;

    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => this.auth.handleAuthSuccess(res),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Error al conectar con el servidor');
      }
    });
  }
}
