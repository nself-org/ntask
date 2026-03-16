import { KeyboardEvent, useCallback } from 'react';

export const TVKey = {
  UP: ['ArrowUp', 'DpadUp'],
  DOWN: ['ArrowDown', 'DpadDown'],
  LEFT: ['ArrowLeft', 'DpadLeft'],
  RIGHT: ['ArrowRight', 'DpadRight'],
  SELECT: ['Enter', 'DpadCenter', ' '],
  BACK: ['Escape', 'GoBack'],
  PLAY_PAUSE: ['MediaPlayPause'],
} as const;

export function isTVKey(key: string, action: keyof typeof TVKey): boolean {
  return (TVKey[action] as readonly string[]).includes(key);
}

export function useTVNavigation(
  itemCount: number,
  focusedIndex: number,
  setFocusedIndex: (index: number) => void,
  onSelect?: (index: number) => void,
  onBack?: () => void
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isTVKey(e.key, 'UP')) {
        e.preventDefault();
        setFocusedIndex(Math.max(0, focusedIndex - 1));
      } else if (isTVKey(e.key, 'DOWN')) {
        e.preventDefault();
        setFocusedIndex(Math.min(itemCount - 1, focusedIndex + 1));
      } else if (isTVKey(e.key, 'SELECT')) {
        e.preventDefault();
        onSelect?.(focusedIndex);
      } else if (isTVKey(e.key, 'BACK')) {
        e.preventDefault();
        onBack?.();
      }
    },
    [itemCount, focusedIndex, setFocusedIndex, onSelect, onBack]
  );

  return { handleKeyDown };
}

export function useTVGrid(
  cols: number,
  rows: number,
  focusedIndex: number,
  setFocusedIndex: (index: number) => void,
  onSelect?: (index: number) => void
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const row = Math.floor(focusedIndex / cols);
      const col = focusedIndex % cols;
      const total = cols * rows;

      if (isTVKey(e.key, 'UP') && row > 0) {
        e.preventDefault();
        setFocusedIndex(focusedIndex - cols);
      } else if (isTVKey(e.key, 'DOWN') && row < rows - 1) {
        e.preventDefault();
        setFocusedIndex(Math.min(total - 1, focusedIndex + cols));
      } else if (isTVKey(e.key, 'LEFT') && col > 0) {
        e.preventDefault();
        setFocusedIndex(focusedIndex - 1);
      } else if (isTVKey(e.key, 'RIGHT') && col < cols - 1) {
        e.preventDefault();
        setFocusedIndex(Math.min(total - 1, focusedIndex + 1));
      } else if (isTVKey(e.key, 'SELECT')) {
        e.preventDefault();
        onSelect?.(focusedIndex);
      }
    },
    [cols, rows, focusedIndex, setFocusedIndex, onSelect]
  );

  return { handleKeyDown };
}
