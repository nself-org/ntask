import { config } from '@/lib/config';

export function detectPlatform(): 'web' | 'desktop' | 'mobile' {
  if (typeof window === 'undefined') return 'web';

  if (typeof (window as unknown as Record<string, unknown>).__TAURI__ !== 'undefined') return 'desktop';

  const ua = navigator.userAgent.toLowerCase();
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) return 'mobile';

  return config.platform;
}

export function isTauri(): boolean {
  return typeof window !== 'undefined' && typeof (window as unknown as Record<string, unknown>).__TAURI__ !== 'undefined';
}

export function supportsNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function supportsServiceWorker(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

export function supportsIndexedDB(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

export function getViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
}

export function isSmallScreen(): boolean {
  return getViewportSize().width < 768;
}

export function isMediumScreen(): boolean {
  const w = getViewportSize().width;
  return w >= 768 && w < 1024;
}

export function isLargeScreen(): boolean {
  return getViewportSize().width >= 1024;
}
