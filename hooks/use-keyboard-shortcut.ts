'use client';

import { useEffect, useRef } from 'react';

interface ShortcutOptions {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {},
): void {
  const { ctrl, shift, alt, meta, enabled = true, preventDefault = true } = options;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      if (ctrl && !e.ctrlKey && !e.metaKey) return;
      if (shift && !e.shiftKey) return;
      if (alt && !e.altKey) return;
      if (meta && !e.metaKey) return;

      if (e.key.toLowerCase() === key.toLowerCase()) {
        if (preventDefault) e.preventDefault();
        callbackRef.current(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, ctrl, shift, alt, meta, enabled, preventDefault]);
}
