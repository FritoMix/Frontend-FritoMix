import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

const ORDEN = ['PENDIENTE', 'VEHICULO_ASIGNADO', 'CONDUCTOR_ASIGNADO', 'DESPACHADO'];
const PASOS = [
  { titulo: 'Pedido recibido', desc: 'Revisar pedido entrante' },
  { titulo: 'Placa asignada', desc: 'Despacho 1 · Asignar vehículo' },
  { titulo: 'Despachador asignado', desc: 'Despacho 2 · Confirmar y asignar' },
  { titulo: 'Pedido despachado', desc: 'Despacho 3 · Cargue y reporte' },
];

@Component({
  selector: 'app-dispatch-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (compact()) {
      <div class="flex items-center" [title]="tituloCompleto()">
        @for (paso of PASOS; track paso.titulo; let i = $index) {
          <span
            class="inline-block w-2.5 h-2.5 rounded-full transition-colors"
            [class]="clasePunto(i)"
          ></span>
          @if (!$last) {
            <span class="inline-block h-0.5 w-4 mx-0.5 rounded" [class]="claseLinea(i + 1)"></span>
          }
        }
      </div>
    } @else {
      <div class="flex items-center justify-between w-full">
        @for (paso of PASOS; track paso.titulo; let i = $index) {
          @if (i > 0) {
            <div class="flex-1 mx-2">
              <div class="h-1 rounded-full" [class]="claseLinea(i)"></div>
            </div>
          }
          <div class="flex flex-col items-center text-center w-28 md:w-32 flex-shrink-0">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors"
              [class]="clasePunto(i)"
            >
              @if (esCompletado(i)) {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              } @else {
                {{ i + 1 }}
              }
            </div>
            <span
              class="mt-2 text-[11px] font-bold leading-tight"
              [class]="esCompletado(i) || esActual(i) ? 'text-[#071938]' : 'text-gray-400'"
            >
              {{ paso.titulo }}
            </span>
            <span class="mt-0.5 text-[10px] text-gray-400 leading-tight">{{ paso.desc }}</span>
          </div>
        }
      </div>
    }
  `,
})
export class DispatchStepperComponent {
  status = input<string | null>(null);
  compact = input<boolean>(false);

  protected readonly PASOS = PASOS;

  indice = computed(() => {
    const s = this.status();
    const i = ORDEN.indexOf(s ?? '');
    return i < 0 ? 0 : i;
  });

  esCompletado(index: number): boolean {
    return index < this.indice();
  }

  esActual(index: number): boolean {
    return index === this.indice();
  }

  clasePunto(index: number): string {
    if (this.esCompletado(index)) {
      return 'bg-green-500 border-green-500 text-white';
    }
    if (this.esActual(index)) {
      return 'bg-white border-[#0055FF] text-[#0055FF]';
    }
    return 'bg-gray-200 border-gray-200 text-gray-400';
  }

  claseLinea(index: number): string {
    return index <= this.indice() ? 'bg-green-500' : 'bg-gray-200';
  }

  tituloCompleto(): string {
    return this.PASOS.map((paso, i) => {
      const estado = this.esCompletado(i) ? 'listo' : this.esActual(i) ? 'actual' : 'pendiente';
      return `${i + 1}. ${paso.titulo} (${estado})`;
    }).join(' → ');
  }
}