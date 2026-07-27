import { Injectable, signal, computed } from '@angular/core';
import { InventoryMovement } from '../models/inventory-movement.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  movements = signal<InventoryMovement[]>([
    {
      id: '1',
      movementNumber: 'MOV-EN-0001',
      movementDate: '2026-07-15',
      movementTime: '07:30',
      movementType: 'ENTRADA',
      referenceDocument: 'RC-2026-0100',
      referenceType: 'Recepción de Compra',
      productCode: 'PR-101',
      productDescription: 'TRADICIONAL SURT MIX X 250 UND',
      quantity: 500,
      unitValue: 9900,
      totalValue: 4950000,
      lotCode: 'LOT-107',
      warehouse: 'Bodega Principal',
      responsible: 'Andrés Producción',
      observations: 'Recepción orden de compra OC-2026-0089'
    },
    {
      id: '2',
      movementNumber: 'MOV-SA-0001',
      movementDate: '2026-07-15',
      movementTime: '08:45',
      movementType: 'SALIDA',
      referenceDocument: 'PED-00010',
      referenceType: 'Despacho Venta',
      productCode: 'PR-101',
      productDescription: 'TRADICIONAL SURT MIX X 250 UND',
      quantity: 288,
      unitValue: 9800,
      totalValue: 2822400,
      lotCode: 'LOT-101',
      warehouse: 'Bodega Principal',
      responsible: 'Diana Despacho',
      observations: 'Pedido PED-00010 - Sandra Sáenz'
    },
    {
      id: '3',
      movementNumber: 'MOV-SA-0002',
      movementDate: '2026-07-15',
      movementTime: '08:50',
      movementType: 'SALIDA',
      referenceDocument: 'PED-00010',
      referenceType: 'Despacho Venta',
      productCode: 'PR-102',
      productDescription: 'LENTEJA CRIOLLA 500 G Bx24',
      quantity: 200,
      unitValue: 6200,
      totalValue: 1240000,
      lotCode: 'LOT-102',
      warehouse: 'Bodega Principal',
      responsible: 'Diana Despacho'
    },
    {
      id: '4',
      movementNumber: 'MOV-SA-0003',
      movementDate: '2026-07-15',
      movementTime: '08:55',
      movementType: 'SALIDA',
      referenceDocument: 'PED-00010',
      referenceType: 'Despacho Venta',
      productCode: 'PR-105',
      productDescription: 'MANÍ SALADO JUMBO 150 G Bx50',
      quantity: 450,
      unitValue: 3200,
      totalValue: 1440000,
      lotCode: 'LOT-105',
      warehouse: 'Bodega Principal',
      responsible: 'Diana Despacho'
    },
    {
      id: '5',
      movementNumber: 'MOV-EN-0002',
      movementDate: '2026-07-16',
      movementTime: '06:15',
      movementType: 'ENTRADA',
      referenceDocument: 'AJ-2026-0012',
      referenceType: 'Ajuste Inventario',
      productCode: 'PR-104',
      productDescription: 'MAÍZ PIRA TOSTADO 250 G Bx40',
      quantity: 25,
      unitValue: 4800,
      totalValue: 120000,
      lotCode: 'LOT-104',
      warehouse: 'Bodega Principal',
      responsible: 'Andrés Producción',
      observations: 'Conteo físico - diferencia positiva'
    },
    {
      id: '6',
      movementNumber: 'MOV-SA-0004',
      movementDate: '2026-07-16',
      movementTime: '09:30',
      movementType: 'SALIDA',
      referenceDocument: 'PED-00011',
      referenceType: 'Despacho Venta',
      productCode: 'PR-103',
      productDescription: 'ALMENDRA HOLLADA 250 G Bx30',
      quantity: 840,
      unitValue: 11200,
      totalValue: 9408000,
      lotCode: 'LOT-103',
      warehouse: 'Bodega Principal',
      responsible: 'Diana Despacho'
    },
    {
      id: '7',
      movementNumber: 'MOV-SA-0005',
      movementDate: '2026-07-16',
      movementTime: '09:35',
      movementType: 'SALIDA',
      referenceDocument: 'PED-00011',
      referenceType: 'Despacho Venta',
      productCode: 'PR-104',
      productDescription: 'MAÍZ PIRA TOSTADO 250 G Bx40',
      quantity: 720,
      unitValue: 4800,
      totalValue: 3456000,
      lotCode: 'LOT-104',
      warehouse: 'Bodega Principal',
      responsible: 'Diana Despacho'
    },
    {
      id: '8',
      movementNumber: 'MOV-EN-0003',
      movementDate: '2026-07-17',
      movementTime: '08:00',
      movementType: 'ENTRADA',
      referenceDocument: 'RC-2026-0102',
      referenceType: 'Recepción de Compra',
      productCode: 'PR-102',
      productDescription: 'LENTEJA CRIOLLA 500 G Bx24',
      quantity: 2000,
      unitValue: 6300,
      totalValue: 12600000,
      lotCode: 'LOT-108',
      warehouse: 'Bodega Principal',
      responsible: 'Andrés Producción',
      observations: 'Recepción lote nuevo'
    },
    {
      id: '9',
      movementNumber: 'MOV-SA-0006',
      movementDate: '2026-07-17',
      movementTime: '08:30',
      movementType: 'SALIDA',
      referenceDocument: 'PED-00012',
      referenceType: 'Despacho Venta',
      productCode: 'PR-105',
      productDescription: 'MANÍ SALADO JUMBO 150 G Bx50',
      quantity: 1000,
      unitValue: 3200,
      totalValue: 3200000,
      lotCode: 'LOT-105',
      warehouse: 'Bodega Principal',
      responsible: 'Sofía Pedidos'
    },
    {
      id: '10',
      movementNumber: 'MOV-SA-0007',
      movementDate: '2026-07-18',
      movementTime: '10:20',
      movementType: 'SALIDA',
      referenceDocument: 'DES-003',
      referenceType: 'Devolución Cliente',
      productCode: 'PR-106',
      productDescription: 'NACHO PICANTE 200G X30 UND',
      quantity: 60,
      unitValue: 7400,
      totalValue: 444000,
      lotCode: 'LOT-106',
      warehouse: 'Bodega Devoluciones',
      responsible: 'Andrés Producción',
      observations: 'Producto devuelto por empaque dañado'
    },
    {
      id: '11',
      movementNumber: 'MOV-EN-0004',
      movementDate: '2026-07-19',
      movementTime: '11:45',
      movementType: 'ENTRADA',
      referenceDocument: 'TR-2026-0008',
      referenceType: 'Transferencia Bodega',
      productCode: 'PR-104',
      productDescription: 'MAÍZ PIRA TOSTADO 250 G Bx40',
      quantity: 300,
      unitValue: 4800,
      totalValue: 1440000,
      lotCode: 'LOT-104',
      warehouse: 'Bodega Secundaria',
      responsible: 'Andrés Producción',
      observations: 'Transferencia a bodega de Cali'
    },
    {
      id: '12',
      movementNumber: 'MOV-SA-0008',
      movementDate: '2026-07-20',
      movementTime: '08:15',
      movementType: 'SALIDA',
      referenceDocument: 'PED-00015',
      referenceType: 'Despacho Venta',
      productCode: 'PR-103',
      productDescription: 'ALMENDRA HOLLADA 250 G Bx30',
      quantity: 660,
      unitValue: 11200,
      totalValue: 7392000,
      lotCode: 'LOT-103',
      warehouse: 'Bodega Principal',
      responsible: 'Diana Despacho',
      observations: 'Pedido PED-00015'
    }
  ]);

  searchTerm = signal<string>('');

  filteredMovements = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.movements();
    return this.movements().filter(m =>
      m.movementNumber.toLowerCase().includes(term) ||
      m.productCode.toLowerCase().includes(term) ||
      m.productDescription.toLowerCase().includes(term) ||
      m.movementType.toLowerCase().includes(term) ||
      m.referenceDocument.toLowerCase().includes(term)
    );
  });

  addMovement(newMovement: Omit<InventoryMovement, 'id'>) {
    const id = (this.movements().length + 1).toString();
    this.movements.update(list => [{ ...newMovement, id }, ...list]);
  }
}
