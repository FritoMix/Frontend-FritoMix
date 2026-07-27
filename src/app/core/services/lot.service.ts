import { Injectable, signal, computed } from '@angular/core';
import { Lot } from '../models/lot.model';

@Injectable({
  providedIn: 'root'
})
export class LotService {
  lots = signal<Lot[]>([
    {
      id: '1',
      code: 'LOT-101',
      productCode: 'PR-101',
      productDescription: 'TRADICIONAL SURT MIX X 250 UND',
      supplier: 'DISTRIBUIDORA DE SNACKS S.A.S.',
      receptionDate: '2026-01-15',
      manufacturingDate: '2026-01-10',
      expirationDate: '2026-07-10',
      quantityReceived: 2500,
      quantityAvailable: 450,
      unitCost: 9800,
      location: 'A-01-03',
      status: 'AGOTADO'
    },
    {
      id: '2',
      code: 'LOT-102',
      productCode: 'PR-102',
      productDescription: 'LENTEJA CRIOLLA 500 G Bx24',
      supplier: 'AGROEXPORTADORES DEL TOLIMA',
      receptionDate: '2026-02-20',
      manufacturingDate: '2026-02-15',
      expirationDate: '2026-08-15',
      quantityReceived: 1800,
      quantityAvailable: 620,
      unitCost: 6200,
      location: 'A-02-01',
      status: 'ACTIVO'
    },
    {
      id: '3',
      code: 'LOT-103',
      productCode: 'PR-103',
      productDescription: 'ALMENDRA HOLLADA 250 G Bx30',
      supplier: 'FRUTOS SECOS IMPORTADOS S.A.',
      receptionDate: '2026-03-05',
      manufacturingDate: '2026-02-28',
      expirationDate: '2026-09-28',
      quantityReceived: 1200,
      quantityAvailable: 380,
      unitCost: 11200,
      location: 'B-01-02',
      status: 'ACTIVO',
      observations: 'Producto importado de EE.UU.'
    },
    {
      id: '4',
      code: 'LOT-104',
      productCode: 'PR-104',
      productDescription: 'MAÍZ PIRA TOSTADO 250 G Bx40',
      supplier: 'MAICIPIOS DE COLOMBIA S.A.S.',
      receptionDate: '2026-04-10',
      manufacturingDate: '2026-04-05',
      expirationDate: '2026-10-05',
      quantityReceived: 3200,
      quantityAvailable: 1580,
      unitCost: 4800,
      location: 'B-02-04',
      status: 'ACTIVO'
    },
    {
      id: '5',
      code: 'LOT-105',
      productCode: 'PR-105',
      productDescription: 'MANÍ SALADO JUMBO 150 G Bx50',
      supplier: 'MANICEROS UNIDOS DEL CARIBE',
      receptionDate: '2026-05-12',
      manufacturingDate: '2026-05-08',
      expirationDate: '2026-11-08',
      quantityReceived: 4500,
      quantityAvailable: 2340,
      unitCost: 3200,
      location: 'C-01-01',
      status: 'ACTIVO'
    },
    {
      id: '6',
      code: 'LOT-106',
      productCode: 'PR-106',
      productDescription: 'NACHO PICANTE 200G X30 UND',
      supplier: 'PROCESADORA DE MAÍZ S.A.',
      receptionDate: '2026-06-01',
      manufacturingDate: '2026-05-28',
      expirationDate: '2026-12-28',
      quantityReceived: 2800,
      quantityAvailable: 1120,
      unitCost: 7400,
      location: 'C-02-03',
      status: 'RESERVADO',
      observations: 'Reservado para pedidos PED-00011 y PED-00016'
    },
    {
      id: '7',
      code: 'LOT-107',
      productCode: 'PR-101',
      productDescription: 'TRADICIONAL SURT MIX X 250 UND',
      supplier: 'DISTRIBUIDORA DE SNACKS S.A.S.',
      receptionDate: '2026-07-01',
      manufacturingDate: '2026-06-28',
      expirationDate: '2027-01-28',
      quantityReceived: 3000,
      quantityAvailable: 3000,
      unitCost: 9900,
      location: 'A-01-05',
      status: 'ACTIVO'
    },
    {
      id: '8',
      code: 'LOT-108',
      productCode: 'PR-102',
      productDescription: 'LENTEJA CRIOLLA 500 G Bx24',
      supplier: 'AGROEXPORTADORES DEL TOLIMA',
      receptionDate: '2026-07-10',
      manufacturingDate: '2026-07-05',
      expirationDate: '2027-01-05',
      quantityReceived: 2000,
      quantityAvailable: 1980,
      unitCost: 6300,
      location: 'A-02-02',
      status: 'ACTIVO',
      observations: 'Recepción reciente, en control de calidad'
    }
  ]);

  searchTerm = signal<string>('');

  filteredLots = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.lots();
    return this.lots().filter(l =>
      l.code.toLowerCase().includes(term) ||
      l.productCode.toLowerCase().includes(term) ||
      l.productDescription.toLowerCase().includes(term) ||
      l.supplier.toLowerCase().includes(term) ||
      l.status.toLowerCase().includes(term)
    );
  });

  addLot(newLot: Omit<Lot, 'id'>) {
    const id = (this.lots().length + 1).toString();
    this.lots.update(list => [{ ...newLot, id }, ...list]);
  }
}
