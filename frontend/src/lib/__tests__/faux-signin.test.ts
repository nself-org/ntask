import { describe, it, expect, vi } from 'vitest';
import {
  getFauxAccounts,
  isFauxAccount,
  getFauxAccountByEmail,
  createFauxSignInCredentials,
  FAUX_ACCOUNTS,
} from '../faux-signin';

vi.mock('../env', () => ({
  shouldEnableFauxSignin: vi.fn(() => true),
}));

describe('Faux Sign-In System', () => {
  describe('FAUX_ACCOUNTS', () => {
    it('should have four test accounts by default', () => {
      expect(FAUX_ACCOUNTS).toHaveLength(4);
    });

    it('should have owner account', () => {
      const owner = FAUX_ACCOUNTS.find((acc) => acc.email === 'owner@nself.org');
      expect(owner).toBeDefined();
      expect(owner?.password).toBe('Owner123!');
      expect(owner?.role).toBe('owner');
    });

    it('should have admin account', () => {
      const admin = FAUX_ACCOUNTS.find((acc) => acc.email === 'admin@nself.org');
      expect(admin).toBeDefined();
      expect(admin?.password).toBe('Admin123!');
      expect(admin?.role).toBe('admin');
    });

    it('should have support account', () => {
      const support = FAUX_ACCOUNTS.find((acc) => acc.email === 'support@nself.org');
      expect(support).toBeDefined();
      expect(support?.password).toBe('Support123!');
      expect(support?.role).toBe('support');
    });

    it('should have user account', () => {
      const user = FAUX_ACCOUNTS.find((acc) => acc.email === 'user@nself.org');
      expect(user).toBeDefined();
      expect(user?.password).toBe('User123!');
      expect(user?.role).toBe('user');
    });
  });

  describe('getFauxAccounts', () => {
    it('should return all faux accounts when enabled', () => {
      const accounts = getFauxAccounts();
      expect(accounts).toHaveLength(4);
    });
  });

  describe('isFauxAccount', () => {
    it('should return true for admin account', () => {
      expect(isFauxAccount('admin@nself.org')).toBe(true);
    });

    it('should return true for owner account', () => {
      expect(isFauxAccount('owner@nself.org')).toBe(true);
    });

    it('should return false for non-faux account', () => {
      expect(isFauxAccount('someone@example.com')).toBe(false);
    });
  });

  describe('getFauxAccountByEmail', () => {
    it('should return account for admin email', () => {
      const account = getFauxAccountByEmail('admin@nself.org');
      expect(account).toBeDefined();
      expect(account?.email).toBe('admin@nself.org');
    });

    it('should return account for owner email', () => {
      const account = getFauxAccountByEmail('owner@nself.org');
      expect(account).toBeDefined();
      expect(account?.email).toBe('owner@nself.org');
      expect(account?.level).toBe(100);
    });

    it('should return null for non-existent email', () => {
      const account = getFauxAccountByEmail('nonexistent@example.com');
      expect(account).toBeNull();
    });
  });

  describe('createFauxSignInCredentials', () => {
    it('should create credentials for admin account', () => {
      const credentials = createFauxSignInCredentials('admin@nself.org');
      expect(credentials).toBeDefined();
      expect(credentials?.email).toBe('admin@nself.org');
      expect(credentials?.password).toBe('Admin123!');
    });

    it('should create credentials for owner account', () => {
      const credentials = createFauxSignInCredentials('owner@nself.org');
      expect(credentials).toBeDefined();
      expect(credentials?.email).toBe('owner@nself.org');
      expect(credentials?.password).toBe('Owner123!');
    });

    it('should return null for non-faux account', () => {
      const credentials = createFauxSignInCredentials('someone@example.com');
      expect(credentials).toBeNull();
    });
  });
});
