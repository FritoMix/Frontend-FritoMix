import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'settings.component.html'
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  router = inject(Router);

  activeTab = signal('general');
  loading = signal(true);
  saving = signal(false);

  companyName = '';
  nit = '';
  adminEmail = '';
  address = '';
  phone = '';
  city = '';
  department = '';
  economicActivity = '';
  passwordMinLength = 8;
  passwordRequireSpecial = true;
  passwordExpirationDays = 90;
  sessionTimeoutMinutes = 60;
  maxLoginAttempts = 5;

  tabs = [
    { id: 'general', label: 'General' },
    { id: 'empresa', label: 'Empresa' },
    { id: 'seguridad', label: 'Seguridad' }
  ];

  ngOnInit() {
    this.loadSettings();
  }

  private loadSettings() {
    this.loading.set(true);
    this.settingsService.get().subscribe({
      next: (res) => {
        this.companyName = res.companyName;
        this.nit = res.nit || '';
        this.adminEmail = res.adminEmail || '';
        this.address = res.address || '';
        this.phone = res.phone || '';
        this.city = res.city || '';
        this.department = res.department || '';
        this.economicActivity = res.economicActivity || '';
        this.passwordMinLength = res.passwordMinLength;
        this.passwordRequireSpecial = res.passwordRequireSpecial;
        this.passwordExpirationDays = res.passwordExpirationDays;
        this.sessionTimeoutMinutes = res.sessionTimeoutMinutes;
        this.maxLoginAttempts = res.maxLoginAttempts;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSave() {
    if (this.saving()) return;
    this.saving.set(true);

    this.settingsService.update({
      companyName: this.companyName,
      nit: this.nit || undefined,
      adminEmail: this.adminEmail || undefined,
      address: this.address || undefined,
      phone: this.phone || undefined,
      city: this.city || undefined,
      department: this.department || undefined,
      economicActivity: this.economicActivity || undefined,
      passwordMinLength: this.passwordMinLength,
      passwordRequireSpecial: this.passwordRequireSpecial,
      passwordExpirationDays: this.passwordExpirationDays,
      sessionTimeoutMinutes: this.sessionTimeoutMinutes,
      maxLoginAttempts: this.maxLoginAttempts,
    }).subscribe({
      next: () => {
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
