import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DriverService } from '../../core/services/driver.service';

@Component({
  selector: 'app-driver-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'driver-form.component.html'
})
export class DriverFormComponent implements OnInit {
  driverService = inject(DriverService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isSubmitting = false;
  isEdit = false;
  editId: number | null = null;

  form = {
    document: '',
    name: '',
    phone: '',
    licenseNumber: '',
    active: true,
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      this.driverService.findById(this.editId).subscribe({
        next: (res) => {
          this.form.document = res.document;
          this.form.name = res.name;
          this.form.phone = res.phone || '';
          this.form.licenseNumber = res.licenseNumber;
          this.form.active = res.active;
        },
      });
    }
  }

  onSave() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const data = {
      document: this.form.document,
      name: this.form.name,
      phone: this.form.phone || undefined,
      licenseNumber: this.form.licenseNumber,
      active: this.form.active,
    };

    const request$ = this.isEdit
      ? this.driverService.update(this.editId!, data)
      : this.driverService.create(data);

    request$.subscribe({
      next: () => {
        this.driverService.loadDrivers();
        this.isSubmitting = false;
        this.router.navigate(['/conductores']);
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }
}
