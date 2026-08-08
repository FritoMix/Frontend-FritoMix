import { Component, input, model, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="fm-pagination">
      <div class="fm-pagination__info">
        Página <span class="font-semibold text-[#071938]">{{ currentPage() }}</span> de <span class="font-semibold text-[#071938]">{{ totalPages() }}</span>
      </div>
      <div class="fm-pagination__controls">
        <button class="fm-page-btn" [disabled]="currentPage() === 1" (click)="currentPage.set(currentPage() - 1)" aria-label="Página anterior">&lsaquo;</button>
        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="px-2 text-gray-400 text-sm">…</span>
          } @else {
            <button class="fm-page-btn" [class.fm-page-btn--active]="page === currentPage()" (click)="currentPage.set(page)">{{ page }}</button>
          }
        }
        <button class="fm-page-btn" [disabled]="currentPage() === totalPages()" (click)="currentPage.set(currentPage() + 1)" aria-label="Página siguiente">&rsaquo;</button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  totalPages = input.required<number>();
  currentPage = model(1);

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  });
}
