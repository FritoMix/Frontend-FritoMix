import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CamaraService } from '../../core/services/camara.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import {
  CamaraVerificacionResponse,
  CamaraHistorialResponse,
  DetalleVerificacionResponse,
  EstadoCamara
} from '../../core/models/camara.model';

interface LineaFormState {
  detalleId: number;
  productName: string;
  productCode: string;
  cantidadDespachada: number;
  cantidadVerificada: number | null;
  diferencia: number;
  estadoLinea: string;
  tipoInconsistencia: string;
  observacionLinea: string;
}

@Component({
  selector: 'app-camara-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './camara-detail.component.html'
})
export class CamaraDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private camaraService = inject(CamaraService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  ficha = signal<CamaraVerificacionResponse | null>(null);
  historial = signal<CamaraHistorialResponse[]>([]);
  lineasState = signal<LineaFormState[]>([]);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  activeTab = signal<'verificacion' | 'historial'>('verificacion');

  // Modals & Inputs
  observacionModalOpen = signal<boolean>(false);
  observacionTexto = signal<string>('');

  aprobarModalOpen = signal<boolean>(false);
  confirmacionTexto = signal<string>('');

  rechazarModalOpen = signal<boolean>(false);
  motivoRechazoTexto = signal<string>('');

  reabrirModalOpen = signal<boolean>(false);
  motivoReaperturaTexto = signal<string>('');

  readonly tiposInconsistencia = [
    { value: '', label: 'Seleccionar causa...' },
    { value: 'FALTANTE', label: 'Faltante de producto' },
    { value: 'SOBRANTE', label: 'Sobrante de producto' },
    { value: 'REFERENCIA_INCORRECTA', label: 'Referencia / Código incorrecto' },
    { value: 'DANO_PRODUCTO', label: 'Producto dañado o defectuoso' },
    { value: 'ERROR_DESPACHO', label: 'Error en la hoja de despacho' },
    { value: 'DIFERENCIA_INVENTARIO', label: 'Diferencia de inventario físico' },
    { value: 'OTRO', label: 'Otra causa' }
  ];

  get currentUser() {
    return this.authService.currentUser();
  }

  get isAdmin(): boolean {
    const role = this.currentUser?.role?.toUpperCase();
    return role === 'ADMIN' || role === 'ROLE_ADMIN';
  }

  get isEditable(): boolean {
    const estado = this.ficha()?.estadoCamaras;
    return estado === 'EN_VERIFICACION' || estado === 'PENDIENTE_CAMARAS';
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.cargarFicha(+idParam);
    }
  }

  cargarFicha(id: number): void {
    this.loading.set(true);
    this.camaraService.getFichaById(id).subscribe({
      next: res => {
        this.ficha.set(res);
        this.initLineasState(res.detalles);
        this.cargarHistorial(id);
        this.loading.set(false);
      },
      error: err => {
        console.error('Error al cargar detalle de cámaras', err);
        this.toastService.show('Error al obtener detalle de cámaras', 'error');
        this.loading.set(false);
      }
    });
  }

  cargarHistorial(id: number): void {
    this.camaraService.getHistorial(id).subscribe({
      next: res => this.historial.set(res),
      error: err => console.warn('Error al obtener historial', err)
    });
  }

  private initLineasState(detalles: DetalleVerificacionResponse[]): void {
    const state: LineaFormState[] = (detalles || []).map(d => {
      const verif = d.cantidadVerificada ?? null;
      const dif = verif !== null ? verif - d.cantidadDespachada : 0;
      return {
        detalleId: d.id,
        productName: d.productName,
        productCode: d.productCode,
        cantidadDespachada: d.cantidadDespachada,
        cantidadVerificada: verif,
        diferencia: dif,
        estadoLinea: d.estadoLinea,
        tipoInconsistencia: d.tipoInconsistencia || '',
        observacionLinea: d.observacionLinea || ''
      };
    });
    this.lineasState.set(state);
  }

  onCantidadVerificadaChange(item: LineaFormState, valor: number | null): void {
    item.cantidadVerificada = valor;
    if (valor !== null && !isNaN(valor)) {
      item.diferencia = valor - item.cantidadDespachada;
      item.estadoLinea = item.diferencia === 0 ? 'OK' : 'DIFERENCIA';
    } else {
      item.diferencia = 0;
      item.estadoLinea = 'PENDIENTE';
    }
  }

  guardarAvance(): void {
    const f = this.ficha();
    if (!f) return;

    const lineasPayload = this.lineasState().map(l => ({
      detalleId: l.detalleId,
      cantidadVerificada: l.cantidadVerificada !== null ? Number(l.cantidadVerificada) : 0,
      tipoInconsistencia: l.tipoInconsistencia || undefined,
      observacionLinea: l.observacionLinea || undefined
    }));

    this.saving.set(true);
    this.camaraService
      .registrarVerificacionCantidades(f.id, { lineas: lineasPayload })
      .subscribe({
        next: updated => {
          this.ficha.set(updated);
          this.initLineasState(updated.detalles);
          this.toastService.show('Cantidades verificadas guardadas correctamente', 'success');
          this.saving.set(false);
        },
        error: err => {
          this.toastService.show(err?.error?.message || 'Error al guardar verificación', 'error');
          this.saving.set(false);
        }
      });
  }

  confirmarObservar(): void {
    const f = this.ficha();
    if (!f || !this.observacionTexto().trim()) return;

    this.saving.set(true);
    this.camaraService
      .observarFicha(f.id, { observacion: this.observacionTexto().trim() })
      .subscribe({
        next: updated => {
          this.ficha.set(updated);
          this.observacionModalOpen.set(false);
          this.toastService.show('Ficha de Cámaras marcada como OBSERVADA', 'success');
          this.cargarHistorial(f.id);
          this.saving.set(false);
        },
        error: err => {
          this.toastService.show(err?.error?.message || 'Error al observar la ficha', 'error');
          this.saving.set(false);
        }
      });
  }

  confirmarAprobar(): void {
    const f = this.ficha();
    if (!f) return;

    this.saving.set(true);
    this.camaraService
      .aprobarFicha(f.id, { confirmacion: this.confirmacionTexto().trim() || 'Verificación aprobada en cámaras' })
      .subscribe({
        next: updated => {
          this.ficha.set(updated);
          this.aprobarModalOpen.set(false);
          this.toastService.show('Ficha de Cámaras APROBADA exitosamente', 'success');
          this.cargarHistorial(f.id);
          this.saving.set(false);
        },
        error: err => {
          this.toastService.show(err?.error?.message || 'Error al aprobar la ficha', 'error');
          this.saving.set(false);
        }
      });
  }

  confirmarRechazar(): void {
    const f = this.ficha();
    if (!f || !this.motivoRechazoTexto().trim()) return;

    this.saving.set(true);
    this.camaraService
      .rechazarFicha(f.id, { motivo: this.motivoRechazoTexto().trim() })
      .subscribe({
        next: updated => {
          this.ficha.set(updated);
          this.rechazarModalOpen.set(false);
          this.toastService.show('Ficha de Cámaras RECHAZADA', 'error');
          this.cargarHistorial(f.id);
          this.saving.set(false);
        },
        error: err => {
          this.toastService.show(err?.error?.message || 'Error al rechazar la ficha', 'error');
          this.saving.set(false);
        }
      });
  }

  confirmarReabrir(): void {
    const f = this.ficha();
    if (!f || !this.motivoReaperturaTexto().trim()) return;

    this.saving.set(true);
    this.camaraService
      .reabrirFicha(f.id, { motivo: this.motivoReaperturaTexto().trim() })
      .subscribe({
        next: updated => {
          this.ficha.set(updated);
          this.initLineasState(updated.detalles);
          this.reabrirModalOpen.set(false);
          this.toastService.show('Ficha de Cámaras REABIERTA para verificación', 'success');
          this.cargarHistorial(f.id);
          this.saving.set(false);
        },
        error: err => {
          this.toastService.show(err?.error?.message || 'Error al reabrir la ficha', 'error');
          this.saving.set(false);
        }
      });
  }

  descargarReporte(): void {
    const f = this.ficha();
    if (!f) return;
    this.camaraService.descargarReporteWord(f.id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Acta_Camaras_Despacho_${f.dispatchNumber || f.dispatchId}.docx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.show('Reporte Word descargado exitosamente', 'success');
      },
      error: () => this.toastService.show('Error al generar el documento Word', 'error')
    });
  }

  getEstadoBadgeClass(estado?: EstadoCamara): string {
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

  getEstadoLabel(estado?: EstadoCamara): string {
    switch (estado) {
      case 'PENDIENTE_CAMARAS': return 'Pendiente Cámaras';
      case 'EN_VERIFICACION': return 'En Verificación';
      case 'OBSERVADA': return 'Observada';
      case 'APROBADA': return 'Aprobada';
      case 'RECHAZADA': return 'Rechazada';
      default: return estado || '';
    }
  }
}
