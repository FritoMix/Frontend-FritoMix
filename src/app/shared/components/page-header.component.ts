import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: 'page-header.component.html',
})
export class PageHeaderComponent {
  title = input.required<string>();
  badge = input<string>('');
  color = input<'blue' | 'green' | 'purple' | 'amber'>('blue');
  subtitle = input<string>('');

  hasBadge = computed(() => this.badge() && this.badge().length > 0);
}
