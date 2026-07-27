import { Injectable, signal, computed } from '@angular/core';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  clients = signal<Client[]>([
    {
      id: '1',
      code: 'C-966',
      name: 'IBAGUÉ - SANDRA SAENZ',
      taxId: '1.234.567.890-0',
      department: 'TOLIMA',
      city: 'IBAGUÉ',
      address: 'CRA 5 # 21 - 45 B/ CENTRO',
      phone: '300 123 4567',
      email: 'sandra.saenz@gmail.com',
      active: true,
      numeral: 'C-966'
    },
    {
      id: '2',
      code: 'C-032',
      name: 'SUPERMERCADO LA 14',
      taxId: '900.456.780-1',
      department: 'TOLIMA',
      city: 'IBAGUÉ',
      address: 'CALLE 14 # 8-30',
      phone: '319 456 7890',
      email: 'compras@la14ibague.com',
      active: true
    },
    {
      id: '3',
      code: 'C-048',
      name: 'TIENDA EL AHORRO',
      taxId: '1.002.964.532-1',
      department: 'TOLIMA',
      city: 'IBAGUÉ',
      address: 'AV. AMBALA # 45-12',
      phone: '320 654 3210',
      email: 'contacto@tiendaelahorro.com',
      active: true
    },
    {
      id: '4',
      code: 'C-041',
      name: 'DISTRIBUCIONES ELITE',
      taxId: '900.111.223-7',
      department: 'VALLE DEL CAUCA',
      city: 'CALI',
      address: 'CARRERA 10 # 15 - 45',
      phone: '318 567 0458',
      email: 'ventas@distribucioneselite.com',
      active: false
    },
    {
      id: '5',
      code: 'C-062',
      name: 'COMERCIALIZADORA JJ',
      taxId: '800.654.321-9',
      department: 'CUNDINAMARCA',
      city: 'BOGOTÁ',
      address: 'CALLE 100 # 15-20',
      phone: '301 789 0641',
      email: 'contacto@comercializadorajj.com',
      active: true
    }
  ]);

  searchTerm = signal<string>('');

  filteredClients = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.clients();
    return this.clients().filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      c.taxId.includes(term) ||
      c.city.toLowerCase().includes(term)
    );
  });

  addClient(newClient: Omit<Client, 'id'>) {
    const id = (this.clients().length + 1).toString();
    this.clients.update(list => [{ ...newClient, id }, ...list]);
  }
}
