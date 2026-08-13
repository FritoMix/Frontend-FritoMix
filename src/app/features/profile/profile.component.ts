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
  templateUrl: 'profile.component.html'
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
      cartera: 'Cartera',
      coordinador: 'Coordinador',
      despachador: 'Despachador',
    };
    return labels[this.user()?.role || ''] || this.user()?.role || '';
  }

  roleBadge(): string {
    const classes: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      cartera: 'bg-purple-100 text-purple-700',
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
