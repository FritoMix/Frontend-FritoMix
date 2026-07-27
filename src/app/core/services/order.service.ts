import { Injectable, signal, computed } from '@angular/core';
import { Order, OrderStatus } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  orders = signal<Order[]>([
    {
      id: '1',
      orderNumber: 'PED-00010',
      documentCode: 'REM-FR-2026-0010',
      version: '1.0',
      date: '2026-07-15',
      page: '1 de 1',
      clientName: 'IBAGUÉ - SANDRA SAENZ',
      numeral: 'C-966',
      city: 'IBAGUÉ',
      department: 'TOLIMA',
      phone: '300 123 4567',
      address: 'CRA 5 # 21 - 45 B/ CENTRO',
      coordinatorName: 'Luis Coordinador',
      dispatcherName: 'Diana Despacho',
      auxProduction: 'Andrés Producción',
      vehicle: 'ABC-123',
      lotGeneral: 'LOTE-G-001',
      driverName: 'Carlos Alberto Ramírez',
      driverDocument: '1.234.567.890',
      driverPhone: '310 987 6543',
      dispatchDate: '2026-07-15',
      dispatchTime: '08:30',
      status: 'ENTREGADO',
      items: [
        { item: 1, description: 'TRADICIONAL SURT MIX X 250 UND', bulto: 2, caja: 24, dcho: 12, group: 1, lot: 'LOT-101' },
        { item: 2, description: 'LENTEJA CRIOLLA 500 G Bx24', bulto: 1, caja: 20, dcho: 10, group: 1, lot: 'LOT-102' },
        { item: 3, description: 'MANÍ SALADO JUMBO 150 G Bx50', bulto: 3, caja: 30, dcho: 15, group: 1, lot: 'LOT-105' }
      ],
      totalBultos: 6,
      totalCajas: 74,
      totalUnidades: 1788,
      pesoTotalKg: 432.5,
      observations: 'Entregar en recepción, llamar antes de llegar'
    },
    {
      id: '2',
      orderNumber: 'PED-00011',
      documentCode: 'REM-FR-2026-0011',
      version: '1.0',
      date: '2026-07-16',
      page: '1 de 1',
      clientName: 'SUPERMERCADO LA 14',
      numeral: 'C-032',
      city: 'IBAGUÉ',
      department: 'TOLIMA',
      phone: '319 456 7890',
      address: 'CALLE 14 # 8-30',
      coordinatorName: 'Luis Coordinador',
      dispatcherName: 'Diana Despacho',
      auxProduction: 'Sofía Pedidos',
      vehicle: 'AAB-456',
      lotGeneral: 'LOTE-G-002',
      driverName: 'José Hernán Patiño',
      driverDocument: '2.345.678.901',
      driverPhone: '311 876 5432',
      dispatchDate: '2026-07-16',
      dispatchTime: '09:15',
      status: 'DESPACHADO',
      items: [
        { item: 1, description: 'ALMENDRA HOLLADA 250 G Bx30', bulto: 4, caja: 28, dcho: 14, group: 1, lot: 'LOT-103' },
        { item: 2, description: 'MAÍZ PIRA TOSTADO 250 G Bx40', bulto: 2, caja: 36, dcho: 18, group: 1, lot: 'LOT-104' },
        { item: 3, description: 'NACHO PICANTE 200G X30 UND', bulto: 3, caja: 25, dcho: 12, group: 2, lot: 'LOT-106' },
        { item: 4, description: 'TRADICIONAL SURT MIX X 250 UND', bulto: 1, caja: 15, dcho: 8, group: 2, lot: 'LOT-101' }
      ],
      totalBultos: 10,
      totalCajas: 104,
      totalUnidades: 2780,
      pesoTotalKg: 624.0,
      observations: 'Pedido para promoción de fin de semana'
    },
    {
      id: '3',
      orderNumber: 'PED-00012',
      documentCode: 'REM-FR-2026-0012',
      version: '1.0',
      date: '2026-07-17',
      page: '1 de 1',
      clientName: 'TIENDA EL AHORRO',
      numeral: 'C-048',
      city: 'IBAGUÉ',
      department: 'TOLIMA',
      phone: '320 654 3210',
      address: 'AV. AMBALA # 45-12',
      coordinatorName: 'Luis Coordinador',
      dispatcherName: 'Sofía Pedidos',
      auxProduction: 'Andrés Producción',
      vehicle: 'AAC-789',
      lotGeneral: 'LOTE-G-003',
      driverName: 'Edison Stiven Muñoz',
      driverDocument: '3.456.789.012',
      driverPhone: '312 765 4321',
      dispatchDate: '2026-07-17',
      dispatchTime: '07:45',
      status: 'EN PREPARACIÓN',
      items: [
        { item: 1, description: 'MANÍ SALADO JUMBO 150 G Bx50', bulto: 2, caja: 40, dcho: 20, group: 1, lot: 'LOT-105' },
        { item: 2, description: 'LENTEJA CRIOLLA 500 G Bx24', bulto: 2, caja: 22, dcho: 11, group: 1, lot: 'LOT-102' }
      ],
      totalBultos: 4,
      totalCajas: 62,
      totalUnidades: 1452,
      pesoTotalKg: 298.0
    },
    {
      id: '4',
      orderNumber: 'PED-00013',
      documentCode: 'REM-FR-2026-0013',
      version: '1.0',
      date: '2026-07-18',
      page: '1 de 2',
      clientName: 'DISTRIBUCIONES ELITE',
      numeral: 'C-041',
      city: 'CALI',
      department: 'VALLE DEL CAUCA',
      phone: '318 567 0458',
      address: 'CARRERA 10 # 15 - 45',
      coordinatorName: 'Luis Coordinador',
      dispatcherName: 'Diana Despacho',
      auxProduction: 'Andrés Producción',
      vehicle: 'AAD-234',
      lotGeneral: 'LOTE-G-004',
      driverName: 'Juan David Gutiérrez',
      driverDocument: '4.567.890.123',
      driverPhone: '313 654 3210',
      dispatchDate: '2026-07-18',
      dispatchTime: '06:00',
      status: 'PENDIENTE',
      items: [
        { item: 1, description: 'TRADICIONAL SURT MIX X 250 UND', bulto: 5, caja: 50, dcho: 25, group: 1, lot: 'LOT-101' },
        { item: 2, description: 'LENTEJA CRIOLLA 500 G Bx24', bulto: 4, caja: 40, dcho: 20, group: 1, lot: 'LOT-102' },
        { item: 3, description: 'ALMENDRA HOLLADA 250 G Bx30', bulto: 3, caja: 30, dcho: 15, group: 2, lot: 'LOT-103' },
        { item: 4, description: 'MAÍZ PIRA TOSTADO 250 G Bx40', bulto: 3, caja: 30, dcho: 15, group: 2, lot: 'LOT-104' },
        { item: 5, description: 'MANÍ SALADO JUMBO 150 G Bx50', bulto: 2, caja: 24, dcho: 12, group: 2, lot: 'LOT-105' }
      ],
      totalBultos: 17,
      totalCajas: 174,
      totalUnidades: 4680,
      pesoTotalKg: 1015.0,
      observations: 'Ruta Cali - Valle, pedido grande'
    },
    {
      id: '5',
      orderNumber: 'PED-00014',
      documentCode: 'REM-FR-2026-0014',
      version: '1.0',
      date: '2026-07-19',
      page: '1 de 1',
      clientName: 'COMERCIALIZADORA JJ',
      numeral: 'C-062',
      city: 'BOGOTÁ',
      department: 'CUNDINAMARCA',
      phone: '301 789 0641',
      address: 'CALLE 100 # 15-20',
      coordinatorName: 'Luis Coordinador',
      dispatcherName: 'Diana Despacho',
      auxProduction: 'Sofía Pedidos',
      vehicle: 'AAE-567',
      lotGeneral: 'LOTE-G-005',
      driverName: 'Fernando Andrés Torres',
      driverDocument: '5.678.901.234',
      driverPhone: '314 543 2109',
      dispatchDate: '2026-07-19',
      dispatchTime: '05:30',
      status: 'CANCELADO',
      items: [
        { item: 1, description: 'NACHO PICANTE 200G X30 UND', bulto: 2, caja: 20, dcho: 10, group: 1, lot: 'LOT-106' },
        { item: 2, description: 'MAÍZ PIRA TOSTADO 250 G Bx40', bulto: 1, caja: 18, dcho: 9, group: 1, lot: 'LOT-104' }
      ],
      totalBultos: 3,
      totalCajas: 38,
      totalUnidades: 990,
      pesoTotalKg: 201.0,
      observations: 'Cancelado por solicitud del cliente, falta de inventario'
    },
    {
      id: '6',
      orderNumber: 'PED-00015',
      documentCode: 'REM-FR-2026-0015',
      version: '1.0',
      date: '2026-07-20',
      page: '1 de 1',
      clientName: 'IBAGUÉ - SANDRA SAENZ',
      numeral: 'C-966',
      city: 'IBAGUÉ',
      department: 'TOLIMA',
      phone: '300 123 4567',
      address: 'CRA 5 # 21 - 45 B/ CENTRO',
      coordinatorName: 'Luis Coordinador',
      dispatcherName: 'Diana Despacho',
      auxProduction: 'Andrés Producción',
      vehicle: 'AAF-890',
      lotGeneral: 'LOTE-G-006',
      driverName: 'Carlos Alberto Ramírez',
      driverDocument: '1.234.567.890',
      driverPhone: '310 987 6543',
      dispatchDate: '2026-07-20',
      dispatchTime: '08:00',
      status: 'ENTREGADO',
      items: [
        { item: 1, description: 'TRADICIONAL SURT MIX X 250 UND', bulto: 3, caja: 32, dcho: 16, group: 1, lot: 'LOT-101' },
        { item: 2, description: 'ALMENDRA HOLLADA 250 G Bx30', bulto: 2, caja: 22, dcho: 11, group: 1, lot: 'LOT-103' },
        { item: 3, description: 'MANÍ SALADO JUMBO 150 G Bx50', bulto: 4, caja: 45, dcho: 22, group: 2, lot: 'LOT-105' }
      ],
      totalBultos: 9,
      totalCajas: 99,
      totalUnidades: 2390,
      pesoTotalKg: 521.5
    },
    {
      id: '7',
      orderNumber: 'PED-00016',
      documentCode: 'REM-FR-2026-0016',
      version: '1.0',
      date: '2026-07-21',
      page: '1 de 1',
      clientName: 'SUPERMERCADO LA 14',
      numeral: 'C-032',
      city: 'IBAGUÉ',
      department: 'TOLIMA',
      phone: '319 456 7890',
      address: 'CALLE 14 # 8-30',
      coordinatorName: 'Luis Coordinador',
      dispatcherName: 'Sofía Pedidos',
      auxProduction: 'Andrés Producción',
      vehicle: 'AAB-456',
      lotGeneral: 'LOTE-G-007',
      driverName: 'José Hernán Patiño',
      driverDocument: '2.345.678.901',
      driverPhone: '311 876 5432',
      dispatchDate: '2026-07-21',
      dispatchTime: '09:30',
      status: 'PENDIENTE',
      items: [
        { item: 1, description: 'LENTEJA CRIOLLA 500 G Bx24', bulto: 3, caja: 28, dcho: 14, group: 1, lot: 'LOT-102' },
        { item: 2, description: 'NACHO PICANTE 200G X30 UND', bulto: 2, caja: 24, dcho: 12, group: 1, lot: 'LOT-106' },
        { item: 3, description: 'MAÍZ PIRA TOSTADO 250 G Bx40', bulto: 1, caja: 18, dcho: 9, group: 1, lot: 'LOT-104' }
      ],
      totalBultos: 6,
      totalCajas: 70,
      totalUnidades: 1752,
      pesoTotalKg: 383.5,
      observations: 'Reabastecimiento semanal'
    }
  ]);

  searchTerm = signal<string>('');

  filteredOrders = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.orders();
    return this.orders().filter(o =>
      o.orderNumber.toLowerCase().includes(term) ||
      o.clientName.toLowerCase().includes(term) ||
      o.status.toLowerCase().includes(term)
    );
  });

  addOrder(newOrder: Omit<Order, 'id'>) {
    const id = (this.orders().length + 1).toString();
    this.orders.update(list => [{ ...newOrder, id }, ...list]);
  }
}
