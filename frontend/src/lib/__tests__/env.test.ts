import { describe, it, expect, afterEach, vi } from 'vitest';

describe('Environment Detection', () => {
  const originalWindow = global.window;
  const originalLocation = global.window?.location;

  afterEach(() => {
    global.window = originalWindow;
    if (originalLocation) {
      Object.defineProperty(global.window, 'location', {
        value: originalLocation,
        writable: true,
      });
    }
    vi.resetModules();
  });

  describe('detectEnvironment', () => {
    it('should detect development environment on localhost', async () => {
      Object.defineProperty(global.window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });

      const { env } = await import('../env');
      expect(env.isDevelopment).toBe(true);
      expect(env.isStaging).toBe(false);
      expect(env.isProduction).toBe(false);
    });

    it('should detect development environment on 127.0.0.1', async () => {
      Object.defineProperty(global.window, 'location', {
        value: { hostname: '127.0.0.1' },
        writable: true,
      });

      const { env } = await import('../env');
      expect(env.isDevelopment).toBe(true);
    });

    it('should detect staging environment', async () => {
      Object.defineProperty(global.window, 'location', {
        value: { hostname: 'staging.example.com' },
        writable: true,
      });

      const { env } = await import('../env');
      expect(env.isStaging).toBe(true);
      expect(env.isDevelopment).toBe(false);
      expect(env.isProduction).toBe(false);
    });

    it('should detect production environment', async () => {
      Object.defineProperty(global.window, 'location', {
        value: { hostname: 'example.com' },
        writable: true,
      });

      const { env } = await import('../env');
      expect(env.isProduction).toBe(true);
      expect(env.isDevelopment).toBe(false);
      expect(env.isStaging).toBe(false);
    });
  });

  describe('Feature Flags', () => {
    it('should enable dev tools in development', async () => {
      Object.defineProperty(global.window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });

      const { env, shouldEnableDevTools } = await import('../env');
      expect(env.enableDevTools).toBe(true);
      expect(shouldEnableDevTools()).toBe(true);
    });

    it('should enable faux-signin only in development', async () => {
      Object.defineProperty(global.window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });

      const { env, shouldEnableFauxSignin } = await import('../env');
      expect(env.enableFauxSignin).toBe(true);
      expect(shouldEnableFauxSignin()).toBe(true);
    });
  });
});
