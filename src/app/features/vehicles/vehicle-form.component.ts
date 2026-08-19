import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { VehicleService } from '../../core/services/vehicle.service';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'vehicle-form.component.html'
})
export class VehicleFormComponent implements OnInit {
  vehicleService = inject(VehicleService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isSubmitting = false;
  isEdit = false;
  editId: number | null = null;

  form = {
    vehicleNumber: '',
    type: '',
    capacity: 0,
    dimension: 0,
    active: true,
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      this.vehicleService.findById(this.editId).subscribe({
        next: (res) => {
          this.form.vehicleNumber = res.vehicleNumber;
          this.form.type = res.type;
          this.form.capacity = res.capacity;
          this.form.dimension = res.dimension;
          this.form.active = res.active;
        },
      });
    }
  }

  onSave() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const data = {
      vehicleNumber: this.form.vehicleNumber.toUpperCase(),
      type: this.form.type,
      capacity: this.form.capacity,
      dimension: this.form.dimension,
      active: this.form.active,
    };

    const request$ = this.isEdit
      ? this.vehicleService.update(this.editId!, data)
      : this.vehicleService.create(data);

    request$.subscribe({
      next: () => {
        this.vehicleService.loadAll();
        this.isSubmitting = false;
        this.router.navigate(['/vehiculos']);
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }
}
