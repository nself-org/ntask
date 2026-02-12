export type AuthMethod =
  | 'email-password'
  | 'magic-link'
  | 'google'
  | 'github'
  | 'apple'
  | 'facebook'
  | 'id-me';

export interface AuthMethodConfig {
  id: AuthMethod;
  label: string;
  enabled: boolean;
  icon?: string;
}

const DEFAULT_METHODS: AuthMethodConfig[] = [
  { id: 'email-password', label: 'Email & Password', enabled: true },
  { id: 'magic-link', label: 'Magic Link', enabled: false },
  { id: 'google', label: 'Google', enabled: false },
  { id: 'github', label: 'GitHub', enabled: false },
  { id: 'apple', label: 'Apple', enabled: false },
  { id: 'facebook', label: 'Facebook', enabled: false },
  { id: 'id-me', label: 'ID.me', enabled: false },
];

let methodOverrides: Partial<Record<AuthMethod, boolean>> = {};

export function configureAuthMethods(overrides: Partial<Record<AuthMethod, boolean>>): void {
  methodOverrides = { ...methodOverrides, ...overrides };
}

export function getAuthMethods(): AuthMethodConfig[] {
  return DEFAULT_METHODS.map((m) => ({
    ...m,
    enabled: methodOverrides[m.id] ?? m.enabled,
  }));
}

export function getEnabledAuthMethods(): AuthMethodConfig[] {
  return getAuthMethods().filter((m) => m.enabled);
}

export function isMethodEnabled(method: AuthMethod): boolean {
  return methodOverrides[method] ?? DEFAULT_METHODS.find((m) => m.id === method)?.enabled ?? false;
}

export function getSocialMethods(): AuthMethodConfig[] {
  return getEnabledAuthMethods().filter((m) => m.id !== 'email-password' && m.id !== 'magic-link');
}

export function hasEmailPassword(): boolean {
  return isMethodEnabled('email-password');
}

export function hasMagicLink(): boolean {
  return isMethodEnabled('magic-link');
}

export function hasSocialAuth(): boolean {
  return getSocialMethods().length > 0;
}
