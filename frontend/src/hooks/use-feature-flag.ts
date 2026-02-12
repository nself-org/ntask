'use client';

import { useState, useEffect } from 'react';
import { getFlag, isEnabled, loadFlagOverrides, type FlagValue } from '@/lib/feature-flags';

export { type FlagValue } from '@/lib/feature-flags';

export function useFeatureFlag<T extends FlagValue = boolean>(name: string, fallback?: T): T {
  const [value, setValue] = useState<T>(() => {
    loadFlagOverrides();
    return getFlag<T>(name, fallback);
  });

  useEffect(() => {
    loadFlagOverrides();
    setValue(getFlag<T>(name, fallback));
  }, [name, fallback]);

  return value;
}

export function useIsFeatureEnabled(name: string): boolean {
  const [enabled, setEnabled] = useState(() => {
    loadFlagOverrides();
    return isEnabled(name);
  });

  useEffect(() => {
    loadFlagOverrides();
    setEnabled(isEnabled(name));
  }, [name]);

  return enabled;
}
