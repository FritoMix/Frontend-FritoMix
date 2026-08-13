import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: 'search-input.component.html',
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
