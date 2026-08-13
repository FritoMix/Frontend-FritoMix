import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { Department, City } from '../../core/models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'client-form.component.html'
})
export class ClientFormComponent implements OnInit {
  clientService = inject(ClientService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isSubmitting = false;
  isEdit = false;
  editId: number | null = null;

  departments = signal<Department[]>([]);
  cities = signal<City[]>([]);
  selectedDepartmentId = signal<string>('');

  form = {
    document: '',
    businessName: '',
    contactName: '',
    address: '',
    phone: '',
    email: '',
    cityId: null as number | null,
    active: true,
  };

  ngOnInit() {
    this.clientService.getDepartments().subscribe({
      next: (res) => this.departments.set(res),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      this.clientService.findById(this.editId).subscribe({
        next: (res) => {
          this.form.document = res.document;
          this.form.businessName = res.businessName;
          this.form.contactName = res.contactName || '';
          this.form.address = res.address || '';
          this.form.phone = res.phone || '';
          this.form.email = res.email || '';
          this.form.active = res.active;
          this.form.cityId = res.cityId;
          this.selectedDepartmentId.set(String(res.departmentId));
          this.loadCities(res.departmentId);
        },
      });
    }
  }

  onDepartmentChange() {
    const deptId = this.selectedDepartmentId();
    if (deptId) {
      this.form.cityId = null;
      this.loadCities(Number(deptId));
    } else {
      this.cities.set([]);
      this.form.cityId = null;
    }
  }

  private loadCities(departmentId: number) {
    this.clientService.getCitiesByDepartment(departmentId).subscribe({
      next: (res) => this.cities.set(res),
    });
  }

  onSave() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const data = {
      document: this.form.document,
      businessName: this.form.businessName,
      contactName: this.form.contactName || undefined,
      address: this.form.address || undefined,
      phone: this.form.phone || undefined,
      email: this.form.email || undefined,
      cityId: this.form.cityId!,
      active: this.form.active,
    };

    const request$ = this.isEdit
      ? this.clientService.update(this.editId!, data)
      : this.clientService.create(data);

    request$.subscribe({
      next: () => {
        this.clientService.loadClients();
        this.isSubmitting = false;
        this.router.navigate(['/clientes']);
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }
}
