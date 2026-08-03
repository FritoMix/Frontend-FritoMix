import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative flex-1 max-w-xl">
      <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      <input
        type="text"
        [ngModel]="value()"
        (ngModelChange)="onChange($event)"
        [placeholder]="placeholder()"
        class="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
      />
    </div>
  `,
})
export class SearchInputComponent {
  value = signal<string>('');
  placeholder = input<string>('Buscar...');
  valueChange = output<string>();

  onChange(value: string) {
    this.value.set(value);
    this.valueChange.emit(value);
  }
}
