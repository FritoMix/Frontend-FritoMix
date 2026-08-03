import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <span class="module-badge module-badge--{{ color() }}">{{ badge() }}</span>
        <h1 class="text-2xl font-extrabold text-[#071938]">{{ title() }}</h1>
      </div>
      @if (subtitle()) {
        <p class="text-sm text-gray-500 pl-1">{{ subtitle() }}</p>
      }
    </div>
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
  badge = input<string>('');
  color = input<'blue' | 'green' | 'purple' | 'amber'>('blue');
  subtitle = input<string>('');
}
