import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { OrderPdfService } from './order-pdf.service';
import { OrderResponse } from '../../core/models/order.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogComponent],
  templateUrl: 'order-detail.component.html'
})
export class OrderDetailComponent implements OnInit {
  private orderService = inject(OrderService);
  private route       = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private pdfService  = inject(OrderPdfService);

  loading       = signal(true);
  pdfGenerating  = signal(false);
  order         = signal<OrderResponse | null>(null);

  confirmDialog = signal<{ title: string; message: string; confirmLabel: string; type: 'info' | 'danger'; status: 'APROBADO' | 'CANCELADO' } | null>(null);

  isCartera(): boolean {
    return this.authService.currentUser()?.role === 'cartera';
  }

  openConfirm(status: 'APROBADO' | 'CANCELADO') {
    const isApprove = status === 'APROBADO';
    this.confirmDialog.set({
      title: isApprove ? 'Aprobar pedido' : 'Cancelar pedido',
      message: isApprove ? '¿Está seguro de aprobar este pedido?' : '¿Está seguro de cancelar este pedido?',
      confirmLabel: isApprove ? 'Aprobar' : 'Cancelar',
      type: isApprove ? 'info' : 'danger',
      status
    });
  }

  closeConfirm() {
    this.confirmDialog.set(null);
  }

  changeStatus(status: 'APROBADO' | 'CANCELADO') {
    const id = this.order()?.id;
    if (!id) return;
    this.orderService.updateStatus(id, status).subscribe({
      next: (res) => {
        this.order.set(res);
        this.toastService.success(status === 'APROBADO' ? 'Pedido aprobado exitosamente.' : 'Pedido cancelado.');
      },
      error: (err) => this.toastService.error(err.error?.message || err.error?.error || 'Error al cambiar el estado del pedido.')
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

  async generatePDF() {
    const order = this.order();
    if (!order || this.pdfGenerating()) return;
    this.pdfGenerating.set(true);
    try {
      await this.pdfService.generateOrderPdf(order);
    } catch {
      // PDF generation error — reset flag so user can retry
    }
    this.pdfGenerating.set(false);
  }
}
