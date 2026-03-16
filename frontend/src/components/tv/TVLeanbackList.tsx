'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useTVNavigation } from '@/lib/tv/navigation';

interface TVLeanbackListProps<T> {
  items: T[];
  renderItem: (item: T, focused: boolean, index: number) => ReactNode;
  focusedIndex: number;
  onFocusChange: (index: number) => void;
  onSelect?: (index: number) => void;
  onBack?: () => void;
  className?: string;
}

export function TVLeanbackList<T>({
  items,
  renderItem,
  focusedIndex,
  onFocusChange,
  onSelect,
  onBack,
  className = '',
}: TVLeanbackListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleKeyDown } = useTVNavigation(items.length, focusedIndex, onFocusChange, onSelect, onBack);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`outline-none ${className}`}
      tabIndex={0}
      onKeyDown={handleKeyDown as React.KeyboardEventHandler<HTMLDivElement>}
      role="listbox"
      aria-activedescendant={`tv-item-${focusedIndex}`}
    >
      {items.map((item, index) => (
        <div
          key={index}
          id={`tv-item-${index}`}
          role="option"
          aria-selected={index === focusedIndex}
        >
          {renderItem(item, index === focusedIndex, index)}
        </div>
      ))}
    </div>
  );
}
