import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export interface SharePayload {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

export async function canShare(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  const { value } = await Share.canShare();
  return value;
}

export async function shareTask(payload: SharePayload): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
        dialogTitle: payload.dialogTitle ?? 'Share task',
      });
    } else {
      // Web Share API fallback
      if (navigator.share) {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          url: payload.url,
        });
      } else {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}
