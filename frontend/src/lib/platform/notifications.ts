import { isTauri, supportsNotifications } from './index';

export async function requestNotificationPermission(): Promise<boolean> {
  if (isTauri()) return true;

  if (!supportsNotifications()) return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function sendNotification(title: string, options?: NotificationOptions): Promise<void> {
  if (isTauri()) {
    try {
      const notification = await import(/* webpackIgnore: true */ '@tauri-apps/plugin-notification' as string);
      if (notification?.sendNotification) {
        await notification.sendNotification({ title, body: options?.body });
        return;
      }
    } catch { /* not available */ }
  }

  fallbackNotification(title, options);
}

function fallbackNotification(title: string, options?: NotificationOptions): void {
  if (!supportsNotifications()) return;
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}
