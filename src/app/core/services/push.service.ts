import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
}

@Injectable({ providedIn: 'root' })
export class PushService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/push`;

  private subsState = signal<'unsupported' | 'default' | 'granted' | 'denied'>('unsupported');
  private subscribed = signal(false);

  readonly state = this.subsState.asReadonly();
  readonly isSubscribed = this.subscribed.asReadonly();

  readonly available: boolean = environment.production && registryAvailable();

  constructor() {
    this.detectSupport();
  }

  private detectSupport() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }
    const permission = Notification.permission;
    this.subsState.set(permission as 'default' | 'granted' | 'denied');
    if (permission === 'granted') {
      this.checkExistingSubscription();
    }
  }

  private async checkExistingSubscription() {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const sub = await registration?.pushManager.getSubscription();
      this.subscribed.set(!!sub && !!sub.endpoint);
    } catch {
      this.subscribed.set(false);
    }
  }

  async enable(): Promise<boolean> {
    if (!environment.production || !registryAvailable()) {
      return false;
    }
    if (this.subsState() === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    this.subsState.set(permission as 'granted' | 'denied');

    if (permission !== 'granted') {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription: PushSubscription | null = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(environment.vapidPublicKey)
      });
    }

    const payload = this.toPayload(subscription);
    await firstValueFrom(this.sendSubscription(payload));
    this.subscribed.set(true);
    return true;
  }

  async disable(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const sub = await registration?.pushManager.getSubscription();
      if (sub) {
        const payload = this.toPayload(sub);
        await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/subscribe`, {
          params: { endpoint: payload.endpoint }
        }));
        await sub.unsubscribe();
      }
    } catch {
      // ignore: no hay suscripción que eliminar
    }
    this.subscribed.set(false);
  }

  private toPayload(subscription: PushSubscription): PushSubscriptionPayload {
    const key: PushSubscriptionKeys = subscription.toJSON() as unknown as PushSubscriptionKeys;
    return {
      endpoint: subscription.endpoint,
      p256dh: key.p256dh,
      auth: key.auth
    };
  }

  private sendSubscription(payload: PushSubscriptionPayload) {
    return this.http.post<void>(`${this.apiUrl}/subscribe`, payload);
  }

  private urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const base64Url = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64Url);
    const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

function registryAvailable(): boolean {
  return typeof Notification !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}
