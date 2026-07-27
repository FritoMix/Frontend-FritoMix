import { Injectable, signal, computed } from '@angular/core';
import { Driver } from '../models/driver.model';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  drivers = signal<Driver[]>([
    {
      id: '1',
      code: 'CHF-001',
      fullName: 'Carlos Alberto Ramírez Pérez',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '1.234.567.890',
      licenseType: 'C3',
      licenseNumber: 'LIC-C3-12345',
      phone: '310 987 6543',
      email: 'carlos.ramirez@fritomix.com',
      address: 'Carrera 8 # 45-67, Barrio Centenario',
      city: 'IBAGUÉ',
      department: 'TOLIMA',
      birthDate: '1985-03-15',
      hireDate: '2020-01-10',
      active: true,
      avatarInitials: 'CR',
      avatarColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: '2',
      code: 'CHF-002',
      fullName: 'José Hernán Patiño Córdoba',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '2.345.678.901',
      licenseType: 'C3',
      licenseNumber: 'LIC-C3-23456',
      phone: '311 876 5432',
      email: 'jose.patino@fritomix.com',
      address: 'Calle 50 # 12-34, Barrio La Pola',
      city: 'IBAGUÉ',
      department: 'TOLIMA',
      birthDate: '1988-07-22',
      hireDate: '2020-06-15',
      active: true,
      avatarInitials: 'JP',
      avatarColor: 'bg-amber-100 text-amber-700'
    },
    {
      id: '3',
      code: 'CHF-003',
      fullName: 'Edison Stiven Muñoz López',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '3.456.789.012',
      licenseType: 'C2',
      licenseNumber: 'LIC-C2-34567',
      phone: '312 765 4321',
      email: 'edison.munoz@fritomix.com',
      address: 'Avenida Murillo # 89-01, Barrio Venecia',
      city: 'IBAGUÉ',
      department: 'TOLIMA',
      birthDate: '1992-11-08',
      hireDate: '2021-03-20',
      active: true,
      avatarInitials: 'EM',
      avatarColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: '4',
      code: 'CHF-004',
      fullName: 'Juan David Gutiérrez Salinas',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '4.567.890.123',
      licenseType: 'C3',
      licenseNumber: 'LIC-C3-45678',
      phone: '313 654 3210',
      email: 'juan.gutierrez@fritomix.com',
      address: 'Carrera 3 # 22-18, Barrio Belén',
      city: 'CALI',
      department: 'VALLE DEL CAUCA',
      birthDate: '1990-05-30',
      hireDate: '2021-08-05',
      active: true,
      avatarInitials: 'JG',
      avatarColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: '5',
      code: 'CHF-005',
      fullName: 'Fernando Andrés Torres Rodríguez',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '5.678.901.234',
      licenseType: 'C3',
      licenseNumber: 'LIC-C3-56789',
      phone: '314 543 2109',
      email: 'fernando.torres@fritomix.com',
      address: 'Calle 72 # 10-45, Bario Chapinero',
      city: 'BOGOTÁ',
      department: 'CUNDINAMARCA',
      birthDate: '1987-09-12',
      hireDate: '2022-02-14',
      active: true,
      avatarInitials: 'FT',
      avatarColor: 'bg-rose-100 text-rose-700'
    },
    {
      id: '6',
      code: 'CHF-006',
      fullName: 'Diego Armando Quintero Hernández',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '6.789.012.345',
      licenseType: 'C1',
      licenseNumber: 'LIC-C1-67890',
      phone: '315 432 1098',
      email: 'diego.quintero@fritomix.com',
      address: 'Calle 10 # 15-60, Barrio Girardot',
      city: 'IBAGUÉ',
      department: 'TOLIMA',
      birthDate: '1995-12-25',
      hireDate: '2023-04-18',
      active: false,
      avatarInitials: 'DQ',
      avatarColor: 'bg-orange-100 text-orange-700'
    }
  ]);

  searchTerm = signal<string>('');

  filteredDrivers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.drivers();
    return this.drivers().filter(d =>
      d.fullName.toLowerCase().includes(term) ||
      d.documentNumber.includes(term) ||
      d.code.toLowerCase().includes(term) ||
      d.licenseType.toLowerCase().includes(term)
    );
  });

  addDriver(newDriver: Omit<Driver, 'id'>) {
    const id = (this.drivers().length + 1).toString();
    this.drivers.update(list => [{ ...newDriver, id }, ...list]);
  }
}
