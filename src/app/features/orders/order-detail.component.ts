import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderResponse, OrderDetailResponse } from '../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <a routerLink="/pedidos" class="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Volver a Pedidos
          </a>
        </div>
        <div class="flex flex-wrap gap-2">
          @if (isCartera() && order()?.status === 'PENDIENTE') {
            <button (click)="changeStatus('APROBADO')"
              class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Aprobar
            </button>
            <button (click)="changeStatus('CANCELADO')"
              class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Cancelar
            </button>
          }
          <button (click)="generatePDF()" [disabled]="pdfGenerating()"
            class="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            {{ pdfGenerating() ? 'Generando...' : 'Descargar PDF' }}
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-16">
          <div class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-[#0055FF] rounded-full animate-spin"></div>
            <span class="text-gray-500 text-sm">Cargando pedido...</span>
          </div>
        </div>
      } @else {
        @let ord = order()!;
        @if (ord) {
        <div class="space-y-5">

          <!-- Header card -->
          <div class="fm-card p-5">
            <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-[#ffffff] rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow flex-shrink-0">
                <img src="logo-fritomix.png" alt="FritoMix" class="w-30 h-20 object-contain" />
                </div>
                <div>
                  <h1 class="text-2xl font-extrabold text-[#071938]">ORDEN DE PEDIDO Y CARGUE</h1>
                  <p class="text-base font-bold text-red-600">FRITOMIX S.A.S</p>
                  <p class="text-xs text-gray-500">Gestión de Ventas y Despachos</p>
                </div>
              </div>
              <div class="border border-gray-200 rounded-lg overflow-hidden text-sm">
                <table>
                  <tr class="border-b border-gray-200"><td class="px-3 py-1.5 text-gray-500 font-semibold bg-gray-50 border-r border-gray-200">Código:</td><td class="px-3 py-1.5 font-bold text-[#071938]">FMX-FM-VT-PD-01</td></tr>
                  <tr class="border-b border-gray-200"><td class="px-3 py-1.5 text-gray-500 font-semibold bg-gray-50 border-r border-gray-200">#_Pedido:</td><td class="px-3 py-1.5 font-bold">{{ ord.id }}</td></tr>
                  <tr class="border-b border-gray-200"><td class="px-3 py-1.5 text-gray-500 font-semibold bg-gray-50 border-r border-gray-200">Fecha:</td><td class="px-3 py-1.5 font-bold">{{ ord.orderDate | date:'dd/MM/yyyy' }}</td></tr>
                  <tr><td class="px-3 py-1.5 text-gray-500 font-semibold bg-gray-50 border-r border-gray-200">Página:</td><td class="px-3 py-1.5 font-bold">1 de 1</td></tr>
                </table>
              </div>
            </div>
          </div>

          <!-- Client + Dispatcher -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="lg:col-span-2 fm-card overflow-hidden">
              <div class="bg-blue-700 px-4 py-2"><h3 class="text-white font-bold text-sm">CLIENTE</h3></div>
              <div class="p-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <div class="flex gap-2"><span class="text-gray-500 w-28">Cliente:</span><span class="font-semibold text-[#071938]">{{ ord.customerName }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-28">Fecha Pedido:</span><span class="font-semibold">{{ ord.orderDate | date:'dd/MM/yyyy' }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-28">Numeral:</span><span class="font-semibold text-[#071938]">{{ ord.customerDocument }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-28">Coordinador:</span><span class="font-semibold">{{ ord.coordinatorName || '—' }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-28">Departamento:</span><span class="font-semibold">{{ ord.departmentName || '—' }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-28">Teléfono:</span><span class="font-semibold">{{ ord.phone || '—' }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-28">Ciudad:</span><span class="font-semibold">{{ ord.cityName || '—' }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-28">Dirección:</span><span class="font-semibold">{{ ord.address || '—' }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-28">Estado:</span><span class="font-semibold">{{ ord.status }}</span></div>
              </div>
            </div>
            <div class="fm-card overflow-hidden">
              <div class="bg-blue-700 px-4 py-2"><h3 class="text-white font-bold text-sm">DESPACHADOR / TRANSPORTE</h3></div>
              <div class="p-4 space-y-1.5 text-sm">
                <div class="flex gap-2"><span class="text-gray-500 w-32">Despachador:</span><span class="font-semibold">{{ ord.dispatchUserName || '—' }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-32">Vehículo:</span><span class="font-semibold">{{ ord.dispatchVehicleNumber || '—' }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-32">Fecha Despacho:</span><span class="font-semibold">{{ ord.dispatchDate ? (ord.dispatchDate | date:'dd/MM/yyyy') : '—' }}</span></div>
              </div>
            </div>
          </div>

          <!-- Products table -->
          <div class="fm-card overflow-hidden">
            <div class="bg-[#071938] px-4 py-2"><h3 class="text-white font-bold text-sm">DETALLE PRODUCTO</h3></div>
            <div class="overflow-x-auto">
              <table class="fm-table">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="!pl-5 w-10">#</th>
                    <th>Descripción</th>
                    <th class="text-center">Paca</th>
                    <th class="text-center">Bulto</th>
                    <th class="text-center !pr-5">Caja</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of ord.details; track item.id; let i = $index) {
                    <tr [style.background]="groupColor(i)">
                      <td class="!pl-5 font-mono text-sm whitespace-nowrap">{{ i + 1 }}</td>
                      <td class="font-medium text-[#071938]">
                        {{ item.productName }}
                        @if (item.lote) {
                          <span class="block text-xs text-gray-500 mt-0.5">Lote: {{ item.lote }}</span>
                        }
                        @if (item.detalleProducto) {
                          <span class="block text-xs text-gray-500 mt-0.5">Arrume: {{ item.detalleProducto }}</span>
                        }
                        @if (item.observations) {
                          <span class="block text-xs text-gray-500 mt-0.5">Obs: {{ item.observations }}</span>
                        }
                      </td>
                      <td class="text-center font-semibold">{{ item.productType === 'PACA' ? item.quantity : 0 }}</td>
                      <td class="text-center font-semibold">{{ (item.productType === 'BULT' || item.productType === 'CANA' || !item.productType) ? item.quantity : 0 }}</td>
                      <td class="text-center font-semibold !pr-5">{{ item.productType === 'CAJA' ? item.quantity : 0 }}</td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr class="bg-[#071938] text-white font-bold">
                    <td colspan="2" class="!pl-5 !text-white">TOTALES</td>
                    <td class="text-center !text-white">{{ totalPacas() }}</td>
                    <td class="text-center !text-white">{{ totalBultos() }}</td>
                    <td class="text-center !pr-5 !text-white">{{ totalCajas() }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Summary + Notes -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="fm-card overflow-hidden">
              <div class="bg-[#071938] px-4 py-2"><h3 class="text-white font-bold text-sm">RESUMEN GENERAL</h3></div>
              <div class="p-4 space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">Total Bultos:</span><span class="font-bold text-[#071938]">{{ totalBultos() }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Total Cajas:</span><span class="font-bold">{{ totalCajas() }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Total Pacas:</span><span class="font-bold">{{ totalPacas() }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Total Unidades:</span><span class="font-bold">{{ totalQty() }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Peso Total (kg):</span><span class="font-bold">{{ totalPeso() | number:'1.3-3':'es-CO' }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Dimensión Total:</span><span class="font-bold">{{ totalDimension() | number:'1.1-1':'es-CO' }}</span></div>
              </div>
            </div>
            <div class="fm-card overflow-hidden">
              <div class="bg-[#071938] px-4 py-2"><h3 class="text-white font-bold text-sm">OBSERVACIONES DEL PEDIDO</h3></div>
              <div class="p-4 text-sm text-gray-600">{{ ord.notes || '—' }}</div>
            </div>
            <div class="fm-card overflow-hidden">
              <div class="bg-[#071938] px-4 py-2"><h3 class="text-white font-bold text-sm">INFORMACIÓN DE TRANSPORTE</h3></div>
              <div class="p-4 space-y-1.5 text-sm">
                <div class="flex gap-2"><span class="text-gray-500 w-32">Conductor:</span><span class="font-semibold">{{ ord.dispatchDriverName || '—' }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-32">Documento:</span><span class="font-semibold">{{ ord.dispatchDriverDocument || '—' }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-32">Teléfono:</span><span class="font-semibold">{{ ord.dispatchDriverPhone || '—' }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-32">Fecha Despacho:</span><span class="font-semibold">{{ (ord.dispatchDate | date:'dd/MM/yyyy') || '—' }}</span></div>
                <div class="flex gap-2"><span class="text-gray-500 w-32">Hora Despacho:</span><span class="font-semibold">{{ (ord.dispatchDate | date:'HH:mm') || '—' }}</span></div>
              </div>
            </div>
          </div>

        </div>
        } @else {
        <div class="flex items-center justify-center py-16">
          <span class="text-gray-500 text-sm">No se encontró el pedido.</span>
        </div>
        }
      }
    </div>
  `
})
export class OrderDetailComponent implements OnInit {
  private orderService = inject(OrderService);
  private route       = inject(ActivatedRoute);
  private authService = inject(AuthService);

  loading       = signal(true);
  pdfGenerating  = signal(false);
  order         = signal<OrderResponse | null>(null);

  isCartera(): boolean {
    return this.authService.currentUser()?.role === 'cartera';
  }

  changeStatus(status: 'APROBADO' | 'CANCELADO') {
    const id = this.order()?.id;
    if (!id) return;
    const message = status === 'APROBADO'
      ? '¿Está seguro de aprobar este pedido?'
      : '¿Está seguro de cancelar este pedido?';
    if (!confirm(message)) return;
    this.orderService.updateStatus(id, status).subscribe({
      next: (res) => this.order.set(res),
      error: () => alert('Error al cambiar el estado del pedido.')
    });
  }

  // Colour palette for product groups (6 alternating colours)
  private readonly GROUP_COLORS = [
    '#D6EAF8',  // light blue  – group 1
    '#FFF9C4',  // light yellow – group 2
    '#FFE6C1',  // light orange – group 3
    '#F8F8F8',  // near white  – group 4
    '#EDD8FF',  // light purple – group 5
    '#D2F8DE',  // light green – group 6
  ];

  private readonly GROUP_SIZE = 5;   // products per group

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.findById(Number(id)).subscribe({
        next : (res) => { this.order.set(res); this.loading.set(false); },
        error: ()    => { this.loading.set(false); },
      });
    }
  }

  totalQty(): number {
    return this.order()?.details.reduce((s, d) => s + d.quantity, 0) ?? 0;
  }

  totalBultos(): number {
    return this.order()?.details
      .filter(d => d.productType === 'BULT' || d.productType === 'CANA' || !d.productType)
      .reduce((s, d) => s + d.quantity, 0) ?? 0;
  }

  totalCajas(): number {
    return this.order()?.details
      .filter(d => d.productType === 'CAJA')
      .reduce((s, d) => s + d.quantity, 0) ?? 0;
  }

  totalPacas(): number {
    return this.order()?.details
      .filter(d => d.productType === 'PACA')
      .reduce((s, d) => s + d.quantity, 0) ?? 0;
  }

  totalPeso(): number {
    return this.order()?.details
      .reduce((s, d) => s + ((d.pesoUnidad ?? 0) * d.quantity), 0) ?? 0;
  }

  totalDimension(): number {
    return this.order()?.details
      .reduce((s, d) => s + ((d.dimension ?? 0) * d.quantity), 0) ?? 0;
  }

  groupColor(idx: number): string {
    return this.GROUP_COLORS[Math.floor(idx / this.GROUP_SIZE) % this.GROUP_COLORS.length];
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  PDF GENERATOR – reproduces the "ORDEN DE PEDIDO Y CARGUE" format exactly
  // ─────────────────────────────────────────────────────────────────────────
  private loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  private async clipToCircle(dataUrl: string): Promise<string> {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });
    const size = Math.min(img.width, img.height);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, (img.width - size) / -2, (img.height - size) / -2);
    return canvas.toDataURL('image/png');
  }

  async generatePDF() {
    if (!this.order() || this.pdfGenerating()) return;
    this.pdfGenerating.set(true);

    try {
      const { default: jsPDF } = await import('jspdf');
      type TextOptionsLight = import('jspdf').TextOptionsLight;
      const logoDataUrl = await this.clipToCircle(await this.loadImageAsBase64('logo-fritomix.png'));

      const doc   = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const order = this.order()!;
      const items = order.details;

      // ── Page constants ───────────────────────────────────────────
      const PW = 297, PH = 210;
      const ML = 7, MR = 7, MT = 7;
      const CW = PW - ML - MR;   // 283 mm

      // ── Colour aliases ───────────────────────────────────────────
      type RGB = [number, number, number];
      const NAVY:  RGB = [7,   25,  56];
      const RED:   RGB = [196, 30,  30];
      const WHITE: RGB = [255, 255, 255];
      const LGRAY: RGB = [240, 242, 246];
      const HGRAY: RGB = [209, 213, 219];
      const BLK:   RGB = [20,  20,  20];
      const DGR:   RGB = [80,  90, 105];
      const LBLU:  RGB = [219, 234, 254];  // light-blue for section headers

      // Row group colours  (same order as UI)
      const GCLR: RGB[] = [
        [214, 234, 248],
        [255, 249, 196],
        [255, 230, 193],
        [248, 248, 248],
        [237, 222, 255],
        [210, 248, 222],
      ];

      // ── Short helpers ────────────────────────────────────────────
      const F  = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
      const D  = (c: RGB, lw = 0.2) => { doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(lw); };
      const TC = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
      const B  = (s: number) => { doc.setFont('helvetica', 'bold');   doc.setFontSize(s); };
      const N  = (s: number) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(s); };
      const FR = (x: number, y: number, w: number, h: number) => doc.rect(x, y, w, h, 'F');
      const SR = (x: number, y: number, w: number, h: number) => doc.rect(x, y, w, h, 'S');
      const TX = (t: string, x: number, y: number, o?: TextOptionsLight) =>
        doc.text(t, x, y, o);
      const LN = (x1: number, y1: number, x2: number, y2: number) => doc.line(x1, y1, x2, y2);

      const fmtDate = (iso: string) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return isNaN(d.getTime()) ? iso
          : `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
      };

      const clip = (text: string, maxW: number) =>
        doc.splitTextToSize(text, maxW)[0] as string;

      let y = MT;

      // ═════════════════════════════════════════════════════════════
      //  SECTION 1 — MAIN HEADER
      // ═════════════════════════════════════════════════════════════
      const HDR_H  = 16;
      const LOGO_W = 32;
      const CODE_W = 55;
      const TTL_W  = CW - LOGO_W - CODE_W;

      // outer box
      D(HGRAY, 0.3); SR(ML, y, CW, HDR_H);

      // ── Logo box ──────────────────────────────────────────────
      const logoSize = HDR_H - 2;
      const lcx = ML + LOGO_W / 2;
      const lcy = y + HDR_H / 2;

      // Actual logo image (circular)
      try {
        doc.addImage(logoDataUrl, 'PNG', lcx - logoSize / 2, lcy - logoSize / 2, logoSize, logoSize);
      } catch {
        // fallback: draw name text if image fails
        doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.circle(ML + LOGO_W / 2, y + HDR_H / 2, 7, 'F');
        TC(WHITE); B(5);
        TX('FRITO', ML + LOGO_W / 2, y + HDR_H / 2 - 1, { align: 'center' });
        TX('MIX',   ML + LOGO_W / 2, y + HDR_H / 2 + 3.5, { align: 'center' });
      }

      // ── Title ──────────────────────────────────────────────
      const tlx = ML + LOGO_W;
      TC(NAVY);  B(14);
      TX('ORDEN DE PEDIDO Y CARGUE', tlx + TTL_W / 2, y + 6.5, { align: 'center' });
      TC(RED);   B(10);
      TX('FRITOMIX S.A.S', tlx + TTL_W / 2, y + 11, { align: 'center' });
      TC(DGR);   N(6.5);
      TX('Gestión de Ventas y Despachos', tlx + TTL_W / 2, y + 14.8, { align: 'center' });

      // ── Code box ──────────────────────────────────────────────
      const cx = ML + LOGO_W + TTL_W;
      F(WHITE); FR(cx, y, CODE_W, HDR_H);
      D(HGRAY, 0.2); SR(cx, y, CODE_W, HDR_H);

      const codeRows: [string, string][] = [
        ['Código:',   'FMX-FM-VT-PD-01'],
        ['ID Pedido:', String(order.id)],
        ['Fecha:',    fmtDate(order.orderDate)],
        ['Página:',   '1 de 1'],
      ];
      const rowH4 = HDR_H / 4;
      codeRows.forEach(([lbl, val], i) => {
        if (i > 0) { D(HGRAY, 0.15); LN(cx, y + i * rowH4, cx + CODE_W, y + i * rowH4); }
        TC(DGR);  B(6.5); TX(lbl, cx + 2,  y + i * rowH4 + rowH4 * 0.7);
        TC(BLK);  N(6.5); TX(val, cx + 19, y + i * rowH4 + rowH4 * 0.7);
      });
      D(HGRAY, 0.1); LN(cx + 18, y, cx + 18, y + HDR_H);

      y += HDR_H;

      // ═════════════════════════════════════════════════════════════
      //  SECTION 2 — CLIENT + DISPATCHER INFO
      // ═════════════════════════════════════════════════════════════
      const INFO_H = 21;
      const CLI_W  = CW * 0.67;
      const DSP_W  = CW - CLI_W;
      const CLI_H  = 5;   // header strip height

      // — CLIENT panel —
      F(LBLU); FR(ML, y, CLI_W, CLI_H);
      D(HGRAY, 0.2); SR(ML, y, CLI_W, INFO_H);
      TC(NAVY); B(7); TX('CLIENTE', ML + CLI_W / 2, y + 3.6, { align: 'center' });

      // Three column sections in client
      const C3 = CLI_W / 3;
      const clientData: [string, string][][] = [
        [['Cliente:',      order.customerName],                 ['Fecha Pedido:', fmtDate(order.orderDate)], ['Departamento:', order.departmentName || '—']],
        [['Numeral:',      order.customerDocument],             ['Coordinador:', order.coordinatorName || '—'], ['Teléfono:',     order.phone || '—']],
        [['Ciudad:',       order.cityName || '—'],              ['Estado:', order.status],                          ['Dirección:',    order.address || '—']],
      ];
      let ry = y + CLI_H + 3.5;
      clientData.forEach(row => {
        row.forEach(([lbl, val], ci) => {
          TC(DGR); B(6); TX(lbl, ML + C3 * ci + 2, ry);
          TC(BLK); N(6);
          TX(clip(val, C3 - 18), ML + C3 * ci + 19, ry);
        });
        ry += 4.5;
      });
      // column dividers
      D(HGRAY, 0.1);
      LN(ML + C3,     y + CLI_H, ML + C3,     y + INFO_H);
      LN(ML + C3 * 2, y + CLI_H, ML + C3 * 2, y + INFO_H);

      // — DISPATCHER panel —
      const DX = ML + CLI_W;
      F(LBLU); FR(DX, y, DSP_W, CLI_H);
      D(HGRAY, 0.2); SR(DX, y, DSP_W, INFO_H);
      TC(NAVY); B(6.5); TX('DESPACHADOR / TRANSPORTE', DX + DSP_W / 2, y + 3.6, { align: 'center' });

      const dspRows: [string, string][] = [
        ['Despachador:',    order.dispatchUserName || '—'],
        ['Vehículo:',       order.dispatchVehicleNumber || '—'],
        ['Fecha Despacho:', order.dispatchDate ? order.dispatchDate.split('T')[0].replace(/-/g, '/') : '—'],
      ];
      let dr = y + CLI_H + 3.5;
      dspRows.forEach(([lbl, val]) => {
        TC(DGR); B(6); TX(lbl, DX + 2, dr);
        TC(BLK); N(6); TX(val, DX + 26, dr);
        dr += 3.6;
      });

      y += INFO_H;

      // ═════════════════════════════════════════════════════════════
      //  SECTION 3 — PRODUCT TABLE  (left) + DISPATCH TABLE (right)
      // ═════════════════════════════════════════════════════════════

      // — Column widths —
      const LW = Math.round(CW * 0.50);  // left panel
      const RW = CW - LW;                  // right panel
      const LX = ML;
      const RX = ML + LW;

      // Left columns: ITEM | DESC | PACA | BULTO | CAJA
      const LC_ITEM = 10;
      const LC_PAC  = 13;
      const LC_BLT  = 13;
      const LC_CAJ  = 13;
      const LC_DESC = LW - LC_ITEM - LC_PAC - LC_BLT - LC_CAJ;

      // Right columns: GRUPO | DESC | CANT | LOTE | OBS
      const RC_GRP  = 13;
      const RC_CNT  = 13;
      const RC_LOT  = 20;
      const RC_OBS  = 30;
      const RC_DESC = RW - RC_GRP - RC_CNT - RC_LOT - RC_OBS;

      // — Section title bars —
      F(NAVY); FR(LX, y, LW, 5); FR(RX, y, RW, 5);
      TC(WHITE); B(7.5);
      TX('DETALLE PRODUCTO', LX + LW / 2, y + 3.5, { align: 'center' });
      TX('DESPACHO',         RX + RW / 2, y + 3.5, { align: 'center' });
      y += 5;

      // — Column header row (9 mm tall) —
      const SHDR = 9;
      F(LGRAY); FR(LX, y, LW, SHDR); FR(RX, y, RW, SHDR);
      D(HGRAY, 0.2); SR(LX, y, LW, SHDR); SR(RX, y, RW, SHDR);

      // "CANTIDADES" super-header (top half, over PACA+BULTO+CAJA)
      const cantX = LX + LC_ITEM + LC_DESC;
      const cantW = LC_PAC + LC_BLT + LC_CAJ;
      F([185, 215, 240]); FR(cantX, y, cantW, SHDR / 2);
      D(HGRAY, 0.15); SR(cantX, y, cantW, SHDR / 2);
      TC(NAVY); B(5.5);
      TX('CANTIDADES', cantX + cantW / 2, y + SHDR / 4 + 1.2, { align: 'center' });

      // Left column labels
      TC(NAVY); B(6.5);
      TX('ITEM',         LX + LC_ITEM / 2,                               y + SHDR * 0.74 + 1.8, { align: 'center' });
      TX('DESCRIPCIÓN',  LX + LC_ITEM + LC_DESC / 2,                     y + SHDR * 0.74 + 1.8, { align: 'center' });
      TX('PACA',         cantX + LC_PAC / 2,                             y + SHDR * 0.74 + 1.8, { align: 'center' });
      TX('BULTO',        cantX + LC_PAC + LC_BLT / 2,                    y + SHDR * 0.74 + 1.8, { align: 'center' });
      TX('CAJA',         cantX + LC_PAC + LC_BLT + LC_CAJ / 2,           y + SHDR * 0.74 + 1.8, { align: 'center' });

      // Left column dividers
      D(HGRAY, 0.1);
      LN(LX + LC_ITEM, y, LX + LC_ITEM, y + SHDR);
      LN(cantX,           y + SHDR / 2, cantX,           y + SHDR);
      LN(cantX + LC_PAC,  y,            cantX + LC_PAC,  y + SHDR);
      LN(cantX + LC_PAC + LC_BLT, y, cantX + LC_PAC + LC_BLT, y + SHDR);

      // Right column labels
      TC(NAVY); B(6);
      const rcHdrs: [string, number][] = [
        ['GRUPO',            RC_GRP],
        ['DETALLE PRODUCTO', RC_DESC],
        ['CANT.',            RC_CNT],
        ['LOTE',             RC_LOT],
        ['OBSERVACIÓN',      RC_OBS],
      ];
      let rhx = RX;
      rcHdrs.forEach(([lbl, w], i) => {
        TC(NAVY); B(6);
        TX(lbl, rhx + w / 2, y + SHDR / 2 + 1.5, { align: 'center' });
        if (i > 0) { D(HGRAY, 0.1); LN(rhx, y, rhx, y + SHDR); }
        rhx += w;
      });

      y += SHDR;

      // ── Product rows ─────────────────────────────────────────
      const ROW_H = 4.0;
      const GS    = this.GROUP_SIZE;   // 5

      // We might need multiple pages; compute available height
      // Available for rows = PH - current_y - totals_row - gap - footer - sig - margin
      const FOOT_NEEDED = 5 + 2 + 28 + 3 + 14;   // totals + gap + summary + gap + sig

      const drawPageHeaders = () => {
        // Called when starting a new page; re-draws section title + col headers
        doc.addPage();
        y = MT;
        F(NAVY); FR(LX, y, LW, 5); FR(RX, y, RW, 5);
        TC(WHITE); B(7.5);
        TX('DETALLE PRODUCTO', LX + LW / 2, y + 3.5, { align: 'center' });
        TX('DESPACHO',         RX + RW / 2, y + 3.5, { align: 'center' });
        y += 5;
        F(LGRAY); FR(LX, y, LW, SHDR); FR(RX, y, RW, SHDR);
        D(HGRAY, 0.2); SR(LX, y, LW, SHDR); SR(RX, y, RW, SHDR);
        F([185, 215, 240]); FR(cantX, y, cantW, SHDR / 2);
        D(HGRAY, 0.15); SR(cantX, y, cantW, SHDR / 2);
        TC(NAVY); B(5.5); TX('CANTIDADES', cantX + cantW / 2, y + SHDR / 4 + 1.2, { align: 'center' });
        TC(NAVY); B(6.5);
        TX('ITEM',         LX + LC_ITEM / 2,                  y + SHDR * 0.74 + 1.8, { align: 'center' });
        TX('DESCRIPCIÓN',  LX + LC_ITEM + LC_DESC / 2,        y + SHDR * 0.74 + 1.8, { align: 'center' });
        TX('PACA',         cantX + LC_PAC / 2,                y + SHDR * 0.74 + 1.8, { align: 'center' });
        TX('BULTO',        cantX + LC_PAC + LC_BLT / 2,       y + SHDR * 0.74 + 1.8, { align: 'center' });
        TX('CAJA',         cantX + LC_PAC + LC_BLT + LC_CAJ / 2, y + SHDR * 0.74 + 1.8, { align: 'center' });
        D(HGRAY, 0.1);
        LN(LX + LC_ITEM, y, LX + LC_ITEM, y + SHDR);
        LN(cantX, y + SHDR / 2, cantX, y + SHDR);
        LN(cantX + LC_PAC, y, cantX + LC_PAC, y + SHDR);
        LN(cantX + LC_PAC + LC_BLT, y, cantX + LC_PAC + LC_BLT, y + SHDR);
        TC(NAVY); B(6);
        let rx2 = RX;
        rcHdrs.forEach(([lbl, w], i) => {
          TX(lbl, rx2 + w / 2, y + SHDR / 2 + 1.5, { align: 'center' });
          if (i > 0) { D(HGRAY, 0.1); LN(rx2, y, rx2, y + SHDR); }
          rx2 += w;
        });
        y += SHDR;
      };

      items.forEach((item: OrderDetailResponse, idx: number) => {
        // Page break check
        if (y + ROW_H > PH - MR - FOOT_NEEDED) {
          drawPageHeaders();
        }

        const gIdx   = Math.floor(idx / GS);
        const gColor = GCLR[gIdx % GCLR.length];
        const ty     = y + ROW_H - 1.1;  // text baseline within row
        const numQty = Number(item.quantity);

        // LEFT row
        F(gColor); FR(LX, y, LW, ROW_H);
        D(HGRAY, 0.08); SR(LX, y, LW, ROW_H);
        D(HGRAY, 0.08);
        LN(LX + LC_ITEM,                          y, LX + LC_ITEM,                         y + ROW_H);
        LN(LX + LC_ITEM + LC_DESC,                y, LX + LC_ITEM + LC_DESC,               y + ROW_H);
        LN(cantX + LC_PAC,                        y, cantX + LC_PAC,                       y + ROW_H);
        LN(cantX + LC_PAC + LC_BLT,               y, cantX + LC_PAC + LC_BLT,              y + ROW_H);

        const isPaca  = item.productType === 'PACA';
        const isBulto = !item.productType || item.productType === 'BULT' || item.productType === 'CANA';
        const isCaja  = item.productType === 'CAJA';
        TC(BLK); N(6);
        TX(String(idx + 1),         LX + LC_ITEM / 2,                                  ty, { align: 'center' });
        TX(clip(item.productName, LC_DESC - 2), LX + LC_ITEM + 1.5,                    ty);
        TX(isPaca  ? String(numQty) : '0',   cantX + LC_PAC / 2,                       ty, { align: 'center' });
        TX(isBulto ? String(numQty) : '0',   cantX + LC_PAC + LC_BLT / 2,              ty, { align: 'center' });
        TX(isCaja  ? String(numQty) : '0',   cantX + LC_PAC + LC_BLT + LC_CAJ / 2,     ty, { align: 'center' });

        // RIGHT row (DESPACHO)
        F([248, 248, 248]); FR(RX, y, RW, ROW_H);
        D(HGRAY, 0.08); SR(RX, y, RW, ROW_H);
        D(HGRAY, 0.08);
        LN(RX + RC_GRP,                   y, RX + RC_GRP,                   y + ROW_H);
        LN(RX + RC_GRP + RC_DESC,         y, RX + RC_GRP + RC_DESC,         y + ROW_H);
        LN(RX + RC_GRP + RC_DESC + RC_CNT, y, RX + RC_GRP + RC_DESC + RC_CNT, y + ROW_H);
        LN(RX + RC_GRP + RC_DESC + RC_CNT + RC_LOT, y, RX + RC_GRP + RC_DESC + RC_CNT + RC_LOT, y + ROW_H);

        // LEFT EMPTY FOR MANUAL FILL

        // RIGHT: detalle de producto (cómo se arruma el pedido)
        TC(BLK); N(6);
        const detalleArrume = item.detalleProducto;
        if (detalleArrume) {
          const arrumeLines = doc.splitTextToSize(detalleArrume, RC_DESC - 2);
          const maxLines = Math.max(1, Math.floor(ROW_H / 3.4));
          arrumeLines.slice(0, maxLines).forEach((ln: string, li: number) => {
            TX(clip(ln, RC_DESC - 2), RX + RC_GRP + 1.5, y + 2.8 + li * 3.2);
          });
        }

        // RIGHT: cantidad despachada (columna CANT.)
        const despachado = item.delivered;
        if (despachado != null && despachado !== 0) {
          TC(BLK); B(6.5);
          TX(String(despachado), RX + RC_GRP + RC_DESC + RC_CNT / 2, ty, { align: 'center' });
        }

        // RIGHT: lote del producto (columna LOTE)
        const loteProducto = item.lote;
        if (loteProducto) {
          TC(BLK); N(6);
          TX(clip(loteProducto, RC_LOT - 2), RX + RC_GRP + RC_DESC + RC_CNT + 1.5, ty);
        }

        // RIGHT: observaciones del despacho (columna OBSERVACIÓN)
        const obsDespacho = item.observations;
        if (obsDespacho) {
          TC(BLK); N(5.5);
          const obsLines = doc.splitTextToSize(obsDespacho, RC_OBS - 2);
          const obsMaxLines = Math.max(1, Math.floor(ROW_H / 3.0));
          obsLines.slice(0, obsMaxLines).forEach((ln: string, li: number) => {
            TX(clip(ln, RC_OBS - 2), RX + RC_GRP + RC_DESC + RC_CNT + RC_LOT + 1, y + 2.6 + li * 2.9);
          });
        }

        y += ROW_H;
      });

      // ── TOTALS ROW ──────────────────────────────────────────
      const totalPacasPDF  = items.filter(d => d.productType === 'PACA').reduce((s, d) => s + Number(d.quantity), 0);
      const totalBultosPDF = items.filter(d => !d.productType || d.productType === 'BULT' || d.productType === 'CANA').reduce((s, d) => s + Number(d.quantity), 0);
      const totalCajasPDF  = items.filter(d => d.productType === 'CAJA').reduce((s, d) => s + Number(d.quantity), 0);
      const TR_H = ROW_H + 1;
      F(NAVY); FR(LX, y, LW, TR_H); FR(RX, y, RW, TR_H);
      D(HGRAY, 0.15); SR(LX, y, LW, TR_H); SR(RX, y, RW, TR_H);
      TC(WHITE); B(7);
      const tty = y + TR_H - 1.2;
      TX('TOTALES',          LX + (LC_ITEM + LC_DESC) / 2,               tty, { align: 'center' });
      TX(String(totalPacasPDF),  cantX + LC_PAC / 2,                    tty, { align: 'center' });
      TX(String(totalBultosPDF), cantX + LC_PAC + LC_BLT / 2,           tty, { align: 'center' });
      TX(String(totalCajasPDF),  cantX + LC_PAC + LC_BLT + LC_CAJ / 2,  tty, { align: 'center' });

      y += TR_H + 2;

      // ═════════════════════════════════════════════════════════════
      //  SECTION 4 — SUMMARY  |  OBSERVATIONS  |  TRANSPORT
      // ═════════════════════════════════════════════════════════════
      const FOOT_H = 28;
      const S3W    = CW / 3;

      const makePanel = (px: number, title: string) => {
        F(LGRAY); FR(px, y, S3W, FOOT_H);
        D(HGRAY, 0.2); SR(px, y, S3W, FOOT_H);
        F(NAVY); FR(px, y, S3W, 5);
        TC(WHITE); B(6.5); TX(title, px + S3W / 2, y + 3.5, { align: 'center' });
      };

      // 1 – Resumen General
      makePanel(ML, 'RESUMEN GENERAL');
      const totalPesoKG  = items.reduce((s, d) => s + Number(d.pesoUnidad ?? 0) * Number(d.quantity), 0);
      const totalDimKG   = items.reduce((s, d) => s + Number(d.dimension ?? 0) * Number(d.quantity), 0);
      const totalUnidades  = items.reduce((s, d) => s + Number(d.quantity), 0);
      const sumData: [string, string][] = [
        ['TOTAL BULTOS:',    String(totalBultosPDF)],
        ['TOTAL CAJAS:',     String(totalCajasPDF)],
        ['TOTAL PACAS:',     String(totalPacasPDF)],
        ['TOTAL UNIDADES:',  String(totalUnidades)],
        ['PESO TOTAL (KG):', totalPesoKG.toFixed(3)],
        ['DIMENSIÓN TOTAL:', totalDimKG.toFixed(1)],
      ];
      let sy = y + 8.5;
      sumData.forEach(([lbl, val]) => {
        TC(BLK); B(6.5); TX(lbl, ML + 3, sy);
        B(7);           TX(val, ML + S3W - 4, sy, { align: 'right' });
        sy += 3.8;
      });

      // 2 – Observaciones
      makePanel(ML + S3W, 'OBSERVACIONES DEL PEDIDO');
      TC(BLK); N(6.5);
      const obsLines = doc.splitTextToSize(order.notes || '—', S3W - 6) as string[];
      doc.text(obsLines, ML + S3W + 3, y + 9);

      // 3 – Transporte
      makePanel(ML + S3W * 2, 'INFORMACIÓN DE TRANSPORTE');
      const dispatchDt = order.dispatchDate ? new Date(order.dispatchDate) : null;
      const trnData: [string, string][] = [
        ['CONDUCTOR:',      order.dispatchDriverName || '—'],
        ['DOCUMENTO:',      order.dispatchDriverDocument || '—'],
        ['TELÉFONO:',       order.dispatchDriverPhone || '—'],
        ['FECHA DESPACHO:', dispatchDt ? fmtDate(dispatchDt.toISOString()) : '—'],
        ['HORA DESPACHO:',  dispatchDt ? `${String(dispatchDt.getHours()).padStart(2, '0')}:${String(dispatchDt.getMinutes()).padStart(2, '0')}` : '—'],
      ];
      let tny = y + 8.5;
      trnData.forEach(([lbl, val]) => {
        TC(DGR); B(6); TX(lbl, ML + S3W * 2 + 3, tny);
        TC(BLK); N(6); TX(val, ML + S3W * 2 + 30, tny);
        tny += 3.1;
      });

      y += FOOT_H + 3;

      // ═════════════════════════════════════════════════════════════
      //  SECTION 5 — SIGNATURE FOOTER
      // ═════════════════════════════════════════════════════════════
      const SW = CW / 3;
      const sigTitles = ['ELABORÓ (COORDINADOR)', 'REVISÓ (DESPACHADOR)', 'RECIBIÓ (CONDUCTOR)'];

      D(HGRAY, 0.35);
      sigTitles.forEach((title, i) => {
        const sx = ML + SW * i;
        LN(sx + 5, y + 3, sx + SW - 5, y + 3);
        TC(NAVY); B(6.5); TX(title, sx + SW / 2, y + 7.5, { align: 'center' });
        TC(BLK);  N(6);   TX('—',    sx + SW / 2, y + 11.5, { align: 'center' });
      });

      // ── Save ──────────────────────────────────────────────────
      const fn = `ORDEN-PEDIDO-CARGUE-${order.orderNumber || order.id}-${fmtDate(order.orderDate).replace(/\//g, '-')}.pdf`;
      doc.save(fn);
    } catch {
      // PDF generation error — reset flag so user can retry
    }
    this.pdfGenerating.set(false);
  }
}