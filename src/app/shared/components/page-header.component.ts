import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1 min-h-[2rem]">
        @if (hasBadge()) {
          <span class="module-badge module-badge--{{ color() }}">{{ badge() }}</span>
        }
        <h1 class="text-xl sm:text-2xl font-extrabold text-[#071938] leading-tight">{{ title() }}</h1>
      </div>
      @if (subtitle()) {
        <p class="text-sm text-gray-500 mt-1" [class.pl-[3.5rem]]="hasBadge()">{{ subtitle() }}</p>
      }
    </div>
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
  badge = input<string>('');
  color = input<'blue' | 'green' | 'purple' | 'amber'>('blue');
  subtitle = input<string>('');

  hasBadge = computed(() => this.badge() && this.badge().length > 0);
}
