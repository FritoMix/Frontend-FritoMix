import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DispatchService } from '../../core/services/dispatch.service';
import { AuthService } from '../../core/services/auth.service';
import { DispatchResponse, DispatchStatus, nextDispatchStatus } from '../../core/models/dispatch.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-dispatch-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  puedeAvanzar(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'despachador' || role === 'admin';
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
    const map: Record<string, string> = {
      'PENDIENTE': 'bg-gray-100 text-gray-700 border-gray-300',
      'ELABORACION': 'bg-amber-50 text-amber-700 border-amber-200',
      'PRODUCCION': 'bg-blue-50 text-blue-700 border-blue-200',
      'LISTO_CARGUE': 'bg-teal-50 text-teal-700 border-teal-200',
      'DESPACHADO': 'bg-green-50 text-green-700 border-green-200'
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'PENDIENTE',
      'ELABORACION': 'ELABORACIÓN',
      'PRODUCCION': 'PRODUCCIÓN',
      'LISTO_CARGUE': 'LISTO CARGUE',
      'DESPACHADO': 'DESPACHADO'
    };
    return map[status] || status;
  }
}
