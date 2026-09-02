import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

type ResetStep = 'email' | 'code' | 'password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: 'login.component.html'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  email = '';
  password = '';
  showPassword = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  showReset = signal(false);
  resetStep = signal<ResetStep>('email');
  resetEmail = '';
  resetCode = '';
  newPassword = '';
  confirmPassword = '';
  resetLoading = signal(false);
  resetError = signal<string | null>(null);
  resetSuccess = signal(false);

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

  openReset() {
    this.showReset.set(true);
    this.resetStep.set('email');
    this.resetEmail = '';
    this.resetCode = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.resetError.set(null);
    this.resetSuccess.set(false);
  }

  closeReset() {
    this.showReset.set(false);
  }

  onRequestCode() {
    if (!this.resetEmail.trim()) {
      this.resetError.set('Ingresa tu correo electrónico');
      return;
    }
    this.resetLoading.set(true);
    this.resetError.set(null);
    this.auth.forgotPassword(this.resetEmail.trim()).subscribe({
      next: () => {
        this.resetLoading.set(false);
        this.resetStep.set('code');
      },
      error: (err) => {
        this.resetLoading.set(false);
        this.resetError.set(err.error?.error || 'Error al solicitar el código');
      }
    });
  }

  onVerifyCode() {
    if (!this.resetCode.trim()) {
      this.resetError.set('Ingresa el código recibido');
      return;
    }
    this.resetLoading.set(true);
    this.resetError.set(null);
    this.auth.verifyResetCode(this.resetEmail.trim(), this.resetCode.trim()).subscribe({
      next: () => {
        this.resetLoading.set(false);
        this.resetStep.set('password');
      },
      error: (err) => {
        this.resetLoading.set(false);
        this.resetError.set(err.error?.error || 'El código no es válido');
      }
    });
  }

  onResetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.resetError.set('Completa ambos campos de contraseña');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.resetError.set('Las contraseñas no coinciden');
      return;
    }
    this.resetLoading.set(true);
    this.resetError.set(null);
    this.auth.resetPassword(this.resetEmail.trim(), this.resetCode.trim(), this.newPassword).subscribe({
      next: () => {
        this.resetLoading.set(false);
        this.resetSuccess.set(true);
      },
      error: (err) => {
        this.resetLoading.set(false);
        this.resetError.set(err.error?.error || 'Error al restablecer la contraseña');
      }
    });
  }

  backToLogin() {
    this.showReset.set(false);
    this.toast.success('Contraseña restablecida. Inicia sesión con tu nueva contraseña.');
  }

  resetStepsOrder = ['email', 'code', 'password'];

  resetStepIndex(): number {
    return this.resetStepsOrder.indexOf(this.resetStep());
  }
}
