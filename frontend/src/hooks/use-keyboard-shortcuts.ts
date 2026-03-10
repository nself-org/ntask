'use client';

import { useEffect, useCallback } from 'react';

type ShortcutHandler = (e: KeyboardEvent) => void;

export interface Shortcut {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  description: string;
  handler: ShortcutHandler;
}

/**
 * Returns true when the event target is an interactive element
 * where key presses should not trigger global shortcuts.
 */
function isInputTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  );
}

/**
 * Register global keyboard shortcuts.
 *
 * Shortcuts with meta/ctrl modifiers always fire regardless of input focus.
 * Bare-key shortcuts (no modifiers) are suppressed when an input has focus.
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const metaMatch = shortcut.meta ? (e.metaKey || e.ctrlKey) : true;
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : true;
        const shiftMatch = shortcut.shift ? e.shiftKey : true;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        // Only block input-focus interference for bare-key shortcuts
        const hasMod = shortcut.meta || shortcut.ctrl || shortcut.shift;
        if (!hasMod && isInputTarget(e)) continue;

        if (keyMatch && metaMatch && ctrlMatch && shiftMatch) {
          shortcut.handler(e);
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
