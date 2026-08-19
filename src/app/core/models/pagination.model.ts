export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export function clampPage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 0;
  return Math.max(0, Math.min(page, totalPages - 1));
}