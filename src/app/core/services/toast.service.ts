import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  private counter = 0;

  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string, type: 'success' | 'error' = 'success', duration = 4000) {
    const id = ++this.counter;
    this.toastsSignal.update(list => [...list, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error', 6000);
  }

  dismiss(id: number) {
    this.toastsSignal.update(list => list.filter(t => t.id !== id));
  }
}
