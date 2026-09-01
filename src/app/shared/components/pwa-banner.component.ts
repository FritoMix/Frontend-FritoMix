import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Subscription } from 'rxjs';
import { PushService } from '../../core/services/push.service';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-pwa-banner',
  standalone: true,
  template: `
    @if (updateAvailable()) {
      <div class="fixed bottom-0 inset-x-0 z-[9999] px-4 pb-4">
        <div class="max-w-lg mx-auto bg-[#071938] text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 animate-slide-up">
          <div class="shrink-0">
            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold">Nueva versión disponible</p>
            <p class="text-xs text-gray-300 mt-0.5">Actualiza para obtener los últimos cambios</p>
          </div>
          <button
            (click)="applyUpdate()"
            class="shrink-0 bg-[#0055FF] hover:bg-[#0044DD] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors active:scale-95"
          >
            Actualizar
          </button>
          <button
            (click)="updateAvailable.set(false)"
            class="shrink-0 text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    } @else if (notificationPrompt() && !pushEnabled()) {
      <div class="fixed bottom-5 right-5 z-[9999] max-w-xs">
        <div class="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-scale-in origin-bottom-right">
          <div class="flex items-start gap-3">
            <span class="shrink-0 w-10 h-10 rounded-xl bg-[#EBF2FF] flex items-center justify-center">
              <svg class="w-5 h-5 text-[#0055FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-[#071938]">Notificaciones de pedidos</p>
              <p class="text-xs text-gray-500 mt-0.5">Recibe un aviso al instante cuando haya un pedido nuevo por despachar.</p>
            </div>
            <button (click)="notificationPrompt.set(false)" class="shrink-0 text-gray-300 hover:text-gray-500 p-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <button
            (click)="enablePush()"
            class="mt-3 w-full bg-[#0055FF] hover:bg-[#0044DD] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors active:scale-95"
          >
            Activar notificaciones
          </button>
        </div>
      </div>
    } @else if (canInstall()) {
      <div class="fixed bottom-5 right-5 z-[9999]">
        <button
          (click)="install()"
          class="bg-[#071938] hover:bg-[#0D2754] text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl transition-all duration-200 active:scale-95 flex items-center gap-2.5 animate-scale-in origin-bottom-right"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Instalar app
        </button>
      </div>
    }
  `,
  styles: `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);     opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.8); opacity: 0; }
      to   { transform: scale(1);   opacity: 1; }
    }
    .animate-slide-up { animation: slideUp 0.35s ease-out; }
    .animate-scale-in { animation: scaleIn 0.25s ease-out; }
  `
})
export class PwaBannerComponent implements OnInit, OnDestroy {
  private swUpdate = inject(SwUpdate);
  private pushService = inject(PushService);

  updateAvailable = signal(false);
  canInstall = signal(false);
  notificationPrompt = signal(false);
  pushEnabled = this.pushService.isSubscribed;

  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private updateSub: Subscription | null = null;

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.updateSub = this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailable.set(true);
        }
      });
    }

    window.addEventListener('beforeinstallprompt' as string, this.onBeforeInstall as unknown as EventListener);
    window.addEventListener('appinstalled', this.onAppInstalled);

    this.maybeShowNotificationPrompt();
  }

  ngOnDestroy() {
    this.updateSub?.unsubscribe();
    window.removeEventListener('beforeinstallprompt' as string, this.onBeforeInstall as unknown as EventListener);
    window.removeEventListener('appinstalled', this.onAppInstalled);
  }

  private maybeShowNotificationPrompt() {
    if (!this.pushService.available) return;
    if (this.pushEnabled()) return;
    if (this.pushService.state() === 'denied') return;
    this.notificationPrompt.set(true);
  }

  private onBeforeInstall = (e: BeforeInstallPromptEvent) => {
    e.preventDefault();
    this.deferredPrompt = e;
    this.canInstall.set(true);
  };

  private onAppInstalled = () => {
    this.deferredPrompt = null;
    this.canInstall.set(false);
  };

  async enablePush() {
    this.notificationPrompt.set(false);
    await this.pushService.enable();
  }

  async applyUpdate() {
    if (this.swUpdate.isEnabled) {
      await this.swUpdate.activateUpdate();
    }
    window.location.reload();
  }

  async install() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    if (outcome === 'dismissed') {
      this.canInstall.set(false);
    }
    this.deferredPrompt = null;
  }
}
