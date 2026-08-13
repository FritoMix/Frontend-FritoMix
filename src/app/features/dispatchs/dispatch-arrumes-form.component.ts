import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateArrumeRequest } from '../../core/models/dispatch.model';

@Component({
  selector: 'app-dispatch-arrumes-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: 'dispatch-arrumes-form.component.html'
})
export class DispatchArrumesFormComponent {
  arrumes = model<CreateArrumeRequest[]>([]);

  addArrume() {
    this.arrumes.update(list => [...list, { numArrume: null, arrumeProducto: '', cantidad: null, lote: '' }]);
  }

  removeArrume(i: number) {
    this.arrumes.update(list => list.filter((_, idx) => idx !== i));
  }
}