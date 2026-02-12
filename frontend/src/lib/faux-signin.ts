import { shouldEnableFauxSignin } from './env';
import type { SignInCredentials } from './types/backend';

export interface FauxAccount {
  email: string;
  password: string;
  displayName: string;
  description: string;
  role: string;
  level: number;
}

export const FAUX_ACCOUNTS: FauxAccount[] = [
  {
    email: 'owner@nself.org',
    password: 'Owner123!',
    displayName: 'System Owner',
    description: 'Full system access, cannot be modified',
    role: 'owner',
    level: 100,
  },
  {
    email: 'admin@nself.org',
    password: 'Admin123!',
    displayName: 'Administrator',
    description: 'Administrative access',
    role: 'admin',
    level: 90,
  },
  {
    email: 'support@nself.org',
    password: 'Support123!',
    displayName: 'Support Agent',
    description: 'Support team access',
    role: 'support',
    level: 50,
  },
  {
    email: 'user@nself.org',
    password: 'User123!',
    displayName: 'Demo User',
    description: 'Standard user access',
    role: 'user',
    level: 10,
  },
];

export function getFauxAccounts(): FauxAccount[] {
  if (!shouldEnableFauxSignin()) {
    return [];
  }
  return FAUX_ACCOUNTS;
}

export function isFauxAccount(email: string): boolean {
  if (!shouldEnableFauxSignin()) {
    return false;
  }
  return FAUX_ACCOUNTS.some((account) => account.email === email);
}

export function getFauxAccountByEmail(email: string): FauxAccount | null {
  if (!shouldEnableFauxSignin()) {
    return null;
  }
  return FAUX_ACCOUNTS.find((account) => account.email === email) || null;
}

export function createFauxSignInCredentials(email: string): SignInCredentials | null {
  const account = getFauxAccountByEmail(email);
  if (!account) {
    return null;
  }
  return {
    email: account.email,
    password: account.password,
  };
}
