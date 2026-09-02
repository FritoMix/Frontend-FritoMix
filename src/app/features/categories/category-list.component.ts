import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CategoryGroupDTO } from '../../core/models/product.model';

interface EditableGroup extends CategoryGroupDTO {
  expanded: boolean;
}

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, PageHeaderComponent],
  templateUrl: 'category-list.component.html'
})
export class CategoryListComponent implements OnInit {
  productService = inject(ProductService);
  toastService = inject(ToastService);

  groups = signal<EditableGroup[]>([]);
  loading = signal(true);

  showCreateGroup = false;
  newGroupName = '';
  newGroupDesc = '';
  submitting = false;

  newCatNames = signal<Record<number, string>>({});
  newCatShow = signal<Record<number, boolean>>({});

  editingName = signal<Record<number, string>>({});
  editingDesc = signal<Record<number, string>>({});

  deleteTarget = signal<{ id: number; name: string; isGroup: boolean } | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.productService.getCategories().subscribe({
      next: (res) => {
        this.groups.set(res.map((g) => ({ ...g, expanded: true })));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleGroup(g: EditableGroup) {
    g.expanded = !g.expanded;
  }

  createGroup() {
    const name = this.newGroupName.trim();
    if (!name || this.submitting) return;
    this.submitting = true;
    this.productService.createGroup({ name, description: this.newGroupDesc.trim() || undefined }).subscribe({
      next: () => {
        this.submitting = false;
        this.showCreateGroup = false;
        this.newGroupName = '';
        this.newGroupDesc = '';
        this.toastService.success('Grupo creado exitosamente.');
        this.load();
      },
      error: (err) => {
        this.submitting = false;
        this.toastService.error(err.error?.message || err.error?.error || 'Error al crear el grupo.');
      },
    });
  }

  showNewCat(groupId: number) {
    this.newCatShow.update((m) => ({ ...m, [groupId]: true }));
    this.newCatNames.update((m) => ({ ...m, [groupId]: '' }));
  }

  hideNewCat(groupId: number) {
    this.newCatShow.update((m) => ({ ...m, [groupId]: false }));
  }

  createCategory(groupId: number) {
    const name = (this.newCatNames()[groupId] || '').trim();
    if (!name || this.submitting) return;
    this.submitting = true;
    this.productService.createCategory({ name, parentId: groupId }).subscribe({
      next: () => {
        this.submitting = false;
        this.hideNewCat(groupId);
        this.toastService.success('Categoría creada exitosamente.');
        this.load();
      },
      error: (err) => {
        this.submitting = false;
        this.toastService.error(err.error?.message || err.error?.error || 'Error al crear la categoría.');
      },
    });
  }

  startEdit(id: number, name: string, description: string | null) {
    this.editingName.update((m) => ({ ...m, [id]: name }));
    this.editingDesc.update((m) => ({ ...m, [id]: description || '' }));
  }

  saveEdit(item: { id: number; name: string; description: string | null; parentId?: number | null }, isGroup: boolean) {
    const name = (this.editingName()[item.id] || '').trim();
    if (!name || this.submitting) return;
    this.submitting = true;
    const desc = (this.editingDesc()[item.id] || '').trim() || undefined;
    this.productService.updateCategory(item.id, { name, description: desc, parentId: item.parentId }).subscribe({
      next: () => {
        this.submitting = false;
        this.toastService.success(isGroup ? 'Grupo actualizado exitosamente.' : 'Categoría actualizada exitosamente.');
        this.cancelEdit(item.id);
        this.load();
      },
      error: (err) => {
        this.submitting = false;
        this.toastService.error(err.error?.message || err.error?.error || 'Error al actualizar.');
      },
    });
  }

  cancelEdit(id: number) {
    this.editingName.update((m) => {
      const n = { ...m };
      delete n[id];
      return n;
    });
    this.editingDesc.update((m) => {
      const n = { ...m };
      delete n[id];
      return n;
    });
  }

  askDelete(item: { id: number; name: string; isGroup: boolean }) {
    this.deleteTarget.set(item);
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.productService.deleteCategory(target.id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.toastService.success(target.isGroup ? 'Grupo eliminado.' : 'Categoría eliminada.');
        this.load();
      },
      error: (err) => {
        this.deleteTarget.set(null);
        this.toastService.error(err.error?.message || err.error?.error || 'Error al eliminar.');
      },
    });
  }

  cancelDelete() {
    this.deleteTarget.set(null);
  }
}
