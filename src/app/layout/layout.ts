import { Component, computed, inject, signal, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { UserRole } from '../core/models/user.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
  template: `
    <!-- Overlay for mobile sidebar -->
    @if (sidebarOpen()) {
      <div
        class="fixed inset-0 bg-black/40 z-40 lg:hidden"
        (click)="sidebarOpen.set(false)"
      ></div>
    }

    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 h-screen w-[240px] bg-[#47679d] flex flex-col z-50 sidebar-transition sidebar-scroll"
      [class.-translate-x-full]="!sidebarOpen()"
      [class.translate-x-0]="sidebarOpen()"
      [class.lg:translate-x-0]="true"
    >
      <!-- Logo Section -->
      <div class="px-5 pt-6 pb-5 flex flex-col items-center border-b border-white/10">
        
        <h2 class="text-white font-extrabold text-lg tracking-wide">FritoMix S.A.S</h2>
        <p class="text-gray-400 text-[15px] mt-0.5">Gestión de Ventas <br> y Despachos</p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto sidebar-scroll">
        @for (item of filteredNavItems(); track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="nav-item-active"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 text-[13px] font-medium hover:bg-white/8 transition-all duration-200 group"
            (click)="closeSidebarOnMobile()"
          >
            <span class="w-5 h-5 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity" [innerHTML]="item.icon"></span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- Logout -->
      <div class="px-3 pb-5 border-t border-white/10 pt-3">
        <button
          (click)="logout()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 text-[13px] font-medium hover:bg-white/8 hover:text-gray-200 transition-all duration-200 w-full"
        >
          <span class="w-5 h-5 flex items-center justify-center">
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="lg:ml-[240px] min-h-screen flex flex-col">
      <!-- Header -->
      <header class="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Hamburger (mobile) -->
          <button
            (click)="sidebarOpen.set(!sidebarOpen())"
            class="text-gray-500 hover:text-gray-700 lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <!-- Company info -->
          <div class="flex items-center gap-1.5">
            <img src="logo-fritomix.png" alt="FritoMix" class="w-30 h-20 object-contain" />
            
          </div>
        </div>

        <div class="flex items-center gap-4">
          <!-- Notifications -->
          <div class="relative" (click)="$event.stopPropagation()">
            <button
              (click)="toggleNotifications()"
              class="relative text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              @if (notificationUnread() > 0) {
                <span class="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-blue-500 border-radius-5px rounded-full text-[10px] text-white flex items-center justify-center font-bold ring-2 ring-white">{{ notificationUnread() > 99 ? '99+' : notificationUnread() }}</span>
              }
            </button>

            <!-- Notification Dropdown -->
            @if (showNotifications()) {
              <div class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 flex flex-col">
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 class="text-sm font-bold text-gray-800">Notificaciones</h3>
                  @if (notifications().length > 0) {
                    <button (click)="markAllRead()" class="text-xs text-blue-600 hover:text-blue-700 font-medium">Marcar todas leídas</button>
                  }
                </div>
                <div class="overflow-y-auto flex-1">
                  @if (notifications().length === 0) {
                    <div class="px-4 py-8 text-center text-gray-400 text-sm">Sin notificaciones</div>
                  }
                  @for (n of notifications(); track n.id) {
                    <div
                      class="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      [class.bg-blue-50]="!n.isRead"
                      (click)="markOneRead(n)"
                    >
                      <div class="flex items-start gap-2">
                        <span class="mt-0.5 shrink-0">
                          @if (n.type === 'SUCCESS') {
                            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          } @else if (n.type === 'WARNING') {
                            <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                          } @else if (n.type === 'ERROR') {
                            <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          } @else {
                            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          }
                        </span>
                        <div class="min-w-0">
                          <p class="text-sm font-semibold text-gray-800 truncate">{{ n.title }}</p>
                          <p class="text-xs text-gray-500 line-clamp-2">{{ n.message }}</p>
                          <p class="text-[10px] text-gray-400 mt-1">{{ n.createdAt | date:'short' }}</p>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- User Dropdown -->
          <div class="relative" (click)="$event.stopPropagation()">
            <div
              (click)="toggleUserMenu()"
              class="flex items-center gap-2.5 cursor-pointer pl-3 border-l border-gray-200 select-none"
            >
              <div class="w-10 h-10 rounded-full bg-[#47679d] flex items-center justify-center text-white text-sm font-bold">
                {{ user()?.avatarInitials || 'AD' }}
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-semibold text-gray-800 leading-tight">{{ user()?.name || 'Administrador' }}</p>
                <p class="text-[11px] text-gray-500">{{ user()?.email || 'admin@fritomix.com' }}</p>
              </div>
              <svg class="w-4 h-4 text-gray-400 hidden sm:block transition-transform" [class.rotate-180]="showUserMenu()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>

            @if (showUserMenu()) {
              <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-1">
                <a routerLink="/mi-perfil" (click)="showUserMenu.set(false)" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  Mi Perfil
                </a>
                <a routerLink="/configuracion" (click)="showUserMenu.set(false)" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Configuración
                </a>
                <hr class="my-1 border-gray-100">
                <button (click)="logout()" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  Cerrar sesión
                </button>
              </div>
            }
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 sm:p-6 bg-[#F8FAFC]">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .nav-item-active {
      background-color: #0055FF !important;
      color: white !important;
    }
    .nav-item-active span {
      opacity: 1 !important;
    }
  `]
})
export class LayoutComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private notificationService = inject(NotificationService);

  user = this.auth.currentUser;
  sidebarOpen = signal(false);
  showNotifications = signal(false);
  showUserMenu = signal(false);
  notifications = signal<any[]>([]);
  notificationUnread = this.notificationService.unreadCount;

  @HostListener('document:click')
  closeDropdowns() {
    this.showNotifications.set(false);
    this.showUserMenu.set(false);
  }

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.notificationService.startPolling();
    }
  }

  toggleNotifications() {
    this.showUserMenu.set(false);
    const next = !this.showNotifications();
    this.showNotifications.set(next);
    if (next) {
      this.notificationService.findAll().subscribe(n => this.notifications.set(n));
    }
  }

  toggleUserMenu() {
    this.showNotifications.set(false);
    this.showUserMenu.set(!this.showUserMenu());
  }

  markOneRead(n: any) {
    if (n.link) {
      this.router.navigate([n.link]);
    }
    if (!n.isRead) {
      this.notificationService.markAsRead(n.id).subscribe(() => {
        n.isRead = true;
        this.notificationService.loadUnreadCount();
      });
    }
    this.showNotifications.set(false);
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
      this.notificationService.loadUnreadCount();
    });
  }

  private navItems = [
    { path: '/dashboard',     label: 'Dashboard',     icon: this.sanitize('<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>'), exact: true, roles: ['admin','cartera','coordinador','despachador'] as UserRole[] },
    { path: '/clientes',      label: 'Clientes',      icon: this.sanitize('<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>'), exact: false, roles: ['admin','coordinador'] as UserRole[] },
    { path: '/productos',     label: 'Productos',     icon: this.sanitize('<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>'), exact: false, roles: ['admin','cartera','coordinador'] as UserRole[] },
    { path: '/pedidos',       label: 'Pedidos',       icon: this.sanitize('<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>'), exact: false, roles: ['admin','cartera','coordinador'] as UserRole[] },
    { path: '/despachos',     label: 'Despachos',     icon: this.sanitize('<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>'), exact: false, roles: ['admin','cartera','coordinador','despachador'] as UserRole[] },
    { path: '/conductores',   label: 'Conductores',   icon: this.sanitize('<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>'), exact: false, roles: ['admin','despachador'] as UserRole[] },
    { path: '/vehiculos',     label: 'Vehículos',     icon: this.sanitize('<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 01-4 0zM3 9h1l2-4h8l2 4h5v4h-1m-16 0h16"/></svg>'), exact: false, roles: ['admin','despachador'] as UserRole[] },
    { path: '/reportes',      label: 'Reportes',      icon: this.sanitize('<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>'), exact: false, roles: ['admin','cartera','coordinador'] as UserRole[] },
    { path: '/usuarios',      label: 'Usuarios',      icon: this.sanitize('<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>'), exact: false, roles: ['admin'] as UserRole[] },
    { path: '/roles',         label: 'Roles',         icon: this.sanitize('<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>'), exact: false, roles: ['admin'] as UserRole[] },
    { path: '/configuracion', label: 'Configuración', icon: this.sanitize('<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'), exact: false, roles: ['admin'] as UserRole[] },
  ];

  private sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  filteredNavItems = computed(() => {
    const role = this.user()?.role;
    if (!role) return [];
    return this.navItems.filter(item => item.roles.includes(role));
  });

  closeSidebarOnMobile() {
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }

  logout() {
    this.auth.logout();
  }
}
