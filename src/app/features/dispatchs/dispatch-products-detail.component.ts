import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DispatchPreviewItem } from '../../core/models/dispatch.model';

@Component({
  selector: 'app-dispatch-products-detail',
  standalone: true,
  imports: [FormsModule],
  templateUrl: 'dispatch-products-detail.component.html'
})
export class DispatchProductsDetailComponent {
  items = input<DispatchPreviewItem[]>([]);
  isMulti = input(false);
  delivered = model<Record<number, number>>({});
  observations = model<Record<number, string>>({});

  onDeliveredChange(productId: number, value: any) {
    this.delivered.update(map => ({ ...map, [productId]: Number(value) }));
  }

  onObservationChange(productId: number, value: string) {
    this.observations.update(map => ({ ...map, [productId]: value }));
  }
}