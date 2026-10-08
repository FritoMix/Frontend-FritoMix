import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DashboardService, DashboardData } from '../../core/services/dashboard.service';
import { orderStatusColor, orderStatusLabel, orderStatusClass } from '../orders/order-status';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);

  data = signal<DashboardData | null>(null);
  loading = signal(true);
  hasError = signal(false);

  private subs: Subscription[] = [];

  ngOnInit() {
    this.loadDashboard();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.subs = [];
  }

  loadDashboard() {
    this.loading.set(true);
    this.hasError.set(false);

    const sub = this.dashboardService.load().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.hasError.set(true);
      },
    });
    this.subs.push(sub);
  }

  monthlyBars = computed(() => {
    const sales = this.data()?.monthlySales ?? [];
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const maxCount = Math.max(...sales.map(s => s.count || 0), 1);
    return months.map((m, index) => {
      const found = sales.find(s => s.month === m);
      const count = found ? found.count : 0;
      let percent = 4;
      if (count > 0) {
        percent = Math.max(Math.round((count / maxCount) * 100), 15);
      }
      const isMax = count > 0 && count === maxCount;
      return {
        month: m,
        count,
        percent,
        isMax,
        delayMs: index * 40
      };
    });
  });

  ordersByStatus = computed(() => {
    return this.data()?.ordersByStatus ?? [];
  });

  totalOrdersCount = computed(() => {
    return this.ordersByStatus().reduce((sum, item) => sum + item.count, 0);
  });


  donutConic = computed(() => {
    const items = this.ordersByStatus();
    const total = items.reduce((s, i) => s + i.count, 0) || 1;
    let degrees = 0;
    const parts: string[] = [];
    items.forEach((item) => {
      const pct = (item.count / total) * 360;
      const color = this.statusColor(item.status);
      parts.push(`${color} ${degrees}deg ${degrees + pct}deg`);
      degrees += pct;
    });
    return `conic-gradient(${parts.join(', ')})`;
  });

  statusColor(status: string): string {
    return orderStatusColor(status);
  }

  statusLabel(status: string): string {
    return orderStatusLabel(status);
  }

  statusBadgeClass(status: string): string {
    return orderStatusClass(status);
  }
}
