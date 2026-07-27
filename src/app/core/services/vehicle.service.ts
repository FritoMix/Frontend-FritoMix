import { Injectable, signal, computed } from '@angular/core';
import { Vehicle } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  vehicles = signal<Vehicle[]>([
    {
      id: '1',
      code: 'VEH-001',
      plate: 'ABC-123',
      brand: 'Hino',
      model: 'FD 1J',
      year: 2020,
      vehicleType: 'CAMIÓN',
      color: 'Blanco',
      chassisNumber: 'JHDFD1JEXKX001234',
      engineNumber: 'J08E-UV12345',
      capacityKg: 8000,
      capacityUnits: 60,
      soatExpiration: '2026-12-15',
      tecnomecanicaExpiration: '2026-10-20',
      insuranceCompany: 'Seguros Bolívar',
      policyNumber: 'POL-BOL-2026-98765',
      active: true
    },
    {
      id: '2',
      code: 'VEH-002',
      plate: 'AAB-456',
      brand: 'Isuzu',
      model: 'NLR 85K',
      year: 2021,
      vehicleType: 'FURGÓN',
      color: 'Rojo',
      chassisNumber: 'JAMKP34G5M7005678',
      engineNumber: '4JJ1-UV56789',
      capacityKg: 4500,
      capacityUnits: 35,
      soatExpiration: '2026-11-10',
      tecnomecanicaExpiration: '2026-09-05',
      insuranceCompany: 'Axa Colpatria',
      policyNumber: 'POL-AXA-2026-54321',
      active: true
    },
    {
      id: '3',
      code: 'VEH-003',
      plate: 'AAC-789',
      brand: 'Toyota',
      model: 'Hilux 2.8',
      year: 2022,
      vehicleType: 'CAMIONETA',
      color: 'Gris Plata',
      chassisNumber: 'MR0HX8CD1N0089012',
      engineNumber: '1GD-UV90123',
      capacityKg: 1200,
      capacityUnits: 12,
      soatExpiration: '2027-01-25',
      tecnomecanicaExpiration: '2026-12-18',
      insuranceCompany: 'Allianz',
      policyNumber: 'POL-ALL-2026-11223',
      active: true
    },
    {
      id: '4',
      code: 'VEH-004',
      plate: 'AAD-234',
      brand: 'Kenworth',
      model: 'K370',
      year: 2019,
      vehicleType: 'CAMIÓN',
      color: 'Azul Marino',
      chassisNumber: '2NKHHM7X1KM456789',
      engineNumber: 'PACCAR-PX-45678',
      capacityKg: 12000,
      capacityUnits: 80,
      soatExpiration: '2026-09-30',
      tecnomecanicaExpiration: '2026-08-22',
      insuranceCompany: 'Seguros Bolívar',
      policyNumber: 'POL-BOL-2026-44556',
      active: true
    },
    {
      id: '5',
      code: 'VEH-005',
      plate: 'AAE-567',
      brand: 'Hyundai',
      model: 'HD 72',
      year: 2020,
      vehicleType: 'FURGÓN',
      color: 'Verde',
      chassisNumber: 'KMFFG5C12LC023456',
      engineNumber: 'D4DD-UV23456',
      capacityKg: 5000,
      capacityUnits: 40,
      soatExpiration: '2026-10-12',
      tecnomecanicaExpiration: '2026-11-08',
      insuranceCompany: 'Mapfre',
      policyNumber: 'POL-MAP-2026-77889',
      active: true
    },
    {
      id: '6',
      code: 'VEH-006',
      plate: 'AAF-890',
      brand: 'Chevrolet',
      model: 'NPR 816',
      year: 2021,
      vehicleType: 'FURGÓN',
      color: 'Amarillo',
      chassisNumber: 'MBAPW8BG1MM111222',
      engineNumber: '4HE1-UV11222',
      capacityKg: 6000,
      capacityUnits: 45,
      soatExpiration: '2027-02-14',
      tecnomecanicaExpiration: '2026-12-30',
      insuranceCompany: 'Axa Colpatria',
      policyNumber: 'POL-AXA-2026-33445',
      active: false
    }
  ]);

  searchTerm = signal<string>('');

  filteredVehicles = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.vehicles();
    return this.vehicles().filter(v =>
      v.plate.toLowerCase().includes(term) ||
      v.brand.toLowerCase().includes(term) ||
      v.model.toLowerCase().includes(term) ||
      v.vehicleType.toLowerCase().includes(term)
    );
  });

  addVehicle(newVehicle: Omit<Vehicle, 'id'>) {
    const id = (this.vehicles().length + 1).toString();
    this.vehicles.update(list => [{ ...newVehicle, id }, ...list]);
  }
}
