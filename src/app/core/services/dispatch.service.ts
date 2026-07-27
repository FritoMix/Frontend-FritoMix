import { Injectable, signal, computed } from '@angular/core';
import { Dispatch } from '../models/dispatch.model';

@Injectable({
  providedIn: 'root'
})
export class DispatchService {
  dispatches = signal<Dispatch[]>([
    {
      id: '1',
      dispatchNumber: 'DESP-0001',
      orderNumber: 'PED-00010',
      dispatchDate: '2026-07-15',
      dispatchTime: '08:20',
      driverName: 'Carlos Alberto Ramírez Pérez',
      driverDocument: '1.234.567.890',
      driverPhone: '310 987 6543',
      vehiclePlate: 'ABC-123',
      vehicleType: 'CAMIÓN',
      helperName: 'Wilson Andrés Salas',
      route: 'Ibagué - Centro',
      estimatedArrival: '2026-07-15 09:30',
      checklist: [
        { name: 'Documentos OK', checked: true },
        { name: 'Combustible', checked: true, observations: 'Tanque full' },
        { name: 'Luces', checked: true },
        { name: 'Frenos', checked: true },
        { name: 'Neumáticos', checked: true },
        { name: 'Carga asegurada', checked: true },
        { name: 'GPS', checked: true },
        { name: 'Extintor', checked: true }
      ],
      status: 'FINALIZADO',
      departureKm: 125480,
      arrivalKm: 125532,
      fuelLiters: 12,
      createdBy: 'Diana Despacho',
      approvedBy: 'Luis Coordinador',
      observations: 'Entrega realizada sin novedades'
    },
    {
      id: '2',
      dispatchNumber: 'DESP-0002',
      orderNumber: 'PED-00011',
      dispatchDate: '2026-07-16',
      dispatchTime: '09:00',
      driverName: 'José Hernán Patiño Córdoba',
      driverDocument: '2.345.678.901',
      driverPhone: '311 876 5432',
      vehiclePlate: 'AAB-456',
      vehicleType: 'FURGÓN',
      helperName: 'Johan Sebastián Ortiz',
      route: 'Ibagué - Norte',
      estimatedArrival: '2026-07-16 10:00',
      checklist: [
        { name: 'Documentos OK', checked: true },
        { name: 'Combustible', checked: true },
        { name: 'Luces', checked: true },
        { name: 'Frenos', checked: true },
        { name: 'Neumáticos', checked: true },
        { name: 'Carga asegurada', checked: true },
        { name: 'GPS', checked: true },
        { name: 'Extintor', checked: true }
      ],
      status: 'EN RUTA',
      departureKm: 98234,
      fuelLiters: 8,
      createdBy: 'Diana Despacho',
      approvedBy: 'Luis Coordinador'
    },
    {
      id: '3',
      dispatchNumber: 'DESP-0003',
      orderNumber: 'PED-00012',
      dispatchDate: '2026-07-17',
      dispatchTime: '07:30',
      driverName: 'Edison Stiven Muñoz López',
      driverDocument: '3.456.789.012',
      driverPhone: '312 765 4321',
      vehiclePlate: 'AAC-789',
      vehicleType: 'CAMIONETA',
      route: 'Ibagué - Sur',
      estimatedArrival: '2026-07-17 08:30',
      checklist: [
        { name: 'Documentos OK', checked: true },
        { name: 'Combustible', checked: true },
        { name: 'Luces', checked: true },
        { name: 'Frenos', checked: false, observations: 'Revisar frenos traseros' },
        { name: 'Neumáticos', checked: true },
        { name: 'Carga asegurada', checked: false },
        { name: 'GPS', checked: true },
        { name: 'Extintor', checked: true }
      ],
      status: 'EN REVISIÓN',
      createdBy: 'Sofía Pedidos',
      observations: 'Pendiente aprobar checklist de seguridad'
    },
    {
      id: '4',
      dispatchNumber: 'DESP-0004',
      orderNumber: 'PED-00013',
      dispatchDate: '2026-07-18',
      dispatchTime: '05:45',
      driverName: 'Juan David Gutiérrez Salinas',
      driverDocument: '4.567.890.123',
      driverPhone: '313 654 3210',
      vehiclePlate: 'AAD-234',
      vehicleType: 'CAMIÓN',
      helperName: 'Carlos Felipe Montaño',
      route: 'Ibagué - Cali',
      estimatedArrival: '2026-07-18 11:00',
      checklist: [
        { name: 'Documentos OK', checked: false },
        { name: 'Combustible', checked: false },
        { name: 'Luces', checked: false },
        { name: 'Frenos', checked: false },
        { name: 'Neumáticos', checked: false },
        { name: 'Carga asegurada', checked: false },
        { name: 'GPS', checked: false },
        { name: 'Extintor', checked: false }
      ],
      status: 'PENDIENTE',
      createdBy: 'Diana Despacho'
    },
    {
      id: '5',
      dispatchNumber: 'DESP-0005',
      orderNumber: 'PED-00015',
      dispatchDate: '2026-07-20',
      dispatchTime: '07:50',
      driverName: 'Carlos Alberto Ramírez Pérez',
      driverDocument: '1.234.567.890',
      driverPhone: '310 987 6543',
      vehiclePlate: 'AAF-890',
      vehicleType: 'FURGÓN',
      helperName: 'Wilson Andrés Salas',
      route: 'Ibagué - Centro',
      estimatedArrival: '2026-07-20 09:00',
      checklist: [
        { name: 'Documentos OK', checked: true },
        { name: 'Combustible', checked: true, observations: 'Tanque al 80%' },
        { name: 'Luces', checked: true },
        { name: 'Frenos', checked: true },
        { name: 'Neumáticos', checked: true },
        { name: 'Carga asegurada', checked: true },
        { name: 'GPS', checked: true },
        { name: 'Extintor', checked: true }
      ],
      status: 'FINALIZADO',
      departureKm: 126200,
      arrivalKm: 126258,
      fuelLiters: 10,
      createdBy: 'Diana Despacho',
      approvedBy: 'Luis Coordinador',
      observations: 'Entrega exitosa, cliente satisfecho'
    },
    {
      id: '6',
      dispatchNumber: 'DESP-0006',
      orderNumber: 'PED-00014',
      dispatchDate: '2026-07-19',
      dispatchTime: '05:15',
      driverName: 'Fernando Andrés Torres Rodríguez',
      driverDocument: '5.678.901.234',
      driverPhone: '314 543 2109',
      vehiclePlate: 'AAE-567',
      vehicleType: 'FURGÓN',
      route: 'Ibagué - Bogotá',
      estimatedArrival: '2026-07-19 13:00',
      checklist: [
        { name: 'Documentos OK', checked: true },
        { name: 'Combustible', checked: true },
        { name: 'Luces', checked: true },
        { name: 'Frenos', checked: true },
        { name: 'Neumáticos', checked: true },
        { name: 'Carga asegurada', checked: true },
        { name: 'GPS', checked: true },
        { name: 'Extintor', checked: true }
      ],
      status: 'CANCELADO',
      createdBy: 'Diana Despacho',
      approvedBy: 'Luis Coordinador',
      observations: 'Cancelado por cancelación del pedido asociado'
    }
  ]);

  searchTerm = signal<string>('');

  filteredDispatches = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.dispatches();
    return this.dispatches().filter(d =>
      d.dispatchNumber.toLowerCase().includes(term) ||
      d.orderNumber.toLowerCase().includes(term) ||
      d.driverName.toLowerCase().includes(term) ||
      d.vehiclePlate.toLowerCase().includes(term) ||
      d.status.toLowerCase().includes(term)
    );
  });

  addDispatch(newDispatch: Omit<Dispatch, 'id'>) {
    const id = (this.dispatches().length + 1).toString();
    this.dispatches.update(list => [{ ...newDispatch, id }, ...list]);
  }
}
