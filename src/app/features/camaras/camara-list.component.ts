import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CamaraService } from '../../core/services/camara.service';
import { ToastService } from '../../core/services/toast.service';
import { CamaraVerificacionResponse, EstadoCamara } from '../../core/models/camara.model';

@Component({
  selector: 'app-camara-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './camara-list.component.html'
})
export class CamaraListComponent implements OnInit {
  private camaraService = inject(CamaraService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  fichas = signal<CamaraVerificacionResponse[]>([]);
  loading = signal<boolean>(false);

  // Filters
  estadoFiltro = signal<string>('');
  clienteSearch = signal<string>('');
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');

  // Pagination
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  readonly estados: { value: EstadoCamara | ''; label: string }[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'PENDIENTE_CAMARAS', label: 'Pendiente Cámaras' },
    { value: 'EN_VERIFICACION', label: 'En Verificación' },
    { value: 'OBSERVADA', label: 'Observada' },
    { value: 'APROBADA', label: 'Aprobada' },
    { value: 'RECHAZADA', label: 'Rechazada' }
  ];

  ngOnInit(): void {
    this.cargarFichas();
  }

  cargarFichas(): void {
    this.loading.set(true);
    this.camaraService
      .getFichas(
        this.estadoFiltro() || undefined,
        this.fechaInicio() ? new Date(this.fechaInicio()).toISOString() : undefined,
        this.fechaFin() ? new Date(this.fechaFin()).toISOString() : undefined,
        this.clienteSearch() || undefined,
        this.currentPage(),
        this.pageSize()
      )
      .subscribe({
        next: res => {
          this.fichas.set(res.content);
          this.totalElements.set(res.totalElements);
          this.totalPages.set(res.totalPages);
          this.loading.set(false);
        },
        error: err => {
          console.error('Error al cargar fichas de cámaras', err);
          this.toastService.show('Error al cargar la bandeja de cámaras', 'error');
          this.loading.set(false);
        }
      });
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.cargarFichas();
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.currentPage.set(newPage);
      this.cargarFichas();
    }
  }

  iniciarVerificacion(dispatchId: number): void {
    this.camaraService.iniciarVerificacion(dispatchId).subscribe({
      next: res => {
        this.toastService.show('Verificación iniciada exitosamente', 'success');
        this.router.navigate(['/camaras', res.id]);
      },
      error: err => {
        this.toastService.show(err?.error?.message || 'Error al iniciar verificación', 'error');
      }
    });
  }

  descargarReporte(event: Event, id: number, dispatchNumber: string): void {
    event.stopPropagation();
    this.camaraService.descargarReporteWord(id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Acta_Camaras_Despacho_${dispatchNumber}.docx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.show('Reporte Word generado y descargado', 'success');
      },
      error: () => {
        this.toastService.show('Error al descargar el reporte Word', 'error');
      }
    });
  }

  getEstadoBadgeClass(estado: EstadoCamara): string {
    switch (estado) {
      case 'PENDIENTE_CAMARAS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'EN_VERIFICACION':
        return 'bg-blue-50 text-[#0055FF] border-blue-200';
      case 'OBSERVADA':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'APROBADA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RECHAZADA':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  getEstadoLabel(estado: EstadoCamara): string {
    switch (estado) {
      case 'PENDIENTE_CAMARAS': return 'Pendiente Cámaras';
      case 'EN_VERIFICACION': return 'En Verificación';
      case 'OBSERVADA': return 'Observada';
      case 'APROBADA': return 'Aprobada';
      case 'RECHAZADA': return 'Rechazada';
      default: return estado;
    }
  }
}
