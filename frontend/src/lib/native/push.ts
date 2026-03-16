import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface PushToken {
  value: string;
  platform: 'ios' | 'android' | 'web';
}

class PushService {
  private initialized = false;

  async init(): Promise<PushToken | null> {
    if (!Capacitor.isNativePlatform()) return null;
    if (this.initialized) return null;

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return null;

    await PushNotifications.register();
    this.initialized = true;

    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token) => {
        resolve({
          value: token.value,
          platform: Capacitor.getPlatform() as 'ios' | 'android',
        });
      });
      PushNotifications.addListener('registrationError', () => resolve(null));
    });
  }

  async scheduleLocal(title: string, body: string, delayMs: number, id?: number): Promise<void> {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: id ?? Math.floor(Math.random() * 1000000),
          title,
          body,
          schedule: { at: new Date(Date.now() + delayMs) },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  }

  async cancelLocal(id: number): Promise<void> {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  }

  addListener(
    event: 'pushNotificationReceived' | 'pushNotificationActionPerformed',
    handler: (notification: unknown) => void
  ) {
    return PushNotifications.addListener(event as Parameters<typeof PushNotifications.addListener>[0], handler as never);
  }

  removeAllListeners(): Promise<void> {
    return PushNotifications.removeAllListeners();
  }
}

export const pushService = new PushService();
