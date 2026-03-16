import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = () => Capacitor.isNativePlatform();

export const haptic = {
  /** Light tap — for selection, toggles */
  light: () => isNative() && Haptics.impact({ style: ImpactStyle.Light }),

  /** Medium tap — for button presses */
  medium: () => isNative() && Haptics.impact({ style: ImpactStyle.Medium }),

  /** Heavy tap — for destructive actions */
  heavy: () => isNative() && Haptics.impact({ style: ImpactStyle.Heavy }),

  /** Success pattern — for task completion */
  success: () => isNative() && Haptics.notification({ type: NotificationType.Success }),

  /** Warning pattern — for deadlines approaching */
  warning: () => isNative() && Haptics.notification({ type: NotificationType.Warning }),

  /** Error pattern — for failed actions */
  error: () => isNative() && Haptics.notification({ type: NotificationType.Error }),

  /** Selection changed — for list navigation */
  selection: () => isNative() && Haptics.selectionChanged(),
};
