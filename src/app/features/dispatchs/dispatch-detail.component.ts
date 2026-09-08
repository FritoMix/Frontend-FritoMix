import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DispatchService } from '../../core/services/dispatch.service';
import { AuthService } from '../../core/services/auth.service';
import { DispatchResponse, DispatchStatus, nextDispatchStatus } from '../../core/models/dispatch.model';
import { ToastService } from '../../core/services/toast.service';
import { DispatchStepperComponent } from '../../shared/components/dispatch-stepper.component';
import { dispatchStatusClass, dispatchStatusLabel } from './dispatch-status';

@Component({
  selector: 'app-dispatch-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DispatchStepperComponent],
  templateUrl: 'dispatch-detail.component.html'
})
export class DispatchDetailComponent implements OnInit {
  private dispatchService = inject(DispatchService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  despacho = signal<DispatchResponse | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.dispatchService.findById(id).subscribe({
        next: (res) => this.despacho.set(res),
        error: () => this.despacho.set(null),
        complete: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  labelEditar(): string {
    return this.authService.currentUser()?.role === 'despachador3' ? 'Cargar Camión' : 'Editar';
  }

  estadoCerrado(): boolean {
    const s = this.despacho()?.status;
    return s === 'DESPACHADO';
  }

  puedeAvanzar(): boolean {
    const role = this.authService.currentUser()?.role;
    return ['despachador', 'despachador1', 'despachador2', 'despachador3', 'admin'].includes(role ?? '');
  }

  nextStatus(): DispatchStatus | null {
    const d = this.despacho();
    if (!d) return null;
    return nextDispatchStatus(d.status as DispatchStatus);
  }

  avanzar() {
    const d = this.despacho();
    if (!d) return;
    const next = nextDispatchStatus(d.status as DispatchStatus);
    if (!next) return;
    this.dispatchService.updateStatus(d.id, next).subscribe({
      next: (res) => {
        this.despacho.set(res);
        this.toastService.success('Estado del despacho actualizado.');
      },
      error: (err) => this.toastService.error(err.error?.message || err.error?.error || 'Error al avanzar el estado del despacho.')
    });
  }

  statusClass(status: string): string {
    return dispatchStatusClass(status);
  }

  statusLabel(status: string): string {
    return dispatchStatusLabel(status);
  }
}
