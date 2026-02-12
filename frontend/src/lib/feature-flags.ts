export type FlagValue = boolean | string | number;

const defaultFlags: Record<string, FlagValue> = {};
let overrides: Record<string, FlagValue> = {};

export function defineFlags(flags: Record<string, FlagValue>): void {
  Object.assign(defaultFlags, flags);
}

export function setFlagOverride(name: string, value: FlagValue): void {
  overrides[name] = value;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('feature-flags', JSON.stringify(overrides));
    } catch { /* storage unavailable */ }
  }
}

export function clearFlagOverrides(): void {
  overrides = {};
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('feature-flags');
    } catch { /* storage unavailable */ }
  }
}

export function loadFlagOverrides(): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem('feature-flags');
    if (stored) overrides = JSON.parse(stored);
  } catch { /* parse error */ }
}

export function getFlag<T extends FlagValue = boolean>(name: string, fallback?: T): T {
  if (name in overrides) return overrides[name] as T;
  if (name in defaultFlags) return defaultFlags[name] as T;
  return (fallback ?? false) as T;
}

export function isEnabled(name: string): boolean {
  return getFlag<boolean>(name, false);
}

export function getAllFlags(): Record<string, FlagValue> {
  return { ...defaultFlags, ...overrides };
}
