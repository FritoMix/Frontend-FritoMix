import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject, signal } from '@angular/core';
import { PageResponse, clampPage } from '../models/pagination.model';

export abstract class BaseCrudService<TResponse, TDisplay, TCreate = never, TUpdate = never> {
  protected readonly http = inject(HttpClient);
  protected abstract readonly apiUrl: string;

  protected itemsSignal = signal<TDisplay[]>([]);
  readonly items = this.itemsSignal.asReadonly();
  loading = signal(false);

  searchTerm = signal<string>('');
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);
  totalPages = signal(0);

  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  setSearchTerm(value: string): void {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this.searchTerm.set(value.trim());
      this.currentPage.set(0);
      this.load();
    }, 300);
  }

  setPage(page: number): void {
    const clamped = clampPage(page, this.totalPages());
    if (clamped === this.currentPage()) return;
    this.currentPage.set(clamped);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    let params = new HttpParams()
      .set('page', this.currentPage())
      .set('size', this.pageSize());
    const term = this.searchTerm();
    if (term) params = params.set('search', term);
    this.http.get<PageResponse<TResponse>>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        if (res.content.length === 0 && res.page > 0 && res.totalElements > 0) {
          this.currentPage.set(res.page - 1);
          this.load();
          return;
        }
        this.itemsSignal.set(res.content.map((item) => this.toDisplay(item)));
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.onLoadError();
      },
    });
  }

  protected onLoadError(): void {
    // Hook para que las subclases reaccionen a errores de carga.
  }

  loadAll(): void {
    const params = new HttpParams().set('page', 0).set('size', 10000);
    this.http.get<PageResponse<TResponse>>(this.apiUrl, { params }).subscribe({
      next: (res) => this.itemsSignal.set(res.content.map((item) => this.toDisplay(item))),
      error: () => undefined,
    });
  }

  findById(id: number): Observable<TResponse> {
    return this.http.get<TResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: TCreate): Observable<TResponse> {
    return this.http.post<TResponse>(this.apiUrl, data);
  }

  update(id: number, data: TUpdate): Observable<TResponse> {
    return this.http.put<TResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  protected abstract toDisplay(item: TResponse): TDisplay;
}