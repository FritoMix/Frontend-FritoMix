import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: 'confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  title = input('Confirmar acción');
  message = input('');
  confirmLabel = input('Confirmar');
  cancelLabel = input('Cancelar');
  type = input<'info' | 'danger'>('info');
  singleButton = input(false);
  confirmed = output<void>();
  cancelled = output<void>();

  isDanger = computed(() => this.type() === 'danger');

  confirmClasses = computed(() => this.isDanger()
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-[#0055FF] hover:bg-[#0044DD]');
}
