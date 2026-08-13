import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: 'login.component.html'
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
